const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_DEPTH = 20;
const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function readJsonStorage(storage, key, options = {}) {
  try {
    const serialized = storage?.getItem(key);
    if (!serialized) return {};
    if (serialized.length > (options.maxBytes || DEFAULT_MAX_BYTES)) return {};

    const value = JSON.parse(serialized);
    return isSafeJsonRecord(value, options) ? value : {};
  } catch {
    return {};
  }
}

export function writeJsonStorage(storage, key, value, options = {}) {
  try {
    if (!isSafeJsonRecord(value, options)) return false;
    const serialized = JSON.stringify(value);
    if (serialized.length > (options.maxBytes || DEFAULT_MAX_BYTES)) return false;
    storage?.setItem(key, serialized);
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function clearJsonStorage(storage, key) {
  try {
    storage?.removeItem(key);
    return Boolean(storage);
  } catch {
    return false;
  }
}

export function isSafeJsonRecord(value, options = {}) {
  if (!isPlainRecord(value)) return false;

  const maxDepth = options.maxDepth || DEFAULT_MAX_DEPTH;
  const stack = [{ value, depth: 0 }];
  const seen = new Set();

  while (stack.length > 0) {
    const entry = stack.pop();
    if (entry.depth > maxDepth) return false;
    if (entry.value === null) continue;

    const type = typeof entry.value;
    if (type === "string" || type === "boolean") continue;
    if (type === "number") {
      if (!Number.isFinite(entry.value)) return false;
      continue;
    }
    if (type !== "object" || seen.has(entry.value)) return false;

    seen.add(entry.value);
    if (!Array.isArray(entry.value) && !isPlainRecord(entry.value)) return false;

    for (const [childKey, childValue] of Object.entries(entry.value)) {
      if (UNSAFE_KEYS.has(childKey)) return false;
      stack.push({ value: childValue, depth: entry.depth + 1 });
    }
  }

  return true;
}

function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
