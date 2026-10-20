import { CertificateEditor } from "@/components/editor/CertificateEditor";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <header className="flex items-center gap-2 border-b border-border bg-surface px-6 py-3">
        <span
          aria-hidden="true"
          className="grid size-[22px] place-items-center rounded-md bg-accent font-cert-serif text-sm font-bold text-accent-ink"
        >
          C
        </span>
        <h1 className="text-lg font-semibold">Certificreate</h1>
      </header>

      <CertificateEditor />
    </div>
  );
}
