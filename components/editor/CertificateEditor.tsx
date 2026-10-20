"use client";

import { useState } from "react";
import { Certificate } from "@/components/certificate/Certificate";
import { DEFAULT_INSTRUCTOR } from "@/components/certificate/placeholder";
import { toCertificateProps, type CertificateFields } from "@/lib/certificate";
import { CertificateForm } from "./CertificateForm";
import { DownloadPngButton } from "./DownloadPngButton";

const INITIAL_FIELDS: CertificateFields = {
  recipientName: "",
  courseTitle: "",
  date: "",
  instructorName: DEFAULT_INSTRUCTOR,
};

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
        className="flex flex-1 flex-col gap-4 p-6 lg:min-h-0 lg:p-8"
      >
        <DownloadPngButton fields={fields} />
        <div className="lg:grid lg:min-h-0 lg:flex-1 lg:place-items-center lg:@container-size">
          <div className="w-full shadow-artifact lg:w-[min(100cqw,100cqh*11/8.5)]">
            <Certificate {...toCertificateProps(fields)} />
          </div>
        </div>
      </section>
    </main>
  );
}
