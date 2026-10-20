# Feature: PNG export

**From build-plan:** feature 3
**Build attempt:** 1
**Branch:** feature/png-export
**Status:** verified

## Goal

Add a Download PNG button to the editor. Clicking it sends the current form
values to a server route. The route renders the same `Certificate` component in
one shared headless Chromium (full Puppeteer) and returns a high-resolution PNG.
The PNG must look identical to the live preview. Render deployment is manual and
handled by the user after this works locally, so it is not a step here.

## In scope

- `puppeteer` (full, bundled Chromium) in `dependencies`, with
  `.puppeteerrc.cjs` at the repo root setting `cacheDirectory` to
  `.cache/puppeteer`, and `.cache` added to `.gitignore`.
- An internal render page that shows only the certificate at a fixed 1100 CSS px
  width. It uses the existing `Certificate` component, app CSS, and the
  self-hosted `next/font` fonts, so preview and export cannot drift.
- One shared browser: launched once at server boot from `instrumentation.ts`,
  with a lazy fallback if it is not up yet. One new page per request, closed in
  `finally`. Launch flags: `--no-sandbox`, `--disable-setuid-sandbox`,
  `--disable-dev-shm-usage`. If the browser disconnects, the next request
  launches a new one. It is never relaunched per request.
- An in-process limit of 2 concurrent renders with a small bounded queue.
- `POST /api/export/png`: validates structured fields by hand (Zod is feature 8),
  renders, and returns `image/png` as an attachment.
- Client: a Download PNG button with idle, loading, error, and success states.

## Out of scope

- PDF export and its button (feature 4).
- Template picker and `templateId` in the request (feature 5). The only template
  is Black Border.
- Brand colors and logo in the request (features 6a/6b).
- Zod, date picker, long-name auto-fit, and empty-state validation (feature 8).
- Render service creation, deploy config, env cleanup, sizing, and queue tuning
  under load (manual deploy, feature 9).
- Unit tests. No test command is configured.

## Build loop

`workflow.stepReview` is `feature`, so build all steps and then present one
review packet for the feature. `workflow.checkpointCommits` is `disabled`, so do
not make checkpoint commits. `/complete` creates the final feature commit.

## Build steps

- [x] **1. Puppeteer install and Chrome cache path.** Create
  `.puppeteerrc.cjs` (`cacheDirectory: join(__dirname, ".cache", "puppeteer")`)
  **before** installing, so the postinstall Chrome download lands there. Add
  `.cache` to `.gitignore`. Run `npm install puppeteer` (saved to
  `dependencies`, exact resolved version in the lockfile). If ESLint flags the
  CommonJS `require` in the `.cjs` file, add `.puppeteerrc.cjs` to the eslint
  ignores instead of rewriting it.
  **Done when:** `puppeteer` appears under `dependencies` in `package.json`,
  Chrome exists under `.cache/puppeteer/`, `git status` does not show `.cache`,
  and `npm run lint` and `npm run build` pass.

- [x] **2. Shared field resolution and the render page.** Move
  `CertificateFields`, `CertificateField`, and `toCertificateProps` out of
  `components/editor/CertificateEditor.tsx` into `lib/certificate.ts`. Update the
  editor and form imports and keep the behavior the same (placeholder fallback,
  ISO to `DD/MM/YYYY`). Add `app/render/certificate/page.tsx`. It reads
  `recipientName`, `courseTitle`, `instructorName`, and `date` (ISO) from
  `searchParams`. Missing or repeated params become `""` (take the first value
  only when it is a string). It resolves them with `toCertificateProps` and
  renders `<Certificate>` inside a wrapper exactly `1100px` wide on the paper
  background. Reading `searchParams` is dynamic under `cacheComponents`, so wrap
  the reading component in `<Suspense>` (fallback `null`). Set
  `robots: { index: false }` in the page metadata.
  **Done when:** `/render/certificate?recipientName=Ada%20Lovelace&date=2026-07-13`
  shows the certificate 1100px wide with "ADA LOVELACE" and `13/07/2026`, the
  placeholder course and instructor, and Quattrocento/Montserrat fonts. Markup
  in a param such as `<b>x</b>` shows as literal text. `/` behaves as before.
  `npm run lint` and `npm run build` pass.

- [x] **3. Shared browser, render limit, and the export route.**
  - `lib/server/browser.ts`: `getBrowser()` caches one launch promise. On
    `disconnected` or a launch failure it clears the cache so a later call
    relaunches. Uses the three launch flags and `headless: true`. Import
    `server-only` only if it is already installed; otherwise skip it.
  - `instrumentation.ts` at the repo root: `register()` calls `getBrowser()`
    only when `process.env.NEXT_RUNTIME === "nodejs"` (dynamic import), and
    catches and logs failures so a failed boot launch never crashes the server.
  - `lib/server/render-limit.ts`: a small promise semaphore, 2 active and up to
    8 waiting. If the queue is full, it throws a typed "busy" error right away.
  - `lib/export-request.ts`: `parseExportRequest(unknown)` returns either
    `{ ok: true, fields: CertificateFields }` or `{ ok: false, error }`. It
    requires a plain object. Each of the four fields must be a string when
    present (missing becomes `""`), with at most 200 characters after trim.
    `date` must be `""` or match `YYYY-MM-DD`. Unknown keys are ignored.
  - `app/api/export/png/route.ts` (`POST`). Reject a body over 16 KB (check
    `content-length` and the read text length) with 413. Reject invalid JSON
    or fields with 400. Then, inside the limiter: `newPage()`,
    `setViewport({ width: 1100, height: 850, deviceScaleFactor: 3 })`, and
    `goto` the render page with the validated fields as URL search params
    (`waitUntil: "networkidle0"`, 15 s timeout). Then
    `await page.evaluate(() => document.fonts.ready)` and screenshot the
    `article` element (`type: "png"`). Close the page in `finally`.
    Puppeteer only ever loads
    `http://127.0.0.1:${process.env.PORT ?? 3000}/render/certificate`. The origin
    never comes from the request URL or `Host` header. On success, return 200
    with `Content-Type: image/png`,
    `Content-Disposition: attachment; filename="<name>"`, and
    `Cache-Control: no-store`. Busy returns 503. Any other failure is logged
    server-side and returns 500.
  **Done when:** with `npm run dev` running, `curl -X POST` of
  `{"recipientName":"Ada Lovelace","date":"2026-07-13"}` to
  `/api/export/png` saves a 3300 x 2550 PNG that matches the preview. Bad JSON,
  a non-string field, a 201-char name, or `date: "13/07/2026"` each return 400
  with the JSON error. A body over 16 KB returns 413. Several requests in a row
  reuse one Chrome process, so no new Chrome launches per request. The same
  checks pass against `npm run build && npm run start`.

- [x] **4. Download PNG button.** Add `components/editor/DownloadPngButton.tsx`
  (`"use client"`) and place it in a small toolbar above the preview inside the
  preview `<section>` in `CertificateEditor`. It receives the current
  `CertificateFields`. On click it POSTs them as JSON and turns the response
  into a blob. It downloads the blob through a temporary object URL and `<a
  download>`, then revokes the URL. States:
  - idle: "Download PNG".
  - loading: label "Rendering…", button `disabled` and `aria-busy`. Repeat
    clicks are ignored.
  - error: a short message in an `aria-live="polite"` region (`role="status"`)
    next to the button, styled with `--error`. Use "The server is busy, try
    again in a moment." for 503 and "Could not create the PNG. Try again." for
    anything else, including network failure. The message clears on the next
    click.
  - success: the file downloads and the button returns to idle.
  Use the existing accent and focus-ring chrome styles. Keep it keyboard
  operable, with a visible focus ring.
  **Done when:** in the browser, clicking Download PNG with filled fields
  downloads `certificate-ada-lovelace.png`, which matches the preview. With all
  fields empty it downloads `certificate.png` showing the same placeholders as
  the preview. While rendering, the button is disabled and shows "Rendering…".
  With the dev server's render route forced to fail (temporarily, or by
  stopping Chrome), the error message is announced and the button recovers.
  `npm run lint` and `npm run build` pass.

- [x] **5. Repair F-03: bounded body read.** In `app/api/export/png/route.ts`,
  replace `request.text()` with a streaming read through
  `request.body.getReader()`. It counts bytes, cancels the reader, and returns
  413 as soon as the total passes 16 KB, then decodes the collected bytes with
  `TextDecoder`. Keep the early `content-length` check.
  **Done when:** a chunked request (no `content-length`) over 16 KB gets 413. A
  normal body over 16 KB still gets 413. Valid requests still return the PNG,
  and every 400 case is unchanged. `npm run lint` and `npm run build` pass.

## Files / areas

- `.puppeteerrc.cjs` (new), `.gitignore`, `package.json`, `package-lock.json`,
  possibly `eslint.config.mjs` (ignore entry only)
- `lib/certificate.ts` (new; moved types and `toCertificateProps`)
- `components/editor/CertificateEditor.tsx`, `components/editor/CertificateForm.tsx`
  (import updates, toolbar placement)
- `components/editor/DownloadPngButton.tsx` (new)
- `app/render/certificate/page.tsx` (new)
- `app/api/export/png/route.ts` (new)
- `lib/export-request.ts` (new)
- `lib/server/browser.ts`, `lib/server/render-limit.ts` (new)
- `instrumentation.ts` (new, repo root)
- `components/certificate/Certificate.tsx` is reused unchanged

## Data / contracts

**Request:** `POST /api/export/png` with `Content-Type: application/json` and
this body:

```json
{ "recipientName": "string", "courseTitle": "string",
  "instructorName": "string", "date": "YYYY-MM-DD or empty" }
```

Every field is optional. A missing field is treated as `""`. Each field is at
most 200 characters after trim. Empty fields render the same placeholders as the
preview (`toCertificateProps`). This is the `CertificateData` shape from the
overview without `templateId`, which arrives in feature 5.

**Responses:**

| Status | When | Body |
| --- | --- | --- |
| 200 | rendered | PNG bytes, `image/png`, `Content-Disposition: attachment; filename="certificate-<slug>.png"`, `Cache-Control: no-store` |
| 400 | invalid JSON or fields | `{ "error": "<human message>" }` |
| 413 | body over 16 KB | `{ "error": "Request too large." }` |
| 503 | render queue full | `{ "error": "Server busy, try again." }` |
| 500 | render failure | `{ "error": "Could not render the certificate." }` (no stack or internals) |

**Filename slug:** lowercase the trimmed recipient name. Replace each run of
characters other than ASCII letters and digits with `-`, trim edge hyphens, and
cap it at 60 characters. If the result is empty, use `certificate.png`.
Otherwise use `certificate-<slug>.png`. The server builds this header, and the
client reads the name from `Content-Disposition`.

**PNG output:** the `article` element is 1100 x 850 CSS px at
`deviceScaleFactor: 3`, so the file is 3300 x 2550 px (11 x 8.5 in at 300 DPI).
The plan allows 2 to 3, and 3 is chosen for print quality. It is easy to change
in one constant.

**Render page URL:** `/render/certificate?recipientName=…&courseTitle=…&instructorName=…&date=…`.
It is public, but it only displays React-escaped text.

## Testing

No test runner is configured, so there are no unit tests. Verification:
`npm run lint` and `npm run build` after every step. Use `curl` against the
route for the status-code matrix in step 3, and click through the browser
states in step 4. Compare the PNG and the preview visually, and confirm one
Chrome process in Task Manager. Confirm against `npm run start` too, because
production is the deployment target. `/check` can collect UI evidence later. A
Linux/Render run is the user's manual deploy and is not claimed here.

## Notes for the AI

- **Trust boundary:** the route is public once deployed and drives a real
  browser. Accept only the four structured string fields. Never pass HTML,
  never use `dangerouslySetInnerHTML`, and never take the navigation origin
  from request headers, which would let a forged `Host` aim Chromium at another
  site. React escaping on the render page is the safe rendering rule.
- `puppeteer` is already in Next's default `serverExternalPackages`
  (`node_modules/next/dist/docs/.../serverExternalPackages.md`), so it needs no
  config change. The route runs on the default Node.js runtime. Do not set
  `runtime = "edge"`.
- Next 16 docs ship in `node_modules/next/dist/docs/`. Read
  `03-file-conventions/instrumentation.md` before writing `instrumentation.ts`,
  and the Cache Components guidance before writing the render page.
- In dev, `next dev` may run on a port other than 3000. The render origin uses
  `PORT`, so set `PORT` when using a non-default port. Render sets `PORT`
  itself.
- Fonts are self-hosted by `next/font` (no system-font reliance). Still
  `await document.fonts.ready` before capture.
- Keep the root layout as is. The render page body's dark background does not
  matter because only the `article` is captured.
- Pick and record the Puppeteer version npm resolves. Do not pin a
  `@sparticuz/chromium` or `puppeteer-core` setup.
- This feature crosses an untrusted-input boundary, so the `when-sensitive`
  independent review gate is expected to be selected before `/complete`.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":13497,"specSha256":"90d29f699a0cc8a1c50d09d6283eb356058b467cc40dc39d328c150369ff2b1a","branch":"refs/heads/feature/png-export","head":"0bb18c14814726dccb1bd84fa50270e4a63d8e23","baseRef":"refs/heads/main","baseCommit":"0f24bafc0cc7d8b22abb4976943b3df1667fb2a5","sourceTree":"05d243bf83198aa81185464954548ff707db1cd2","landing":"local-merge","absentOptional":[]} -->

## Findings

### 3/F-03 [P2] closed - Export route buffers a chunked body of any size before the 16 KB check

**File:** app/api/export/png/route.ts:20
**Found:** 2026-10-20 by /audit independent (scope: current; lens: all)
**Why it matters:** The route rejects early only when `content-length` is over
16 KB. A request sent with `Transfer-Encoding: chunked` has no `content-length`
(`Number(null)` is `0`), so `await request.text()` reads the whole stream into
memory before the size check on line 21 runs. There is no `proxy.ts`, so Next's
`proxyClientMaxBodySize` buffer cap does not apply, and route handlers have no
built-in body limit. The client still gets 413, so the response contract holds.
But this public route on a small instance can be made to hold an arbitrarily
large or never-ending body in memory, which the spec's 16 KB trust-boundary
limit was meant to prevent.
**Suggested fix:** Replace `request.text()` with a bounded read: walk
`request.body.getReader()`, sum chunk byte lengths, cancel the reader and return
413 once the total passes `MAX_BODY_BYTES`, then decode the collected bytes with
`TextDecoder`. Keep the `content-length` early check. No current requirement is
lost.
**Resolution:** Fixed in spec step 5: the route now reads the body through `request.body.getReader()` and returns 413 once 16 KB is exceeded. A 1 MB chunked body returned 413 on the dev server, and valid chunked and normal requests still return the PNG. Awaiting independent re-review. Closed 2026-10-20 by /audit independent (fresh subagent, target 0bb18c1): re-examined app/api/export/png/route.ts:20-50. `readBodyWithLimit` sums `value.byteLength` per chunk, cancels the reader and returns null (413) as soon as the total passes 16 KB, so a chunked body is never buffered past the limit; the `content-length` early check is kept; chunks are concatenated before one `TextDecoder` decode, so split multi-byte UTF-8 is handled; a null body yields "" and the existing 400 path. No new defect introduced.

## Independent review

**Status:** passed
**Target commit:** 0bb18c14814726dccb1bd84fa50270e4a63d8e23
**Base commit:** 0f24bafc0cc7d8b22abb4976943b3df1667fb2a5
**Base ref:** main
**Spec hash:** 90d29f699a0cc8a1c50d09d6283eb356058b467cc40dc39d328c150369ff2b1a
**Prepared by:** claude
**Builder model:** claude-opus-5-5
**Requested reviewer:** claude
**Requested model:** claude-opus-5-5
**Requested execution:** automatic
**Requested at:** 2026-10-20T11:26:04Z
**Workflow:** regular
**Check required:** no
**Reviewer adapter:** claude
**Reviewer model:** claude-opus-5-5
**Reviewer context:** fresh subagent
**Actual execution:** automatic
**Reviewed at:** 2026-10-20T11:29:00Z
**Scope:** current
**Lenses:** quality, security, performance, tests
**Verdict:** passed
**Check result:** not-required

### Handoff

Review the active spec and the complete `0f24baf..0bb18c1` delta in a fresh
session or isolated subagent without the builder conversation. Run all Audit lenses from scratch.
Run Check when required above. Do not edit product code, accept findings, or
reuse the existing findings as the review scope.

### Commands

- `git rev-parse HEAD`: pass (0bb18c14814726dccb1bd84fa50270e4a63d8e23, equals Target commit)
- `git merge-base main HEAD`: pass (0f24bafc0cc7d8b22abb4976943b3df1667fb2a5, equals Base commit)
- `sha256sum blueprint/context/current-feature.md`: pass (equals Spec hash; spec is tracked, no snapshot needed)
- `git status --porcelain`: pass (only review.md and findings.md differ)
- `git diff 0f24baf..0bb18c1`: reviewed (16 files)
- `npm run lint`: pass
- `npm run build`: pass (TypeScript ok; /api/export/png dynamic, /render/certificate partial prerender)
- test command: unavailable (none configured)

### Evidence

- Trust boundary: app/api/export/png/route.ts:82 builds the navigation origin only from `127.0.0.1` and `PORT`, never from request URL or Host; only the four validated string fields are passed as search params; the render page (app/render/certificate/page.tsx) renders them through React text only, no `dangerouslySetInnerHTML`.
- Body limit: content-length early check (route.ts:45-48) plus streaming byte-counted read that cancels and returns 413 past 16 KB (route.ts:20-42, 49-50), covering chunked bodies.
- Validation: lib/export-request.ts requires a plain object, string fields, <=200 chars after trim, `date` empty or YYYY-MM-DD; unknown keys ignored, matching the spec.
- Error leakage: 500 returns the fixed spec message; details only go to `console.error`. Content-Disposition filename is built from `[a-z0-9-]` only, so no header injection.
- Resources: one cached launch promise on globalThis, cleared on `disconnected` or launch failure (lib/server/browser.ts); page closed in `finally` (route.ts:98-100); limiter hands slots directly to the next waiter and throws RenderBusyError when 8 are waiting (lib/server/render-limit.ts), mapped to 503.
- Client: DownloadPngButton covers idle, loading (disabled, aria-busy, "Rendering…"), error (role=status, aria-live polite, 503 vs other messages, cleared on next click) and success (object URL revoked after download).
- F-03 re-examined against the repaired code and closed.

### Findings

- No new findings.
- F-03 [P2] closed (repair verified).
- F-01 [P3] and F-02 [P3] remain open (carried, non-blocking); notes updated.

### Remaining risk

- No test command is configured, so `parseExportRequest` and `pngFileName` have no automated tests (spec scopes unit tests out).
- Runtime behavior (PNG dimensions, preview parity, single Chrome process, 413/503 under load) was not re-run by this reviewer; Check was not required and no server was started.
- Render steps after `goto` (`document.fonts.ready`, screenshot, `page.close`) rely on Puppeteer's default protocol timeout, so a hung Chrome could hold a render slot longer than 15 s (unverified).
- Linux/Render deployment behavior is not covered.

## Try it now

Run or do:

With `npm run dev` running, open http://localhost:3000, type `Ada Lovelace`
in Recipient name, and click **Download PNG**.

Expected:

The button shows "Rendering…" briefly, then the browser saves
`certificate-ada-lovelace.png`: a 3300 x 2550 image that matches the preview,
with "ADA LOVELACE" on the name line.

This proves:

The editor's Download PNG button sends the current form to
`POST /api/export/png`, which renders the certificate in the shared headless
Chrome and returns a high-resolution PNG that matches the live preview.
