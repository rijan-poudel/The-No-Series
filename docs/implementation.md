# Implementation decisions

The blueprint starts with USD cards. The Money brief leads with fixed deposits. The app features fixed deposits and implements the first dollar-card milestone as a second entry from the same landing page. Both use the same trust model. Institutional and foreign-currency deposit choices return an explicit coverage message. The route tree is ready to serve as a standalone Money product. Host and DNS decisions remain open.

| Screen    | 390 CSS px                                                          | 1440 CSS px                                                                     |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Discovery | One main action, then a stacked calculation guide and product links | Headline and action beside a calculation guide. Secondary product choices below |
| Setup     | Stacked flow with inputs and expandable assumptions                 | Form next to the assumptions panel                                              |
| Results   | Stacked result groups with a visible catch and expanding detail     | Same groups, larger figure row and comparison board                             |
| Sources   | Single column for publisher, locator, dates and excerpt             | Same readable width with a return path to the prior result                      |

Browser navigation preserves the current visit’s inputs and pins in memory. A fresh document starts a fresh visit. A URL hash identifies the comparison view. The label set includes Nepali controls and error text, with locally bundled fonts for both scripts. A native-language review is a release gate.

## Architecture and acceptance checks

One Next.js App Router app serves localized pages and a typed POST API. The domain engine receives a scenario, release and explicit clock. The published projection uses a read-only PostgreSQL view over PostgREST. It checks the current pointer with caching disabled. The same view exposes a revoked flag and omits the revoked manifest. A missing configuration yields empty coverage, an invalid response or connection failure yields a recoverable 503, and an explicit revocation yields a distinct result.

| Requirement                                                                            | Verification                                               |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| FD eligibility, dates, schedules and calculations                                      | `tests/engine.test.ts`                                     |
| Dollar-card app and branch fees, known subtotal, recurring fee timing                  | `tests/engine.test.ts`                                     |
| Transient scenario and localized navigation                                            | `tests/e2e/journey.spec.ts`, `tests/e2e/public.spec.ts`    |
| Source validation, revocation, fixture exclusion and read-only projection              | `tests/repository.test.ts`, `scripts/check-production.mjs` |
| Detect changed and missing statements, require independent approval, withhold conflict | `tests/workflow.test.ts`, `scripts/review-demo.ts`         |
| Transactional pointer, revocation and audit/outbox writes                              | `db/test_evidence.sql`                                     |
| English and Nepali render and browser accessibility                                    | `scripts/check-production.mjs`, Playwright/axe journeys    |

## Calculation contract

Amounts and rates are decimal strings. Dates are Gregorian ISO strings interpreted for offer applicability using Asia/Kathmandu. Effective intervals are start-inclusive and end-exclusive. Principal and term ranges carry explicit inclusivity. Rate offers need evidence for every declared fact. Ambiguous, stale, expired, changed, overlapping, future and disputed rows stay outside ranking.

The supported accrual basis is contract months divided by 12. Maturity is reached by adding calendar months to the opening date and clamping to the last day of a shorter month. Per-event interest and withholding use half-up rounding to two decimals. Compounding and payout are modeled separately. The engine withholds ranking if missing tax or fees makes net interest unknown. Missing periodic withholding can also make gross compounding unknown. Quarterly stubs remain uncalculated.

For the fictional APR of 6.20% on NPR 100,000 over twelve months, four payments gross NPR 1,550 each. With fictional 5% withholding, each pays NPR 1,472.50. Net interest is NPR 5,890, final payment with principal is NPR 101,472.50 and receipts total NPR 105,890. Withdrawal simulation supports one explicitly modeled repricing method in the engine. Current fixture results show withdrawal policy, with calculation unavailable.

Dollar-card cost uses known issuance, the recurring charge with explicit start year, and selected channel top-ups. Transaction costs, FX, closure and unknown future tariffs are outside this estimate. App and branch charges are evaluated independently. Mixed card formats and different deposit payout schedules have separate rank groups. The default orders net interest descending or cost ascending, then uses stable identifiers. An optional name sort stays within groups.

## Launch risks and open gates

| Issue                                              | Release condition                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Official notices can change under the same URL     | Establish access rights, parse approved HTML/PDF sources, and monitor content and semantic fingerprints       |
| Official terms can conflict or omit key conditions | Independent approvals, separate publishing actor, field-level citations, verified dates, conflict suppression |
| Tax and FX affect actual outcomes                  | Qualified review of applicable tax rules and each explicit FX rule                                            |
| Data infrastructure is unprovisioned               | Verify PostgreSQL migration, provision authentication and roles, rehearse revocation and restore              |
| Reports need an owner and destination              | Connect an approved channel with abuse controls and a named triage owner                                      |
| Browser and language quality still needs review    | Run Playwright, axe, screen-reader, narrow-width and cold-cache checks. Obtain native language review         |
| Brand, legal and ownership decisions               | Confirm domain, code and data licenses, collection rights, reviewers and incident owners                      |

## 24 November 2026 update

Deposit setup now offers 3, 6, 12 and 24 month presets alongside custom month entry. Presets change only the scenario field. The comparison still evaluates the exact selected term against reviewed offer boundaries. The visible pressed state follows the typed value, including Devanagari numerals.
