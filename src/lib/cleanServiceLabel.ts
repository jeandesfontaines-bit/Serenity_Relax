export function cleanServiceLabel(value?: string | null): string {
  if (value === undefined || value === null) return '';
  const raw = typeof value === 'string' ? value : String(value);
  return raw
    .replace(/\s*-\s*s[ée]ance cibl[ée]e?\s*/gi, ' ')
    .replace(/\bs[ée]ance cibl[ée]e?\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+-\s+/g, ' - ')
    .trim();
}
