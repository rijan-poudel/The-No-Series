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

The screenshot suite captures the English and Nepali homepage at 1366 × 900 and 390 × 844, verifies the 690 px shared column at 1024, 1366 and 1920 px, and checks the Nepali result against its ISO verification date. Date regression tests cover the published Mangsir boundary and the Gregorian fallback past the converter’s range.

## 25 November 2026 · Directory and bank comparison

Node 24.22.3 passed the release workflow, including 53 unit tests and five compiled production checks. In-process rendering checked the Nepali Green Development Bank profile and publisher correction, class directory, unseeded goal rankings and Everest versus Nepal SBI comparison. The separate November 25 intake validated six observations and one channel-dependent case with zero publications. Both Playwright configurations were attempted and stopped before navigation because binding 127.0.0.1 on ports 3210 and 3211 returned EPERM. Keyboard, visual, narrow-width and reduced-motion verification for these changes remains pending. Deployment and independent approval of product offers remain open.

## 25 November 2026 · Product filters and channel-specific intake

On Node 24.22.3 the release workflow passed 54 unit tests and five compiled production checks. The server render check exercises each of the 37 profiles in both languages, the product-specific two-bank table and links from Coverage. The current intake contains 13 observations for 11 banks. The other 26 registry entries remain in the editorial follow-up list. Both browser suites again stopped at local server startup with EPERM. A separate headless Chromium launch also exited before loading a page. Visual and keyboard checks remain open alongside independent offer review and deployment.

## 26 November 2026 · Choosing comparable banks

The product selector groups banks by the available fee readings or tracked deposit notices and keeps the full directory selectable. A fee-only comparison hides the term field. Search suggestions support Up, Down and Escape, and an empty search displays localized feedback. The compiled render check covers the notice group. The public browser suite includes narrow-screen selection and keyboard lookup cases. Local Chromium exited during launch before browser assertions ran.

The two-bank results now filter fee categories by whether each bank has a published figure. Conditions, currency, billing basis and the source edition stay with each amount. Compiled page checks exercise both fee filters and a Nepali pair without shared fee data.

## Homepage visual audit — 28 November 2026

Scope covers the English and Nepali Money homepages and their shared navigation. Local verification used Node 24.22.3. The release command passed formatting, type checking, 57 tests, the editorial walkthrough, the production build and five production checks. Production HTML was exercised for both languages through Next's in-process request handler. The design scanner reported zero findings on home.tsx, product-mark.tsx, shell.tsx and bank-search.tsx. That scanner does not render pages.

OVERRIDE: #0F766E → #3F31D9 [brand: docs/product-memory.md and app/styles.css]

NO-PROOF: user supplied none

| Pre-delivery item | Result | Evidence |
| --- | --- | --- |
| Brand colour | PASS | The wordmark, primary button and keyboard ring use the established brand token documented above. |
| Gradient budget | PASS | The masthead, page, search controls, marks and product list use solid fills in app/styles.css. |
| Display face, weights and scale | PASS | Instrument Serif and Tiro Devanagari Hindi supply the headline and 25 px index titles. Text and controls use regular, medium and bold weights. |
| Text and control contrast | PASS | Calculated light-palette WCAG ratios are 15.95 for headline on canvas, 6.46 for muted copy on the hovered row, 7.24 for placeholder text on white and 7.92 for button text on brand blue. |
| Measures, section spacing and full-bleed break | PASS | The white masthead spans the viewport. The shared 690 px grid contains a 15ch headline, 54ch introduction, search form and compact index. |
| Repeated grid and hierarchy | PASS | home.tsx renders one search action and a vertical product index. Each row leads with the product title. |
| Radius scale | PASS | The product row hover uses 4 px corners and search controls use 6 px. The wordmark has its existing stamp shape. |
| Scaling, glass and emoji | PASS | ProductMark uses four filled SVG paths. Home row hover changes only background colour. |
| Copy and action labels | PASS | Localized copy names the country, products, search action and directory. The search field supplies a real example bank name. |
| Metrics and social proof | PASS | The homepage displays no metrics or testimonials. NO-PROOF: user supplied none |
| Sample labelling | N-A | The homepage presents navigation and bank lookup. Sample offers belong to the demo results route. |
| Semantic landmarks and language (P0) | PASS | shell.tsx contains header, main, navigation and footer. The locale layout sets html lang. The production bilingual render check passed. |
| Real controls (P0) | PASS | Bank search uses a native form, input and submit button. Directory, suggestions and product destinations are anchors. |
| Modal focus and Escape (P0) | N-A | Search suggestions appear in document flow. There is no modal or overlay. |
| Custom select or combobox (P0) | N-A | The native search field filters separate destination links. Activating one opens a profile. There is no option-selection widget. |
| Icon-only control names (P0) | PASS | The home wordmark link carries its localized accessible name in shell.tsx. The four decorative marks are hidden from the accessibility tree. |
| Client secrets and HTML injection (P0) | PASS | Homepage client components render localized strings, URL parameters and public bank-directory entries through React. They contain no credential or raw HTML sinks. |
| Data fetching (P0) | PASS | The homepage renders on the server. Bank suggestions filter bundled public directory data locally with findBanks. |
| Image alternatives | N-A | There are no content images. Every decorative mark sits alongside its text label. |
| Visible keyboard focus | UNVERIFIED | CSS specifies a 3 px ring with 4 px offset. Browser execution was blocked before a visual focus check. |
| Form labels | PASS | bank-search.tsx associates a localized visible label with the input through useId and htmlFor. |
| Validation states | PASS | The search input uses native required validation. A localized role=status message reports a query with zero matches. |
| Non-colour state cues | PASS | Search feedback is text. Suggestions are named links. Keyboard focus uses a ring with an offset. |
| Motion and reduced motion | PASS | The index has a 120 ms background transition. The reduced-motion media rule disables transitions. This check inspected CSS. |
| Cross-cutting contrast | PASS | The input edge has 3.74:1 contrast against the canvas. The brand-colour directory link has 6.78:1 on hover. See measured text pairs above. |
| Catalogue tell count | UNVERIFIED | Source scan found zero violations across the four homepage components. A rendered per-element count still requires a browser. |
| Logo-swap judgement | UNVERIFIED | The passbook, certificate, card and receipt marks were drawn for this page. A visual judgement requires the rendered composition. |

Both Playwright suites attempted startup. The sandbox denied binding 127.0.0.1 on ports 3210 and 3211. A standalone Chromium launch also failed at macOS Mach-port registration. Keyboard traversal, the responsive sweep at 375, 768, 1024 and 1440 px, reduced-motion rendering and screenshot review remain release dependencies.

### Everyday banking follow-up

The bilingual homepage now links directly to branches and usage cost. The branch regression checks both NMB and एनएमबी combined with Pokhara, and an explicitly conflicting bank selection. Exact code and pagination cases passed. The release check passed 57 tests and five production checks. The homepage remains at 122.0 KiB gzip against the 180 KiB limit. The four-component source audit reported zero findings. The preceding audit applies to the homepage, with the additional everyday tools landmark using a localized accessible name, ordinary anchors, a solid background and 44 px targets. Shared fee filters now add a shape to the current state. The public browser suite includes the new Nepali keyboard journey at 375 px under reduced motion. Local browser execution still requires a host that permits loopback listening.
