# Fix: Upgrade Next.js to 16.4.3

**Type:** Fix
**Status:** verified
**Branch:** fix/upgrade-next-js-to-16-4-3

## The problem

The app pins `next` 16.4.0. `npm audit` (2026-10-24) reports a critical
advisory covering `next` 16.0.0 - 16.4.0:

- unauthenticated remote code execution in the Image Optimization API when
  SVG files are used
- unauthenticated remote code execution in `use cache` functions that return
  typed arrays
- denial of service in the App Router through Server Actions

The app is public on Render and enables `cacheComponents`. `npm run build`
also now stops with Next's `SecurityFatalError` before continuing.

## The fix

Bump `next` and its matching `eslint-config-next` from `16.4.0` to `16.4.3`,
the patch release npm audit names as the fix. Both keep the exact pin style
already used in `package.json`. No code, config, or other dependency changes.
Nothing else in the app may change: the editor, the live preview, the PNG
export, and its status codes.

## Build steps

- [x] **1. Bump Next.js.** Run
  `npm install next@16.4.3 eslint-config-next@16.4.3 --save-exact`.
  **Done when:** `package.json` and the lockfile resolve `next` 16.4.3, and
  `npm audit` shows no `next` advisory. `npm run lint`, `npm run test`, and
  `npm run build` pass, with the build showing no `SecurityFatalError`. A
  production server built from this branch (`npm run start` on a spare port)
  serves `/` with 200 and real certificate fonts. Its
  `POST /api/export/png` returns 200 with a 3300x2550 PNG using
  Quattrocento/Montserrat, and bad input still gets 400.

## Verify

- `npm audit` shows no advisory for `next`.
- Lint, test, and build pass.
- Export a PNG from the production server and confirm the fonts and size.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":1737,"specSha256":"243a0ea07316a9e72c66179bb8ad0a56968b7e8094a4294553dc291960ab3bc4","branch":"refs/heads/fix/upgrade-next-js-to-16-4-3","head":"7a9b377e54f63154e0bbc5524f93fdeff29295b4","baseRef":"refs/heads/main","baseCommit":"7a9b377e54f63154e0bbc5524f93fdeff29295b4","sourceTree":"dc5ac2096d3e5ea99c0cbcbcdd3e0c0b1a2c722e","landing":"local-merge","absentOptional":[]} -->

## Try it now

Run or do:

`npm ls next` and then `npm audit` in the project root.

Expected:

`npm ls next` shows `next@16.4.3`, and `npm audit` ends with `found 0 vulnerabilities`.

This proves:

The app now runs the patched Next.js release, and the critical Next.js advisory no longer applies.
