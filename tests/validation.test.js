import test from "node:test";
import assert from "node:assert/strict";
import { validateVerbData } from "../src/data/validation.js";

const validPayload = {
  schemaVersion: 1,
  verbs: [
    {
      id: "write",
      label: "to write",
      base: "write",
      object: "a message"
    }
  ]
};

test("validates compatible verb payloads", () => {
  assert.equal(validateVerbData(validPayload), validPayload);
});

test("validates localized learner-language maps", () => {
  const payload = {
    verbs: [
      {
        id: "write",
        label: "to write",
        base: "write",
        meanings: { es: "escribir", fr: "écrire" },
        objects: { es: "un mensaje", fr: "un message" }
      }
    ]
  };

  assert.equal(validateVerbData(payload), payload);
});

test("rejects empty verb collections", () => {
  assert.throws(() => validateVerbData({ verbs: [] }), /Invalid data/);
});

test("rejects duplicate verb ids", () => {
  assert.throws(
    () =>
      validateVerbData({
        verbs: [
          { id: "go", label: "to go", base: "go" },
          { id: "go", label: "to go again", base: "go" }
        ]
      }),
    /Duplicate verb id/
  );
});

test("rejects unsupported verb types", () => {
  assert.throws(
    () => validateVerbData({ verbs: [{ id: "x", label: "x", base: "x", type: "phrasal" }] }),
    /Invalid verb type/
  );
});

test("rejects unknown payload and verb fields", () => {
  assert.throws(
    () => validateVerbData({ ...validPayload, admin: true }),
    /Unknown payload field/
  );
  assert.throws(
    () => validateVerbData({ verbs: [{ id: "go", label: "to go", base: "go", html: "<script>" }] }),
    /Unknown verb field/
  );
});

test("rejects oversized verb collections and strings", () => {
  assert.throws(
    () => validateVerbData({ verbs: Array.from({ length: 501 }, (_, index) => ({ id: `v${index}`, label: "verb", base: "go" })) }),
    /Too many verbs/
  );
  assert.throws(
    () => validateVerbData({ verbs: [{ id: "long", label: "x".repeat(161), base: "go" }] }),
    /Invalid verb label/
  );
});

test("rejects unsafe ids, markup, and schema versions", () => {
  assert.throws(
    () => validateVerbData({ schemaVersion: 99, verbs: [{ id: "go", label: "to go", base: "go" }] }),
    /Invalid schema version/
  );
  assert.throws(
    () => validateVerbData({ verbs: [{ id: "go now", label: "to go", base: "go" }] }),
    /Invalid verb id/
  );
  assert.throws(
    () => validateVerbData({ verbs: [{ id: "go", label: "<img>", base: "go" }] }),
    /Invalid verb label/
  );
  assert.throws(
    () => validateVerbData({ verbs: [{ id: "go", label: "to go", base: "go", meanings: { es: "<script>" } }] }),
    /Invalid verb meanings/
  );
});
