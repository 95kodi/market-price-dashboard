export function isValidUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function requiredField(value: string) {
  return value.trim().length > 0;
}
