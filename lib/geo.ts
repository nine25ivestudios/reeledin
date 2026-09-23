const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function isIsoCode(value: string): boolean {
  return /^[A-Za-z]{2}$/.test(value.trim());
}

/** Instagram returns countries as ISO 3166-1 alpha-2 codes (e.g. "IN"). */
export function countryName(raw: string): string {
  const value = raw.trim();
  if (!isIsoCode(value)) return value;
  try {
    return regionNames.of(value.toUpperCase()) ?? value;
  } catch {
    return value;
  }
}

export function countryFlag(raw: string): string | null {
  const value = raw.trim().toUpperCase();
  if (!isIsoCode(value)) return null;
  return String.fromCodePoint(...[...value].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Instagram returns cities as "Mumbai, Maharashtra"; the state adds nothing on a credential. */
export function cityName(raw: string): string {
  return raw.split(",")[0]?.trim() || raw;
}
