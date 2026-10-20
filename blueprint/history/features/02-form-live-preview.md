# Feature: Form + live preview

**From build-plan:** feature 2
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/form-live-preview`

## Goal

Let the user type the recipient name, course title, date, and instructor and see
the certificate update on every keystroke. This turns the static template from
feature 1 into the app's core editing screen, which later features extend with
export buttons, a template picker, brand settings, and history.

## Design reference

- Layout and form styling: the approved editor mockup, now removed from the
  tree, is in git history at `957c5c0:prototypes/editor.html` (view with
  `git show 957c5c0:prototypes/editor.html`). Use its left form panel (section
  title, label above input, hint text, focus ring) and the preview stage on the
  right. Ignore its template picker, download buttons, and error state; those
  belong to later features.
- Certificate appearance: unchanged from feature 1
  ([cert-example.png](../references/cert-example.png)).

## In scope

- A client-side editor on `/`: a form panel with four labelled text inputs
  (Recipient name, Course or achievement, Date, Instructor) and the existing
  `Certificate` preview, updating as the user types.
- Instructor input pre-filled with a default instructor name and editable per
  certificate. Brand settings do not exist yet, so the default is a constant
  that feature 6 will replace.
- Empty fields fall back to the placeholder text in the preview, so the
  certificate never shows blank lines. The inputs themselves start empty (except
  Instructor) and show the same placeholder text as their `placeholder`.
- Responsive layout: form left (fixed width) and preview right on wide screens;
  on narrow screens the form stacks above the preview and the page scrolls.
- On wide screens the preview keeps the feature 1 behavior: it fits the
  remaining space without page scroll.
- Date picker (user-requested revision): the Date field is a native
  `<input type="date">`. The editor stores the ISO value (`YYYY-MM-DD`) and the
  certificate shows it as `DD/MM/YYYY` (Nigerian format, user-requested;
  the reference image uses `MM/DD/YYYY`).

## Out of scope

- PNG/PDF download buttons and any server route (features 3, 4).
- Template picker (feature 5).
- Brand settings panel, saved instructor default, colors, logo (feature 6).
- Saving form values or history in local storage (feature 7). Values reset on
  reload.
- Zod validation, error states, a choice of date display formats, long-name
  auto-fit, and designed empty states (feature 8). The date picker itself moved
  into this feature (Step 4).

## Build loop

`workflow.stepReview` is `feature`: build all steps, then present one review
packet. `workflow.checkpointCommits` is `disabled`: no checkpoint commits.
`/complete` makes the final feature commit. Never accept a review packet you have
not read; split any diff too large to review.

## Build steps

- [x] **Step 1 - Editor state and form** - create
  `components/editor/CertificateEditor.tsx` (`'use client'`) holding the four
  field values in `useState`, initialised to empty strings except
  `instructorName`, which starts at `DEFAULT_INSTRUCTOR`. Create
  `components/editor/CertificateForm.tsx` rendering the four inputs from the
  values and an `onChange(field, value)` callback. Each input has a visible
  `<label htmlFor>`, a unique `id`, a `name`, `autoComplete="off"`, and a
  `placeholder` taken from `PLACEHOLDER_CERTIFICATE`. The Instructor input has a
  hint ("Default instructor. Edit for this certificate only.") linked with
  `aria-describedby`. Style from the theme tokens to match the mockup's form
  panel. *Done when:* build and lint pass and the editor type-checks.

- [x] **Step 2 - Live preview** - in `CertificateEditor`, derive the props passed
  to `Certificate` by using each field's trimmed value, or the matching
  `PLACEHOLDER_CERTIFICATE` value when it is empty or whitespace. Render the form
  and the preview side by side. *Done when:* build and lint pass, and in the
  browser typing in each field updates the matching certificate line on every
  keystroke, clearing a field brings back its placeholder text, and the
  Instructor field shows the default on first load.

- [x] **Step 3 - Page layout** - render `CertificateEditor` from `app/page.tsx`
  under the existing top bar. At `lg` and wider: form panel on the left (about
  380px, `bg-surface`, right border, scrolls on its own if needed) and the
  preview stage filling the rest with the certificate fitted to both width and
  height (reuse the feature 1 container-size approach). Below `lg`: form above
  preview, certificate full width, normal page scroll. *Done when:* build and
  lint pass, and browser screenshots show the side-by-side layout without page
  scroll at 1440 x 900 and 1366 x 768, and the stacked layout at 390 x 844 with
  no horizontal scroll, with no console errors.

- [x] **Step 4 - Date picker** - change the Date input to `type="date"` with
  `[color-scheme:dark]` so the native calendar control suits the dark theme, and
  no `placeholder` (date inputs ignore it). Keep `date` in editor state as the
  input's ISO value (`""` when empty or incomplete). Add
  `lib/date.ts` with `formatCertificateDate(iso: string): string` that splits
  `YYYY-MM-DD` into parts and returns `DD/MM/YYYY` without constructing a
  `Date` (avoids time-zone shifts), returning `""` for anything that does not
  match. The editor passes the formatted value to the preview, still falling
  back to the placeholder date when empty. *Done when:* build and lint pass,
  and in the browser picking a date shows it on the certificate as
  `DD/MM/YYYY` (for example 2026-10-20 shows `20/10/2026`), clearing the date
  restores the placeholder date, the field is keyboard-operable, and there are
  no console errors.

## Files / areas

- `components/editor/CertificateEditor.tsx` - new, client component, owns state
- `components/editor/CertificateForm.tsx` - new, presentational form
- `components/certificate/placeholder.ts` - add `DEFAULT_INSTRUCTOR`
  (`"Brad Traversy"`, the current placeholder instructor)
- `app/page.tsx` - render the editor instead of the static certificate
- `components/certificate/Certificate.tsx` - no changes expected; it is
  hook-free, so it renders inside the client editor as-is
- `lib/date.ts` - new, `formatCertificateDate` (first `lib/` file, at the repo
  root per coding standards)

## Data / contracts

No persisted data, server route, or external API in this feature.

```ts
// Editor state; field names match CertificateProps.
type CertificateFields = Pick<
  CertificateProps,
  "recipientName" | "courseTitle" | "instructorName" | "date"
>;
```

- All four values are plain strings held in client memory only.
- Preview props: `value.trim() || PLACEHOLDER_CERTIFICATE[field]`.
- Editor `date` is the ISO date string (`YYYY-MM-DD`) from the date input, or
  `""`. This matches `CertificateData.date` in the overview, so features 3 and 7
  receive a parseable date. `CertificateProps.date` stays display text: the
  editor converts with `formatCertificateDate` before rendering.

## Testing

- No test runner is configured, so there is no unit test gate. The only logic is
  the empty-to-placeholder fallback, which is checked in the browser.
- Evidence: `npm run build` and `npm run lint`; browser checks with a running
  dev server: type into each field and confirm the preview line changes; clear
  each field and confirm the placeholder returns; enter
  `<b>Ada</b> & "Lovelace"` in the name field and confirm it appears as literal
  text (no HTML rendered); screenshots at 1440 x 900, 1366 x 768, and 390 x 844;
  no console errors; keyboard Tab order runs name, course, date, instructor.
- Step 4 adds date checks: pick 2026-10-20 and see `20/10/2026`; also check a
  single-digit month and day (2026-01-05 shows `05/01/2026`); clear the date and
  see the placeholder date return.

## Notes for the AI

- User-typed text reaches the certificate only as React text children. Never use
  `dangerouslySetInnerHTML`; feature 3 will render this same markup on the
  server.
- Keep `'use client'` on the editor only. `app/page.tsx` stays a server
  component. With Cache Components enabled, the page should still prerender as
  static; check the build output.
- Use theme tokens and Tailwind utilities (`bg-surface`, `border-border-strong`,
  `focus-visible:` ring with `--focus-ring`, `text-muted`, `text-faint`); no
  hard-coded colors or inline styles.
- Restart the dev server if styles look stale after switching branches; a
  stale Turbopack cache served old CSS after feature 1's merge.

## Open questions

Non-blocking; defaults are chosen above and are cheap to change.

- **Length limits.** Long names or course titles wrap and can overflow the
  certificate frame until auto-fit lands in feature 8. Default: no limit, as the
  plan assigns this to feature 8. Alternative: add `maxLength` now (for example
  60 for name and instructor, 90 for course, 20 for date); say so and the limits
  go into Step 1.
- **Initial values.** Default: fields start empty and the preview shows the
  placeholder sample. Alternative: start pre-filled with the sample values.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":9239,"specSha256":"a3b6d99401b6d4c960e4537d4529095a66b4ee0fe62f02f22bc97e7ce5eae360","branch":"refs/heads/feature/form-live-preview","head":"4aac3a071f934c653d9533e15eefc541af3c9471","baseRef":"refs/heads/main","baseCommit":"4aac3a071f934c653d9533e15eefc541af3c9471","sourceTree":"57ca3fd0562ae45abb4dab0e47ec12dfff8b3c75","landing":"local-merge","absentOptional":[]} -->

## Try it now

1. With `npm run dev` running, open http://localhost:3000/.
2. Type a recipient name and a course title; the certificate updates on every
   keystroke.
3. Pick a date in the Date field; the certificate shows it as `DD/MM/YYYY`
   (for example 20/10/2026).
4. Clear the course field; the sample course text returns in the preview.
5. Narrow the window to phone width; the form moves above the certificate.
