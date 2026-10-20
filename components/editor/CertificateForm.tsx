import { useId } from "react";
import { PLACEHOLDER_CERTIFICATE } from "@/components/certificate/placeholder";
import type { CertificateFields, CertificateField } from "./CertificateEditor";

const FIELDS: {
  field: CertificateField;
  label: string;
  type?: "date";
  hint?: string;
}[] = [
  { field: "recipientName", label: "Recipient name" },
  { field: "courseTitle", label: "Course or achievement" },
  { field: "date", label: "Date", type: "date" },
  {
    field: "instructorName",
    label: "Instructor",
    hint: "Default instructor. Edit for this certificate only.",
  },
];

interface CertificateFormProps {
  values: CertificateFields;
  onChange: (field: CertificateField, value: string) => void;
}

export function CertificateForm({ values, onChange }: CertificateFormProps) {
  const idPrefix = useId();

  return (
    // No submit button: the preview updates on every keystroke instead.
    <form onSubmit={(event) => event.preventDefault()}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Recipient
      </h2>
      <div className="flex flex-col gap-4">
        {FIELDS.map(({ field, label, type = "text", hint }) => {
          const id = `${idPrefix}-${field}`;
          const hintId = hint ? `${id}-hint` : undefined;
          return (
            <div key={field} className="flex flex-col gap-2">
              <label htmlFor={id} className="text-sm font-medium">
                {label}
              </label>
              <input
                id={id}
                name={field}
                type={type}
                autoComplete="off"
                value={values[field]}
                // Date inputs ignore placeholders and render their own format hint.
                placeholder={type === "text" ? PLACEHOLDER_CERTIFICATE[field] : undefined}
                aria-describedby={hintId}
                onChange={(event) => onChange(field, event.target.value)}
                className="rounded-md border border-border-strong bg-bg px-3 py-2 text-text scheme-dark placeholder:text-faint focus-visible:border-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring"
              />
              {hint && (
                <p id={hintId} className="text-xs text-faint">
                  {hint}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </form>
  );
}
