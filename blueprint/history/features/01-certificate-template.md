# Feature: Certificate template

**From build-plan:** feature 1
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/certificate-template`

## Goal

Recreate the "Black Border" certificate as a self-contained, themeable React
component rendered with placeholder data, and port the approved prototype theme
into the app. This is the artifact every later feature (live preview, PNG/PDF
export, template picker, brand settings) renders, so its markup, sizing model,
and theme variables must be stable.

## Design reference

- Source of truth: [cert-example.png](../references/cert-example.png) (the current
  Canva design). Where the plan's prose ("corner flourishes") disagrees, the
  image wins: notched (concave) corners, no flourishes.
- Approved mockup and tokens: [prototypes/editor.html](../../prototypes/editor.html)
  and [prototypes/theme.css](../../prototypes/theme.css). Port the tokens first;
  copy the certificate's structure, frame SVG paths, seal SVG, and cqw sizing
  from the mockup.

## In scope

- Port `prototypes/theme.css` tokens into `app/globals.css` (`:root` values plus
  `@theme inline` mappings) and make the app chrome dark.
- Load Inter (app), Quattrocento and Montserrat (certificate) through
  `next/font/google`, which self-hosts them; replace Geist.
- A `Certificate` component: white paper, steel-blue double frame with notched
  corners, "Certificate" / "of Completion" serif headline, "This is to certify
  that" eyebrow, recipient name over a rule, "Has completed the following
  Traversy Media course:" line, bold course title, instructor and date signature
  lines, and the centered dotted-T logo mark.
- Landscape 11 x 8.5 aspect ratio; every internal size in container-width units
  so the same markup scales to any width.
- Theme colors read from CSS variables so a later feature can override them on
  the certificate root.
- Render it on `/` with placeholder data inside the dark app shell, replacing the
  create-next-app starter page.

## Out of scope

- Form inputs and live updating (feature 2).
- PNG/PDF export and any server route (features 3, 4).
- Template picker or additional templates (feature 5).
- Brand settings, color overrides UI, logo upload (feature 6); the dotted-T mark
  stays a built-in placeholder.
- History, local storage (feature 7).
- Date parsing/formatting, validation, long-name auto-fit (feature 8). Long text
  may wrap; it must not overflow the frame at the placeholder lengths.
- Light mode for the app chrome.

## Build loop

`workflow.stepReview` is `feature`: build all steps, then present one review
packet. `workflow.checkpointCommits` is `disabled`: no checkpoint commits.
`/complete` makes the final feature commit. Never accept a review packet you have
not read; split any diff too large to review.

## Build steps

- [x] **Step 1 - Port the theme and fonts** - replace the color block in
  `app/globals.css` with the `prototypes/theme.css` tokens (app surfaces, text,
  accent, states, certificate colors) and expose them through `@theme inline` so
  Tailwind utilities such as `bg-surface`, `text-muted`, `border-border` exist.
  Drop the `prefers-color-scheme` light/dark switch and the Arial body font. In
  `app/layout.tsx`, swap Geist for Inter, Quattrocento (400, 700), and Montserrat
  (400, 500, 700) via `next/font/google` with `variable` options wired to
  `--font-sans`, `--font-cert-serif`, `--font-cert-sans`, and set metadata title
  "Certificreate" with a one-line description. *Done when:* `npm run build`
  passes, `npm run lint` is clean, and the starter page renders on the dark `bg`
  color in Inter.

- [x] **Step 2 - Certificate component** - create
  `components/certificate/Certificate.tsx` (server component, no `'use client'`)
  with typed props and the full Black Border layout from the mockup: frame SVG
  (viewBox `0 0 1100 850`, notched paths), headline block, name over a rule,
  course lines, footer grid with instructor line, seal, and date line. Put the
  seal in `components/certificate/LogoMark.tsx`. The root sets
  `container-type: inline-size` and `aspect-ratio: 11 / 8.5`; all text sizes use
  the `--cert-*` cqw tokens. Placeholder content lives in
  `components/certificate/placeholder.ts`. *Done when:* build and lint pass and
  the component type-checks with the placeholder data.

- [x] **Step 3 - Render on `/`** - replace `app/page.tsx` with a minimal dark
  shell (top bar with the "Certificreate" brand) and the certificate centered at a
  width that fits the viewport without page scroll at 1440 x 900, using the
  placeholder data. Delete unused starter assets in `public/` only if nothing
  references them. *Done when:* build and lint pass, and a browser screenshot of
  `/` at 1440 x 900 matches `cert-example.png` in layout, frame shape, typography
  roles, and seal, with no console errors.

## Files / areas

- `app/globals.css` - theme tokens, `@theme inline`, dark body
- `app/layout.tsx` - fonts, metadata
- `app/page.tsx` - shell + certificate with placeholder data
- `components/certificate/Certificate.tsx` - new
- `components/certificate/LogoMark.tsx` - new
- `components/certificate/placeholder.ts` - new
- `public/*.svg` - remove unused starter assets (optional)
- `blueprint/context/coding-standards.md` - record `components/` at the repo
  root and the dark-only chrome decision (resolves two onboarding TODOs)

## Data / contracts

No persisted data or API in this feature. The component's props become the
shape later features pass in:

```ts
interface CertificateProps {
  recipientName: string;
  courseTitle: string;
  instructorName: string;
  date: string; // display text, already formatted; ISO -> display is feature 8
}
```

- Theme hook for later features: the certificate reads `--cert-paper`,
  `--cert-ink`, `--cert-label`, `--cert-border`, `--cert-rule`,
  `--cert-seal-ring`, `--cert-seal-mark`. Overriding them on the certificate root
  (or an ancestor) must restyle it. Keep these names stable.
- Placeholder data matches the reference: "Student Name", "Coding With AI:
  Planning To Production", "Brad Traversy", "07/13/2026".

## Testing

- No test runner is configured (`AGENTS.md`), so no unit test gate. This feature
  is UI-only anyway.
- Evidence per step: `npm run build` and `npm run lint` after each step; for
  step 3, a browser screenshot of `/` at 1440 x 900 compared against
  `blueprint/references/cert-example.png`, plus one narrower width (for example
  768 px) to confirm proportions hold when scaled.

## Notes for the AI

- Next.js 16 with Cache Components enabled; read the relevant guide in
  `node_modules/next/dist/docs/` before using framework APIs.
- Render all user-facing text as React text children. Never use
  `dangerouslySetInnerHTML`; later features feed user input into these props
  and the export renders this markup.
- Tailwind v4 utilities for styling. Use the theme tokens (`var(--cert-*)`,
  Tailwind theme utilities, arbitrary values like `text-(length:--cert-title)`);
  no hard-coded colors, no inline `style` props. SVG `stroke`/`fill` may
  reference CSS variables.
- The certificate stays light regardless of the dark chrome.
- `prototypes/` is reference only; do not import from it. It is removed at this
  feature's `/complete`, after `theme.css` is ported.
- The headline/sans fonts are best guesses at the Canva fonts. Keep the font
  choice to the three `next/font` calls in `app/layout.tsx` so swapping is a
  one-line change.

## Open questions

Non-blocking; defaults are chosen above and are cheap to change.

- Real Canva font names. Default: Quattrocento + Montserrat.
- App chrome dark-only vs a light option. Default: dark-only, matching the
  approved prototype.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":7707,"specSha256":"7b188131c417aa7b7aa2ed147d3403937c5dac3569b8ec86ad16156664e22b98","branch":"refs/heads/feature/certificate-template","head":"957c5c0526c073bbef547e652030698bf2a9fe1a","baseRef":"refs/heads/main","baseCommit":"957c5c0526c073bbef547e652030698bf2a9fe1a","sourceTree":"8e1bb20e242a4b9271b5f2b4f84535f5c3d72fea","landing":"local-merge","absentOptional":[]} -->

## Try it now

1. With `npm run dev` running, open http://localhost:3000/.
2. Expect a dark top bar reading "Certificreate" and, below it, the white
   certificate: steel-blue double frame with notched corners, "Certificate / of
   Completion", "STUDENT NAME", "Coding With AI: Planning To Production",
   "BRAD TRAVERSY", "07/13/2026", and the dotted-T logo mark.
3. Resize the window: the certificate scales as one piece without page scroll.
