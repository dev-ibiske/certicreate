import { Certificate } from "@/components/certificate/Certificate";
import { PLACEHOLDER_CERTIFICATE } from "@/components/certificate/placeholder";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 border-b border-border bg-surface px-6 py-3">
        <span
          aria-hidden="true"
          className="grid size-[22px] place-items-center rounded-md bg-accent font-cert-serif text-sm font-bold text-accent-ink"
        >
          C
        </span>
        <h1 className="text-lg font-semibold">Certificreate</h1>
      </header>

      {/* The certificate scales to whichever of width or height runs out first. */}
      <main className="grid min-h-0 flex-1 place-items-center p-8 [container-type:size]">
        <div className="w-[min(100cqw,100cqh*11/8.5)] shadow-artifact">
          <Certificate {...PLACEHOLDER_CERTIFICATE} />
        </div>
      </main>
    </div>
  );
}
