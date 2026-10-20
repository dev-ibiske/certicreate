# Certificreate

Turn a name, a course, and a date into a polished, on-brand course-completion
certificate, then download it as a high-resolution PNG or a print-ready PDF in
seconds.

> **Status:** early development. The certificate template is built; the form,
> live preview, and PNG/PDF export are next. See the [roadmap](#roadmap).

## Why

Course certificates are usually made by hand in a design tool: duplicate the
design, retype the recipient's name, course, and date, then export. It is slow,
easy to get wrong, and impossible to hand off. Certificreate replaces that with
a simple form, a live preview that matches the exported file exactly, and
one-click downloads.

## Features

**Available now**

- "Black Border" certificate template: steel-blue double frame with notched
  corners, serif headline, and a centered logo mark
- Resolution-independent layout: every size scales with the certificate's
  width, so the on-screen preview and the exported file stay identical
- Themeable through CSS variables, so brand colors can be swapped without
  touching the markup
- Self-hosted fonts, with no requests to third-party font services

**Planned for v1**

- Form for recipient name, course title, date, and instructor, with a live preview
- High-resolution PNG export and print-ready landscape PDF export
- Multiple templates sharing one theme, with a picker
- Brand settings (logo, instructor name, colors) saved in the browser
- Certificate history to reopen and re-download past certificates
- Input polish: date picker, validation, and long-name auto-fit

v1 is intentionally local-first: there are no accounts and no database.
Everything you save stays in your browser's local storage.

## Tech stack

| Area | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) with React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, CSS-first theme in `app/globals.css` |
| Fonts | `next/font` (self-hosted Inter, Quattrocento, Montserrat) |
| Export (planned) | Headless Chrome via [Puppeteer](https://pptr.dev), rendering the same template to PNG and PDF |
| Hosting (planned) | [Render](https://render.com) web service |

## Getting started

**Prerequisites:** Node.js 20.9 or later and npm.

```bash
git clone <your-repo-url> certificreate
cd certificreate
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create a production build (includes type-checking) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

There is no automated test suite yet.

## Project structure

```text
app/
  globals.css        Theme tokens (app chrome + certificate colors and sizes)
  layout.tsx         Root layout and self-hosted fonts
  page.tsx           Main screen
components/
  certificate/
    Certificate.tsx  The certificate template
    LogoMark.tsx     Placeholder logo mark
    placeholder.ts   Sample certificate data
blueprint/           Project plans, specs, and build history
```

## Roadmap

1. ~~Certificate template~~ (done)
2. Form and live preview
3. PNG export
4. PDF export
5. Template and style system
6. Brand settings (instructor, colors, logo upload)
7. Certificate history
8. Input polish
9. Production hardening on Render

The full plan lives in [`blueprint/build-plan.md`](blueprint/build-plan.md).

**Possible later directions, not scheduled:** accounts and cloud sync, public
verification links for issued certificates, bulk generation from CSV, and paid
plans.

## How this project is built

Development follows a spec-first workflow: each feature is planned as a spec,
built in small reviewed steps on its own branch, verified in a real browser, and
archived under [`blueprint/history/`](blueprint/history/) when it lands.
Coding conventions are in
[`blueprint/context/coding-standards.md`](blueprint/context/coding-standards.md).
