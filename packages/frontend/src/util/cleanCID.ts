export function cleanCID(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw.trim().replace(/^['"]+|['"]+$/g, "");
}