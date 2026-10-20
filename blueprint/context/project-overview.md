# Certificreate - Project Overview

<!-- blueprint:source-hash b9fad0eac45e8823d12f2dda2b1744d5b11cf1bb22fd2de77cd77ef2a2568e75 -->

> Turn three inputs (name, course, date) into a polished, on-brand course
> certificate and download it as a high-resolution PNG and a print-ready PDF in
> seconds.

## Problem

Certificates are made by hand in Canva today: duplicate the design, retype the
recipient's name, course, and date, then export. It is slow, error-prone, and
cannot be handed off or automated. Certificreate replaces that with a form, a
live preview, and one-click PNG/PDF export, with room for more designs later.

## Users

- **Primary:** Brad / Traversy Media, issuing certificates to students who finish
  a course.
- **Secondary (product direction):** other course creators, bootcamps, workshop
  hosts, and event organizers who need branded certificates without a designer.
- **Later:** students self-serving their own certificate.

There are no access tiers in v1: no login, everyone is anonymous.

## v1 scope boundaries

- No auth, no accounts, no server-side database.
- Everything a user keeps (brand settings, history, last form values) lives in
  browser local storage, per device. Clearing site data wipes it.
- The server exists only to render PNG/PDF files on demand. Files are returned
  as downloads and never stored.
- Not v1 (listed under "Later" in the build plan, unscheduled): accounts and
  cloud sync, server-side issued certificates with public verification links,
  CSV bulk generation, billing.

## Features

In build-plan order. The headline flow is 1-4: template, form + live preview,
PNG export, PDF export.

1. **Certificate template** - recreate the "Black Border" design (blue double
   border, corner flourishes, serif headline, centered logo mark) as a
   self-contained, themeable HTML/CSS component with placeholder data.
2. **Form + live preview** - name, course, date, and instructor inputs bound to
   the template; the preview updates as you type and is the real template scaled
   down.
3. **PNG export** - a server route renders the template with full Puppeteer (one
   shared browser, a new page per request) and returns a high-resolution PNG
   (`deviceScaleFactor` 2-3). Render deployment is done manually by the user
   once this works and is not a build step.
4. **PDF export** - the same pipeline and shared browser output a landscape,
   print-ready PDF (`page.pdf({ landscape: true, printBackground: true })`).
5. **Template/style system** - a few templates sharing one theme (CSS
   variables) and a picker, structured so new styles drop in cleanly.
6. **Brand settings (local)** - saved in local storage and applied to the chosen
   template, preview, and export.
   - **6a. Instructor + colors** - `BrandSettings` type, local-storage store,
     settings panel, instructor default, theme-color overrides.
   - **6b. Logo upload** - logo as a data URL replaces the placeholder mark in
     templates and is carried through the export pipeline.
7. **Certificate history (local)** - each generated certificate saved to local
   storage, a history list to re-open and re-download, and last form values
   restored on reload.
8. **Input polish** - date picker and formatting, Zod validation, long-name
   auto-fit, empty states.
9. **Production hardening on Render** - instance sizing under real renders,
   render-queue behavior under concurrency, env config cleanup, custom domain.

## Data model

No database in v1. Shapes below are derived from the plans; field names are
proposals for the feature specs to confirm.

### TemplateDefinition (static, in code)

- `id` (string) - stable key, e.g. `black-border`; stored in history and form values
- `name` (string) - display name in the picker
- component / HTML+CSS - the markup rendered identically by the preview and Puppeteer
- `fonts` - self-hosted `@font-face` families the template uses
- `themeVariables` (record of CSS variable -> default value) - the shared theme
  that brand colors override
- default logo mark asset

> Locked by feature 1, extended by feature 5. Brand settings (6) and history (7)
> depend on `id` and the theme-variable names.

### CertificateData (form values)

- `recipientName` (string)
- `courseTitle` (string) - course or achievement title
- `date` (string, ISO date) - display formatting arrives in feature 8
- `instructorName` (string) - defaults from `BrandSettings.instructorName`,
  editable per certificate
- `templateId` (string -> TemplateDefinition.id)

> Introduced by feature 2. Also the "last form values" record persisted in
> feature 7 and the core of the export request.

### BrandSettings (local storage)

- `instructorName` (string) - signatory default
- `colors` (record of theme-variable overrides) - applied over the template theme
- `logoDataUrl` (string | null) - uploaded logo; null means the default mark

> Introduced by 6a (instructor, colors) and 6b (logo).

### HistoryEntry (local storage, list)

- `id` (string) - implied by re-open/re-download
- `recipientName`, `courseTitle`, `date`, `templateId` - as in CertificateData
- `createdAt` (ISO timestamp)

> Introduced by feature 7. Re-download re-renders through the export route; no
> files are stored.

### Export request (not stored)

- `CertificateData` plus the brand values needed to render (colors, logo data
  URL), sent to the PNG/PDF route. Validated server-side with Zod.

## Tech stack

- **Next.js 16 (App Router) + TypeScript + Tailwind v4** - the app, already scaffolded
- **shadcn/ui** - app chrome components (not installed yet)
- **Puppeteer (full, bundled Chromium)** - renders the same HTML/CSS template to
  PNG and PDF so preview and export never drift
- **Self-hosted web fonts** - matching the Canva serif, served via `@font-face`
- **Browser local storage** - brand settings, history, last form values
- **Zod** - input validation (not installed yet)
- **Render web service** - hosting
- **Later only:** Render Postgres + Prisma, Clerk, Cloudflare R2, Stripe,
  archiver or jszip

## Monetization

Not in v1: a free tool. If it becomes a product, freemium SaaS: free tier with
watermarked certificates, built-in templates, and limited volume; a paid Stripe
plan removes the watermark and unlocks custom branding, all templates, CSV bulk,
cloud history, and higher volume.

## UI/UX

- `/` - the one screen: form (name, course, date, instructor, template picker) on
  the left, live certificate preview on the right with Download PNG and Download
  PDF buttons. Brand settings panel and history list sit alongside the form. On
  mobile the form stacks above the preview.
- Export route(s) - server endpoint(s) for PNG and PDF. > TODO: exact paths are
  decided in feature 3/4 specs.
- Certificate artifact: formal and classic, light and print-friendly; serif
  display headline, letter-spaced small-cap labels, blue double-line border with
  corner flourishes, centered logo mark between the instructor and date lines.
- App chrome: clean and modern, dark-mode-first.

## Deployment

- **Host:** Render web service (persistent container), Starter minimum, Standard
  (2 GB) preferred, no free tier.
- **Deploy:** created manually by the user right after feature 3 works, with
  auto-deploy from then on. Feature 9 is hardening, not first deploy.
- **Commands:** build `npm run build`, start `npm run start`.
- **Puppeteer:** full `puppeteer` in `dependencies`; `.puppeteerrc.cjs` at the
  repo root sets `cacheDirectory` to `.cache/puppeteer` (add `.cache` to
  `.gitignore`); launch flags `--no-sandbox`, `--disable-setuid-sandbox`,
  `--disable-dev-shm-usage`.
- **Runtime:** launch Chrome once at server boot, one page per request, never
  relaunch per request; cap concurrency at 1-2 renders with a small queue.
- **Fonts:** served by the app; await `document.fonts.ready` before capture.
- **Recovery:** if "Could not find Chrome" appears after a Puppeteer bump, use
  "Clear build cache & deploy".
- > TODO: env vars, health check path, and custom domain name are not specified.

## Open questions

> Resolve in the plans, then re-run /overview.

- **Untrusted input before validation.** The export route is public on Render
  from feature 3, but Zod validation is scheduled for feature 8. The route
  should accept structured fields (not raw HTML) and escape them from feature 3
  onward, since Puppeteer renders whatever it is given.
- **Dark-mode-first vs current standards.** The plan cites coding standards for
  dark-mode-first chrome; onboarding changed `coding-standards.md` to follow
  `prefers-color-scheme`. Pick one and align the standards.
- **shadcn/ui and Zod** are named in the plan but not installed; the coding
  standards still list them as TODO. Decide which feature installs each.
- **History and instructor.** `HistoryEntry` (plan section 4) has no instructor
  or brand snapshot, so a re-download uses current brand settings. Confirm that
  is intended.
- **Logo size.** Logo data URLs in local storage (about 5 MB per origin) and in
  export requests need a size limit.
- **Unspecified render details:** the Canva serif font to self-host, PDF page
  size (Letter vs A4) and margins, PNG pixel dimensions, and how many templates
  "a few" means.
- **Naming:** the plans say "Certificreate"; onboarding titled `CLAUDE.md`
  "CertifiCreate". Pick one casing.
