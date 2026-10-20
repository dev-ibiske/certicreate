import { CERTIFICATE_FIELDS, type CertificateFields } from "@/lib/certificate";

const MAX_FIELD_LENGTH = 200;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const FIELD_LABELS: Record<keyof CertificateFields, string> = {
  recipientName: "Recipient name",
  courseTitle: "Course",
  instructorName: "Instructor",
  date: "Date",
};

export type ExportRequestResult =
  | { ok: true; fields: CertificateFields }
  | { ok: false; error: string };

/**
 * Validates an export request body by hand until Zod arrives in feature 8.
 * Only the four certificate text fields are accepted; anything else is ignored.
 */
export function parseExportRequest(body: unknown): ExportRequestResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const input = body as Record<string, unknown>;
  const fields = {} as CertificateFields;

  for (const field of CERTIFICATE_FIELDS) {
    const value = input[field] ?? "";
    if (typeof value !== "string") {
      return { ok: false, error: `${FIELD_LABELS[field]} must be text.` };
    }
    const trimmed = value.trim();
    if (trimmed.length > MAX_FIELD_LENGTH) {
      return {
        ok: false,
        error: `${FIELD_LABELS[field]} must be ${MAX_FIELD_LENGTH} characters or fewer.`,
      };
    }
    fields[field] = trimmed;
  }

  if (fields.date && !ISO_DATE.test(fields.date)) {
    return { ok: false, error: "Date must be in YYYY-MM-DD format." };
  }
  return { ok: true, fields };
}

/** `certificate-<recipient-slug>.png`, or `certificate.png` with no name. */
export function pngFileName(recipientName: string): string {
  const slug = recipientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60)
    .replace(/^-+|-+$/g, "");
  return slug ? `certificate-${slug}.png` : "certificate.png";
}
