const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"] as const;

/** `n` dans 1..10 → chiffres romains (secteurs sur la carte). */
export function toRomanSector(n: number): string {
  if (n < 1) return "I";
  if (n > 10) return String(n);
  return ROMAN[n - 1] ?? String(n);
}
