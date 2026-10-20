# Findings

> **Generated file.** The findings ledger: review findings raised by `/audit`
> against the work in progress, each with a durable ID, severity (P0-P3), and
> status. `/implement` marks repaired findings `fixed`, a later `/audit` pass
> moves them to `closed`, and `/complete` refuses to land while any P0 or P1
> finding is `open` or `fixed`, then archives resolved findings with the work
> and resets this file.

### F-01 [P3] open - A five-digit year silently shows the placeholder date

**File:** components/editor/CertificateForm.tsx:47
**Found:** 2026-10-20 by /audit (scope: current; lens: all)
**Why it matters:** The native date input accepts years longer than four digits.
Typing `01/01/20266` gives the value `20266-01-01`, which `formatCertificateDate`
(lib/date.ts:1) correctly rejects, so the preview falls back to the placeholder
`07/13/2026`. The user sees one date in the field and a different, real-looking
date on the certificate, with no hint why. Reproduced in the browser.
**Suggested fix:** Add `max="9999-12-31"` to the date input (Chrome then limits
the year segment to four digits and the picker cannot go past it). Proper
error feedback for invalid dates stays with feature 8's validation.
**Resolution:** Still open at 0bb18c1 (re-checked by /audit independent): the date input still has no `max`. With the export route, a five-digit year now also returns 400 from `/api/export/png`, so the button shows "Could not create the PNG" while the preview shows the placeholder date; same root cause and fix.

### F-02 [P3] open - Editor state type reuses the certificate props type with a different date format

**File:** components/editor/CertificateEditor.tsx:13
**Found:** 2026-10-20 by /audit (scope: current; lens: all)
**Why it matters:** `CertificateFields` is `Pick<CertificateProps, ...>` over all
four keys, so it is the same type as `CertificateProps`. But `CertificateProps.date`
is documented as formatted display text while `CertificateFields.date` holds an ISO
value. TypeScript cannot catch passing raw editor state straight to
`<Certificate>`, which would print `2026-10-20` on the certificate; features 3 and
7 will build on this state shape.
**Suggested fix:** Declare `CertificateFields` as its own interface (four string
fields, `date` documented as ISO `YYYY-MM-DD` or `""`) instead of picking from
`CertificateProps`. No behavior change; nothing is lost.
**Resolution:** Still open at 0bb18c1 (re-checked by /audit independent): the type moved unchanged to lib/certificate.ts:6 and is now also used by the export route and render page; the defect and fix are the same.
