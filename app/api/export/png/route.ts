import { CERTIFICATE_FIELDS, type CertificateFields } from "@/lib/certificate";
import { parseExportRequest, pngFileName } from "@/lib/export-request";
import { getBrowser } from "@/lib/server/browser";
import { RenderBusyError, withRenderSlot } from "@/lib/server/render-limit";

const MAX_BODY_BYTES = 16 * 1024;
/** 1100 x 850 CSS px at 3x = 3300 x 2550 px, 11 x 8.5 in at 300 DPI. */
const DEVICE_SCALE_FACTOR = 3;
const RENDER_TIMEOUT_MS = 15_000;

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

/**
 * Reads the body as text, or returns null once it passes `limit` bytes.
 * Chunked requests have no content-length, so the limit is enforced while
 * streaming instead of after buffering the whole body.
 */
async function readBodyWithLimit(request: Request, limit: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (declaredLength > MAX_BODY_BYTES) {
    return jsonError(413, "Request too large.");
  }
  const text = await readBodyWithLimit(request, MAX_BODY_BYTES);
  if (text === null) return jsonError(413, "Request too large.");

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return jsonError(400, "Request body must be valid JSON.");
  }
  const parsed = parseExportRequest(body);
  if (!parsed.ok) return jsonError(400, parsed.error);

  try {
    const png = await withRenderSlot(() => renderPng(parsed.fields));
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${pngFileName(parsed.fields.recipientName)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof RenderBusyError) {
      return jsonError(503, "Server busy, try again.");
    }
    console.error("PNG export failed", error);
    return jsonError(500, "Could not render the certificate.");
  }
}

async function renderPng(fields: CertificateFields): Promise<Uint8Array<ArrayBuffer>> {
  // Always our own server on loopback; never derived from the request, so a
  // forged Host header cannot point Chrome at another site.
  const url = new URL(`http://127.0.0.1:${process.env.PORT ?? 3000}/render/certificate`);
  for (const field of CERTIFICATE_FIELDS) {
    if (fields[field]) url.searchParams.set(field, fields[field]);
  }

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1100, height: 850, deviceScaleFactor: DEVICE_SCALE_FACTOR });
    await page.goto(url.href, { waitUntil: "networkidle0", timeout: RENDER_TIMEOUT_MS });
    await page.evaluate(() => document.fonts.ready);

    const certificate = await page.waitForSelector("article", { timeout: RENDER_TIMEOUT_MS });
    if (!certificate) throw new Error("Render page has no certificate");
    const png = await certificate.screenshot({ type: "png" });
    return new Uint8Array(png);
  } finally {
    await page.close();
  }
}
