import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { DEFAULT_DATA } from "../src/data/defaultData.js";
import { validateVerbData } from "../src/data/validation.js";
import { validateLearningContent } from "../src/data/learningContentValidation.js";
import { buildProgressBackup, validateProgressBackup } from "../src/progressBackup.js";
import { readFileSync } from "node:fs";

const DEFAULT_SEED = 0x534d4152;
let state = Number(process.env.SMARTTENSE_FUZZ_SEED || DEFAULT_SEED) >>> 0;
const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

function random() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 0x100000000;
}

function integer(maximum) {
  return Math.floor(random() * maximum);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomInvalidRoot(index) {
  const values = [null, true, false, index, `fuzz-${index}`, [], [index], { [`fuzz_${index}`]: random() }];
  return values[integer(values.length)];
}

function assertRejected(validator, payload, label) {
  assert.throws(() => validator(payload), undefined, label);
}

function fuzzInvalidRoots(iterations) {
  const validators = [validateVerbData, validateLearningContent, validateProgressBackup];
  for (let index = 0; index < iterations; index += 1) {
    const payload = randomInvalidRoot(index);
    for (const validator of validators) assertRejected(validator, payload, `invalid root ${index}`);
  }
  return iterations * validators.length;
}

function fuzzVerbPayloads(iterations) {
  for (let index = 0; index < iterations; index += 1) {
    const payload = clone(DEFAULT_DATA);
    const verbIndex = integer(payload.verbs.length);
    const verb = payload.verbs[verbIndex];

    switch (index % 7) {
      case 0: verb.id = `<unsafe-${index}>`; break;
      case 1: verb.label = "x".repeat(25000); break;
      case 2: verb.unexpectedField = "not allowed"; break;
      case 3: payload.verbs[(verbIndex + 1) % payload.verbs.length].id = verb.id; break;
      case 4: payload.verbs = []; break;
      case 5: payload.schemaVersion = 999; break;
      default: verb.base = { nested: true }; break;
    }
    assertRejected(validateVerbData, payload, `verb payload ${index}`);
  }
  return iterations;
}

function fuzzLearningPayloads(iterations) {
  for (let index = 0; index < iterations; index += 1) {
    const payload = clone(learningContent);
    const unitIndex = integer(payload.units.length);
    const unit = payload.units[unitIndex];

    switch (index % 6) {
      case 0: unit.title = `<script>${index}</script>`; break;
      case 1: payload.units[(unitIndex + 1) % payload.units.length].id = unit.id; break;
      case 2: unit.contextTags = ["unknown-fuzz-context"]; break;
      case 3: unit.unexpectedField = true; break;
      case 4: payload.schemaVersion = 999; break;
      default: payload.units = []; break;
    }
    assertRejected(validateLearningContent, payload, `learning payload ${index}`);
  }
  return iterations;
}

function validProgress(index) {
  return buildProgressBackup({
    activeLearningUnitId: `unit-${index % 10}`,
    visitedVerbIds: [`verb-${index}`],
    unitProgress: {},
    skillProgress: {},
    journeyProgress: {},
    diagnosticAnswers: {},
    diagnosticCompleted: false,
    productionAttempts: {}
  }, "2026-09-09T12:00:00.000Z");
}

function deepObject(depth) {
  const root = {};
  let current = root;
  for (let index = 0; index < depth; index += 1) {
    current.next = {};
    current = current.next;
  }
  return root;
}

function fuzzProgressPayloads(iterations) {
  for (let index = 0; index < iterations; index += 1) {
    const payload = validProgress(index);
    switch (index % 10) {
      case 0: payload.unexpectedField = true; break;
      case 1: payload.kind = "another-data-channel"; break;
      case 2: payload.schemaVersion = 999; break;
      case 3: payload.exportedAt = "not-a-date"; break;
      case 4: delete payload.progress.unitProgress; break;
      case 5: payload.progress.skillProgress = []; break;
      case 6: payload.progress.visitedVerbIds = Array.from({ length: 1001 }, (_, item) => `verb-${item}`); break;
      case 7: payload.progress.unitProgress = { root: deepObject(15) }; break;
      case 8: payload.progress.diagnosticCompleted = "false"; break;
      default: payload.progress.productionAttempts = { constructor: { polluted: true } }; break;
    }
    assertRejected(validateProgressBackup, payload, `progress payload ${index}`);
  }
  return iterations;
}

const startedAt = performance.now();
const rootCases = fuzzInvalidRoots(200);
const verbCases = fuzzVerbPayloads(210);
const learningCases = fuzzLearningPayloads(120);
const progressCases = fuzzProgressPayloads(200);
const totalCases = rootCases + verbCases + learningCases + progressCases;
const durationMs = Math.round(performance.now() - startedAt);

console.log(JSON.stringify({
  seed: Number(process.env.SMARTTENSE_FUZZ_SEED || DEFAULT_SEED),
  totalCases,
  rootCases,
  verbCases,
  learningCases,
  progressCases,
  rejectedUnsafeCases: totalCases,
  durationMs
}, null, 2));
