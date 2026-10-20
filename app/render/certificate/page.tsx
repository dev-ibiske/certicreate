import type { Metadata } from "next";
import { Suspense } from "react";
import { Certificate } from "@/components/certificate/Certificate";
import {
  CERTIFICATE_FIELDS,
  toCertificateProps,
  type CertificateFields,
} from "@/lib/certificate";

export const metadata: Metadata = {
  title: "Certificate render",
  robots: { index: false },
};

/**
 * The page Puppeteer captures for exports: just the certificate at its full
 * 1100px design width, with the app's own CSS and fonts.
 */
export default function RenderCertificatePage({
  searchParams,
}: PageProps<"/render/certificate">) {
  return (
    <div className="w-[1100px] bg-cert-paper">
      {/* searchParams is request data, so it renders dynamically. */}
      <Suspense fallback={null}>
        <RenderedCertificate searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RenderedCertificate({
  searchParams,
}: Pick<PageProps<"/render/certificate">, "searchParams">) {
  const params = await searchParams;
  const fields = Object.fromEntries(
    CERTIFICATE_FIELDS.map((field) => {
      const value = params[field];
      return [field, typeof value === "string" ? value : ""];
    }),
  ) as CertificateFields;

  return <Certificate {...toCertificateProps(fields)} />;
}
