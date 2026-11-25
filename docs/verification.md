# Verification record

23 November 2026 · No. 01 — Money

| Check | Observed result |
|---|---|
| npm clean install from checked-in lock and local cache | Passed. Local Node 26.13.0 and npm 11.20.0. The project targets Node 24 for CI and Vercel |
| `npm run format:check`, `npm run typecheck` | Passed |
| `npm test` | 28 passed covering arithmetic, eligibility, evidence, fixture separation, repository failures and editorial approvals |
| `npm run review:demo` | Passed. Two independent approvals, a separate publishing actor, a new fixture release and suppression of a conflicting rate |
| `npm run review:intake` | Passed. Two official rate observations staged and one source flagged for recheck. Zero publications |
| `npm run build` | Passed with Next.js 15.5.25 |
| `npm run test:production` | 5 passed covering the compiled API, request validation, production JavaScript excludes fictional and staged records, English and Nepali server rendering, and the compressed JS budget |
| Initial first-party production JavaScript | Landing 112.1 KiB, comparison 130.8 KiB. Summed gzip size of unique route and locale layout chunks in Next’s build manifest. Budget 180 KiB |
| Browser, accessibility, zoom and screenshots | Playwright and axe tests are included. Local sandbox denied binding the test port and prevented Chromium startup. Browser and visual results remain unverified |
| LCP, INP and CLS | Browser lab and field measurements remain unverified |
| PostgreSQL migration and integration | Migration, test transaction and CI configuration are included. PostgreSQL runtime and credentials were unavailable locally |
| Vercel preview | Team access listing succeeded. Project creation returned HTTP 403 for the scoped account. No matching project or authenticated Vercel CLI was available |
| Public dataset | Unseeded. Zero live reviewed offers. The offline fixed-deposit pilot has two rate observations and one source awaiting recheck |
| Publication and source ingestion | Local fixture workflow and database integration boundary verified at code level. Live bank ingestion, authenticated editorial operations and report submission remain pending |

Synthetic fixture manifest SHA-256 is `9479862cd4ab4508e81085a54091a27dbdc00498c7a11952d442dc6a26fad877` over the UTF-8 JSON serialization of `demoRelease()`. The preview mode remains local-development only, and an enabled demo flag in a production process still yields public empty coverage.

The project started in a workspace without a git repository or linked deployment. Production publication, domain changes and data-provider provisioning remain pending.

## 24 November 2026 · Agent setup and comparison update

- Chromium demo suite passed all five journeys. Coverage includes desktop English, 390 px Nepali, 320 px with 200% root text size, axe checks, source inspection, pinned results, card channel selection, request recovery and the editorial walkthrough.
- The browser initially rendered Latin digits in Nepali results despite the locale extension. Explicit display conversion resolved it. The recovery test now targets the comparison form's alert.
- The unseeded public Chromium suite passed its fixture-isolation journey.
- Local verification used Node 26.13.0 and dependencies copied from the previous local install. The production target remains Node 24. The new temporary offline package cache lacked the packages needed for a clean install.
- No live data or hosting was activated. Hosted review, automated ingestion, database integration and native-language review remain open.
- Final release checks passed formatting, TypeScript, 30 automated tests, the fictional editorial walkthrough, production build and 5 built-production checks. The release tests measured 112.2 KiB for the landing route and 130.9 KiB for the comparison route, both gzip and within the 180 KiB budget.

## Catch-first editorial redesign

The redesigned public journey passed 32 automated tests, 5 production checks, 4 fictional-data Chromium journeys and 1 production Chromium journey. Browser coverage includes the homepage, deposit pick and sources, app versus branch fees, language switching with the choice intact, reduced motion, and a 320 px viewport with 200% root text. Public coverage is still empty. Fixture picks appear only in the local demo.

## Production operations checks

The production build, 35 automated tests, five compiled production checks and the Chromium production journey passed. The new tests cover readiness as offers expire or a release is withdrawn, uncached HTTP 503 from an unseeded build and distinguishable notice fingerprints. Source monitoring used controlled responses. Live scheduling, database access and approved offers remain rollout dependencies.

### Bilingual editorial review, 25 November 2026

The review starts at the homepage and follows a 12-month deposit with interest at maturity. The production render checks cover localized metadata, the independence footer, noindex and fixture isolation. The demo browser suite now captures the English homepage, fictional FD results and a Nepali 390 × 844 form. It checks that both selected controls appear in the mobile viewport. CI retains the PNGs in the money-page-screenshots artifact.

Local verification used Node 24.22.3 and the release checks. Both browser suites stopped before navigation when the workspace denied the local listening ports. Browser screenshots, keyboard focus, reduced motion and mobile placement for this revision still need a browser-enabled run.

The visual-review browser suite now also checks that the selected editorial webfont loads in each language. The demo artifacts include a standalone lead-card image. The 390 × 844 default controls, fully visible submit action and keyboard focus checks continue to cover the Nepali form.
