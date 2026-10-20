import { LogoMark } from "./LogoMark";

export interface CertificateProps {
  recipientName: string;
  courseTitle: string;
  instructorName: string;
  /** Display text, already formatted. */
  date: string;
}

const sansCaps =
  "font-cert-sans uppercase tracking-(--cert-tracking)";

/**
 * The "Black Border" certificate. Sized entirely in container-width units, so
 * the same markup works as a scaled preview and as a full-size export page.
 */
export function Certificate({
  recipientName,
  courseTitle,
  instructorName,
  date,
}: CertificateProps) {
  return (
    <article
      aria-label={`Certificate of completion for ${recipientName}`}
      className="@container relative aspect-[11/8.5] w-full bg-cert-paper text-cert-ink"
    >
      {/* Notched (concave) corners on both lines, as in the Canva design. */}
      <svg
        className="absolute inset-0 size-full text-cert-border"
        viewBox="0 0 1100 850"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeWidth="6"
          d="M52 22 H1048 A30 30 0 0 0 1078 52 V798 A30 30 0 0 0 1048 828 H52 A30 30 0 0 0 22 798 V52 A30 30 0 0 0 52 22 Z"
        />
        <path
          strokeWidth="2"
          d="M66 40 H1034 A26 26 0 0 0 1060 66 V784 A26 26 0 0 0 1034 810 H66 A26 26 0 0 0 40 784 V66 A26 26 0 0 0 66 40 Z"
        />
      </svg>

      <div className="absolute inset-x-[11cqw] top-[7.5cqw] bottom-[6.8cqw] flex flex-col items-center text-center">
        <p className="font-cert-serif text-(length:--cert-title) leading-[0.95]">
          Certificate
        </p>
        <p className="font-cert-serif text-(length:--cert-subtitle) leading-[1.1]">
          of Completion
        </p>
        <p className={`mt-[3.2cqw] font-medium text-(length:--cert-eyebrow) ${sansCaps}`}>
          This is to certify that
        </p>

        <p
          className={`mt-auto w-[64%] break-words border-b-[0.25cqw] border-cert-rule pb-[0.9cqw] font-bold text-(length:--cert-name) ${sansCaps}`}
        >
          {recipientName}
        </p>
        <p className="mt-[1.4cqw] font-cert-sans text-(length:--cert-body) text-cert-label">
          Has completed the following Traversy Media course:
        </p>
        <p className="mt-[1.6cqw] break-words font-cert-sans font-bold text-(length:--cert-body)">
          {courseTitle}
        </p>

        <div className="mt-auto grid w-full grid-cols-[1fr_auto_1fr] items-center gap-[4cqw]">
          <SignatureLine value={instructorName} label="Instructor" />
          <LogoMark />
          <SignatureLine value={date} label="Date" />
        </div>
      </div>
    </article>
  );
}

function SignatureLine({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <p
        className={`w-[64%] break-words border-b-[0.25cqw] border-cert-label pb-[0.6cqw] font-medium text-(length:--cert-sig) ${sansCaps}`}
      >
        {value}
      </p>
      <p className="mt-[0.7cqw] font-cert-sans text-(length:--cert-sig-label) text-cert-label">
        {label}
      </p>
    </div>
  );
}
