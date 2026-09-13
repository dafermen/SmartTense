import test from "node:test";
import assert from "node:assert/strict";
import { clearJsonStorage, isSafeJsonRecord, readJsonStorage, writeJsonStorage } from "../src/browserStorage.js";

function createStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem: () => value,
    setItem: (_key, nextValue) => { value = nextValue; },
    removeItem: () => { value = null; },
    current: () => value
  };
}

test("browser storage round-trips a valid settings record", () => {
  const storage = createStorage();
  const settings = { activePage: "practice", visitedVerbIds: ["work", "study"] };

  assert.equal(writeJsonStorage(storage, "settings", settings), true);
  assert.deepEqual(readJsonStorage(storage, "settings"), settings);
  assert.notEqual(readJsonStorage(storage, "settings"), settings);
});

test("browser storage recovers safely from unavailable or malformed data", () => {
  assert.deepEqual(readJsonStorage(null, "settings"), {});
  assert.deepEqual(readJsonStorage(createStorage("not-json"), "settings"), {});
  assert.deepEqual(readJsonStorage(createStorage("[]"), "settings"), {});
  assert.deepEqual(readJsonStorage(createStorage("null"), "settings"), {});

  const deniedStorage = { getItem: () => { throw new Error("denied"); } };
  assert.deepEqual(readJsonStorage(deniedStorage, "settings"), {});
});

test("browser storage rejects unsafe, excessive, and non-JSON structures", () => {
  const unsafe = JSON.parse('{"progress":{"constructor":{"polluted":true}}}');
  const circular = {};
  circular.self = circular;

  assert.equal(isSafeJsonRecord(unsafe), false);
  assert.equal(writeJsonStorage(createStorage(), "settings", circular), false);
  assert.deepEqual(readJsonStorage(createStorage(JSON.stringify(unsafe)), "settings"), {});
  assert.deepEqual(readJsonStorage(createStorage('{"text":"123456"}'), "settings", { maxBytes: 5 }), {});

  let deep = {};
  for (let index = 0; index < 5; index += 1) deep = { next: deep };
  assert.equal(isSafeJsonRecord(deep, { maxDepth: 3 }), false);
});

test("browser storage tolerates write, quota, and clear failures", () => {
  const deniedStorage = {
    setItem: () => { throw new Error("quota exceeded"); },
    removeItem: () => { throw new Error("denied"); }
  };

  assert.equal(writeJsonStorage(deniedStorage, "settings", { activePage: "home" }), false);
  assert.equal(clearJsonStorage(deniedStorage, "settings"), false);

  const storage = createStorage('{"activePage":"home"}');
  assert.equal(clearJsonStorage(storage, "settings"), true);
  assert.equal(storage.current(), null);
});
