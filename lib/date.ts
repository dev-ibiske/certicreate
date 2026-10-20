const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Formats a date input's `YYYY-MM-DD` value as `DD/MM/YYYY` (Nigerian
 * convention). Splits the string instead of building a `Date`, which would
 * shift the day in some time zones.
 * Returns "" for anything else, including the empty value of an unset input.
 */
export function formatCertificateDate(iso: string): string {
  const match = ISO_DATE.exec(iso);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
