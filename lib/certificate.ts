import type { CertificateProps } from "@/components/certificate/Certificate";
import { PLACEHOLDER_CERTIFICATE } from "@/components/certificate/placeholder";
import { formatCertificateDate } from "@/lib/date";

/** Editor state. `date` is the date input's ISO value (`YYYY-MM-DD`) or "". */
export type CertificateFields = Pick<
  CertificateProps,
  "recipientName" | "courseTitle" | "instructorName" | "date"
>;
export type CertificateField = keyof CertificateFields;

export const CERTIFICATE_FIELDS: CertificateField[] = [
  "recipientName",
  "courseTitle",
  "instructorName",
  "date",
];

/**
 * Turns editor state into certificate props: formats the ISO date for display
 * and shows sample text for empty fields so the preview never has blank lines.
 * The export render page uses this too, so the PNG matches the preview.
 */
export function toCertificateProps(fields: CertificateFields): CertificateProps {
  const pick = (field: CertificateField, value = fields[field]) =>
    value.trim() || PLACEHOLDER_CERTIFICATE[field];
  return {
    recipientName: pick("recipientName"),
    courseTitle: pick("courseTitle"),
    instructorName: pick("instructorName"),
    date: pick("date", formatCertificateDate(fields.date)),
  };
}
