"use client";

import { useState } from "react";
import { Certificate, type CertificateProps } from "@/components/certificate/Certificate";
import {
  DEFAULT_INSTRUCTOR,
  PLACEHOLDER_CERTIFICATE,
} from "@/components/certificate/placeholder";
import { formatCertificateDate } from "@/lib/date";
import { CertificateForm } from "./CertificateForm";

/** Editor state. `date` is the date input's ISO value (`YYYY-MM-DD`) or "". */
export type CertificateFields = Pick<
  CertificateProps,
  "recipientName" | "courseTitle" | "instructorName" | "date"
>;
export type CertificateField = keyof CertificateFields;

const INITIAL_FIELDS: CertificateFields = {
  recipientName: "",
  courseTitle: "",
  date: "",
  instructorName: DEFAULT_INSTRUCTOR,
};

/**
 * Turns editor state into certificate props: formats the ISO date for display
 * and shows sample text for empty fields so the preview never has blank lines.
 */
function toCertificateProps(fields: CertificateFields): CertificateProps {
  const pick = (field: CertificateField, value = fields[field]) =>
    value.trim() || PLACEHOLDER_CERTIFICATE[field];
  return {
    recipientName: pick("recipientName"),
    courseTitle: pick("courseTitle"),
    instructorName: pick("instructorName"),
    date: pick("date", formatCertificateDate(fields.date)),
  };
}

export function CertificateEditor() {
  const [fields, setFields] = useState(INITIAL_FIELDS);

  return (
    <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      <aside className="border-b border-border bg-surface p-6 lg:w-95 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
        <CertificateForm
          values={fields}
          onChange={(field, value) =>
            setFields((previous) => ({ ...previous, [field]: value }))
          }
        />
      </aside>

      {/* On wide screens the certificate fits whichever of width or height
          runs out first; on narrow screens it takes the full width. */}
      <section
        aria-label="Certificate preview"
        className="flex-1 p-6 lg:grid lg:min-h-0 lg:place-items-center lg:p-8 lg:@container-size"
      >
        <div className="w-full shadow-artifact lg:w-[min(100cqw,100cqh*11/8.5)]">
          <Certificate {...toCertificateProps(fields)} />
        </div>
      </section>
    </main>
  );
}
