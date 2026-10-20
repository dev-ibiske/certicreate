"use client";

import { useState } from "react";
import type { CertificateFields } from "@/lib/certificate";

interface DownloadPngButtonProps {
  fields: CertificateFields;
}

const BUSY_MESSAGE = "The server is busy, try again in a moment.";
const FAILED_MESSAGE = "Could not create the PNG. Try again.";

/** Asks the export route to render the certificate and saves the PNG. */
export function DownloadPngButton({ fields }: DownloadPngButtonProps) {
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    if (rendering) return;
    setRendering(true);
    setError("");
    try {
      const response = await fetch("/api/export/png", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!response.ok) {
        setError(response.status === 503 ? BUSY_MESSAGE : FAILED_MESSAGE);
        return;
      }
      saveBlob(await response.blob(), fileNameFrom(response));
    } catch {
      setError(FAILED_MESSAGE);
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={download}
        disabled={rendering}
        aria-busy={rendering}
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring disabled:cursor-wait disabled:opacity-70"
      >
        {rendering ? "Rendering…" : "Download PNG"}
      </button>
      <p role="status" aria-live="polite" className="text-sm text-error">
        {error}
      </p>
    </div>
  );
}

function fileNameFrom(response: Response): string {
  const header = response.headers.get("Content-Disposition") ?? "";
  return /filename="([^"]+)"/.exec(header)?.[1] ?? "certificate.png";
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Revoking in the same tick can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
