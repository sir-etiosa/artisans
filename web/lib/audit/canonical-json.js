// Postgres's `jsonb` column type does not preserve object key order or
// whitespace — it normalizes on storage. A plain JSON.stringify(metadata)
// at write time can therefore produce a different string than the same
// object read back later, breaking hash verification for reasons that have
// nothing to do with tampering. Sorting keys recursively before stringify
// makes the serialization stable across that round-trip. Arrays keep their
// order (order is meaningful there); only object keys get sorted.
export function canonicalStringify(value) {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = sortKeys(value[key]);
      return acc;
    }, {});
  }
  return value;
}
