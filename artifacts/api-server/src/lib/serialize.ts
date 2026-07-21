/**
 * Converts a DB row (or array of rows) to a plain JSON-safe object,
 * so Date objects become ISO strings before Zod validation.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
