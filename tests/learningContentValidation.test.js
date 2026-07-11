import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateLearningContent } from "../src/data/learningContentValidation.js";

const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("validates bundled learning content", () => {
  assert.equal(validateLearningContent(learningContent), learningContent);
});

test("bundled Present Simple unit has the sections needed by Theory", () => {
  const unit = learningContent.units.find((entry) => entry.id === "present-simple-foundation");
  assert.ok(unit);
  assert.deepEqual(
    new Set(unit.sections.map((section) => section.type)),
    new Set(["theory", "structures", "commonMistakes", "examples", "exercises"])
  );
});

test("rejects empty learning unit collections", () => {
  assert.throws(() => validateLearningContent({ schemaVersion: 1, units: [] }), /Invalid learning content/);
});

test("rejects duplicate learning unit ids", () => {
  const payload = clone(learningContent);
  payload.units.push(clone(payload.units[0]));

  assert.throws(() => validateLearningContent(payload), /Duplicate unit id/);
});

test("rejects unsupported section types", () => {
  const payload = clone(learningContent);
  payload.units[0].sections[0].type = "video";

  assert.throws(() => validateLearningContent(payload), /Invalid section type/);
});

test("rejects markup-like content", () => {
  const payload = clone(learningContent);
  payload.units[0].sections[0].body[0] = "<script>alert(1)</script>";

  assert.throws(() => validateLearningContent(payload), /Invalid section body/);
});

test("rejects invalid exercise kinds", () => {
  const payload = clone(learningContent);
  payload.units[0].sections.find((section) => section.type === "exercises").exercises[0].kind = "essay";

  assert.throws(() => validateLearningContent(payload), /Invalid exercise kind/);
});

test("rejects missing structures for structure sections", () => {
  const payload = clone(learningContent);
  delete payload.units[0].sections.find((section) => section.type === "structures").structures;

  assert.throws(() => validateLearningContent(payload), /Invalid section structures/);
});
