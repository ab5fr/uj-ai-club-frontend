/**
 * Parse backend date values. Supports ISO strings and the Rust `time` crate
 * serde array format: [year, ordinal, hour, minute, second, nanosecond, oh, om, os]
 */
export function parseBackendDate(value) {
  if (value == null || value === "") return null;

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (Array.isArray(value) && value.length >= 6) {
    const [
      year,
      ordinal,
      hour,
      minute,
      second,
      nanosecond = 0,
      offsetHour = 0,
      offsetMinute = 0,
      offsetSecond = 0,
    ] = value;

    if (
      typeof year !== "number" ||
      typeof ordinal !== "number" ||
      typeof hour !== "number" ||
      typeof minute !== "number" ||
      typeof second !== "number"
    ) {
      return null;
    }

    const date = new Date(Date.UTC(year, 0, 1));
    date.setUTCDate(ordinal);

    const offsetSeconds = offsetHour * 3600 + offsetMinute * 60 + offsetSecond;
    const utcMs =
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        hour,
        minute,
        second,
        Math.floor(nanosecond / 1_000_000),
      ) -
      offsetSeconds * 1000;

    const parsed = new Date(utcMs);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function formatBackendDate(value, options) {
  const date = parseBackendDate(value);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, options);
}

export function formatBackendDateTime(value, options) {
  const date = parseBackendDate(value);
  if (!date) return "—";
  return date.toLocaleString(undefined, options);
}
