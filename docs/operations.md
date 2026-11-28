# Editorial and deployment operations

## Pilot source intake

These are candidate entry points. They currently supply zero approved offers.

| Authority or publisher    | Use                                                                          | Destination                                                                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nepal Rastra Bank         | Institution identity and eligibility for inclusion in the source registry    | [BFI Regulation Department](https://www.nrb.org.np/departments/bfr/)                                                                                             |
| Nepal Bank                | Date-specific deposit notice, product terms and tariff                       | [Nepal Bank](https://nepalbank.com.np/)                                                                                                                          |
| Nabil Bank                | Deposit notice and iCard applicability                                       | [Interest notices](https://www.nabilbank.com/interest-rate) · [iCard](https://www.nabilbank.com/service/nabil-icard)                                             |
| Global IME Bank           | Deposit notice and channel-specific dollar-card terms                        | [Interest notices](https://www.globalimebank.com/interest-rates/) · [E-Com Card](https://www.globalimebank.com/products/cards/e-com-card-usd-dollar-card-nepal/) |
| Inland Revenue Department | Applicable withholding legislation and official notices for qualified review | [Inland Revenue Department](https://ird.gov.np/)                                                                                                                 |

For a candidate, record rights and access constraints before enabling a source. Keep the original publication date, effective interval, observation time, verification time, original calendar wording, content fingerprint and evidence location separate. Retain source bytes only where archive rights permit it. A replaced notice should trigger comparison with the previous semantic fingerprint, and a missing or conflicting row should trigger suppression until review. Schedule rates daily and tariffs weekly once source rights, worker identity, job limits and incident routing have been approved. The bounded local JSON simulation (under Coverage → Source review walkthrough, or `npm run review:demo`) exercises observation, semantic diff, candidate review, immutable publication and conflict suppression without external requests.

## Fixed-deposit intake

The first intake covers regular individual NPR deposits with a 12-month term. The dated snapshot in `evidence/` stages two official bank rows and one source that needs rechecking. Nabil's notice supplies the original effective-date label. The intake leaves its Gregorian conversion unset until separately confirmed. Nepal Bank prints both calendars and gives a minimum deposit. Confirm the open evidence fields before preparing a publication manifest.

```sh
npm run review:intake -- evidence/fd-pilot-2026-11-23.json
npm run review:intake -- CURRENT.json PREVIOUS.json
```

Run without a baseline for an initial capture. With a baseline, the review report flags a changed rate, term, minimum or effective date and includes the prior values. Differences in decimal formatting and source excerpt wording leave the comparison fingerprint unchanged. Record a row as missing only after checking its source table and scope. Use unavailable for a page that fails to expose the table. Confirm missing and changed rows with a reviewer before updating an active release. The intake command reads local JSON and prints a review report with zero publications.

## Database and publication

Run `psql -v ON_ERROR_STOP=1 -f db/001_evidence.sql -f db/test_evidence.sql` on an isolated database. Provision separate migration, trusted editorial service and public-read identities. Verify SQL grants and exercise two different human reviewer identities and a third publisher. Bind session identities in the trusted editorial service before calling publication functions. The hosted reviewer UI, scheduler, permitted HTML/PDF adapters and outbox consumer still require implementation and operational ownership.

For Supabase, expose just the `money_public` schema and grant the gateway’s `anon` role schema usage plus `SELECT` on `money_public.active_manifest`. The migration grants no application privileges. Verify the role cannot read base tables or execute editorial functions. Set the server-only `MONEY_PUBLIC_DATA_ORIGIN` to the project origin and `MONEY_PUBLIC_DATA_KEY` to a scoped publishable key. Leave both unset for an unseeded environment. Use environment-scoped projects and credentials.

Publish from a transaction containing the immutable manifest and release-to-candidate links. Check every field and citation against the reviewed release candidate. Activate with the expected prior pointer and the publisher’s authenticated identity. The pointer and outbox update together. The frontend selects the current projection with no caching. Revocation uses the incident operator identity and is separate from code rollback. Review and republish a new revision after resolving a conflict or restoring previously published information. Recheck expiry before restoration.

During an incident, identify the affected offer and source, suppress the affected scope, publish a correction linked to the offer, and have an independent reviewer verify the revised data. For an incorrect release, record the scope and revoke it. For a database outage the comparison API returns a recoverable error. Keep scenario data out of operational logs. After key rotation, verify the read-only grants, revoke the old key, and test the gateway and empty/revoked states again.

## GitHub and Vercel

Use the checked-in npm lockfile and Node 24. Run type checks, tests, production build, built-API checks, database checks and browser journeys before approval. Bind the project to a reviewed GitHub repository and require the CI checks on the production branch. Use Vercel Standard Protection for preview, isolated data, and a no-index build. Add a production domain and activate verified data only after release approval.

Confirm at least three verified institutions for one genuinely comparable scenario as the proposed pilot gate. Confirm source rights, independent reviewers, Nepali copy, consumer-facing terms and incident ownership before enabling live comparisons.

## Production readiness

Monitor `GET /api/v1/readiness` independently of a homepage request. The route reads the current public pointer and evaluates the same date, evidence, overlap and freshness rules used by the picks. It returns HTTP 200 with `ready` when at least one current reviewed offer exists. It returns HTTP 503 with `unseeded`, `unavailable`, `withdrawn` or `no-current-offers` otherwise. It never exposes provider details and responses are uncached. An unseeded staging deployment is expected to report 503. The homepage and guides stay reachable and explain the lack of recommendations in context.

Readiness is a service signal. A launch still requires the pilot coverage, review and rollout checks above. Use the homepage to check HTTP reachability separately so an intentional dataset withdrawal remains distinguishable from an app outage.

## Notice change checks

Run `npm run --silent monitor:sources -- [baseline.json]` after approving access to the pilot bank pages. The optional baseline maps source IDs to their last observed SHA-256 fingerprints. Save the JSON output in the operator's review log. A new or changed fingerprint calls for manual review of the cited row. Unavailable sources exit with code 2 and retain an unknown fingerprint. The check follows only the fixed pilot source list, uses bounded requests and stores fingerprints without storing bank documents. It never changes a public release. The normalized intake command still handles facts, dates and missing rows after review. Schedule the command in your approved environment with an explicit owner for failures and changes.

## Savings-account source checks

Run `npm run --silent monitor:savings -- [baseline.json]` to watch the linked interest notices and separate account-term pages that underpin the savings shortlist. The baseline maps a stable source ID (for example, `nmb:rate` or `nmb:account-terms`) to a SHA-256 fingerprint. The monitor is bounded to 2 MiB per allowed source, rejects redirects and unsupported formats, and reads at most four sources concurrently. HTML fingerprints normalize visible text so rotating scripts and markup do not become false content changes; PDFs and images retain their raw-byte fingerprint. It reports `new`, `unchanged`, `changed` or `unavailable`. It does not parse amounts, infer a zero, refresh a verification date, or publish data. A changed or unavailable result is a reviewer task: read the document, update only the supported field-level data, record the source date and complete the independent approval path before a release. The checked-in 28 November baseline is fingerprint-only, uses this normalized format, and has no approval meaning; the Monday/Thursday GitHub workflow uploads its report and adds the exact source IDs to the run summary.

`npm run --silent inspect:savings` is a separate, review-only candidate reader for the three account pages whose minimum-balance wording has a tested strict adapter. It returns `extracted`, `unconfirmed` or `unavailable`, plus the official URL and capture time. It retains no source page and has no write path. The scheduled workflow keeps that candidate report alongside its fingerprint report. Do not copy a candidate into a public reading merely because extraction succeeds: confirm the named account, current edition, zero wording and any eligibility conditions, then use the normal independent review process.

The first below-minimum-balance adapter is Nepal Bank’s current service-charge page. It accepts only the explicitly labelled `Insufficient Minimum Balance` and `Free` pairing, then returns a review candidate of NPR 0. This establishes a fee for falling below the listed minimum; it does not establish that the account is a zero-minimum account.

## Automatic bank notice intake

The Coverage page links to a bilingual Published bank notices view. It checks two fixed official HTML sources for personal NPR rates at 3, 6, 12 and 24 months. The adapters require a single dated notice and unique recognizable table row, ignore unrelated rows, and suppress future, old, ambiguous or unavailable notices. Source URLs are allowlisted in code. Output contains only attributed rates and dates. It stays outside the reviewed recommendation manifest because the notices leave some product conditions unresolved.

The first request fills the notice cache. Subsequent visits revalidate after an hour. A daily Vercel schedule warms the same cache through the bearer-authenticated refresh endpoint. Configure Vercel's server-side `CRON_SECRET` once when connecting the deployment. Without that setting, visits still refresh the cache automatically. Cache snapshots more than two hours old are suppressed. Known HTML contract changes can require maintenance of the adapter.

If a fixed-deposit choice has no reviewed pick, its guide links to the advertised notices for that term. Each adapter maps its bank’s own band boundaries before showing a rate.

The 25 November deposit intake stages thirteen 12-month individual NPR observations across eleven banks for review. Run `npm run review:intake -- evidence/fd-intake-2026-11-25.json`. Boundaries in that file describe whole-month choices. A published band ending below two years has a maximum of 23 whole months. Confirm edition, eligibility, amount band, payout and early-withdrawal terms and obtain independent approval before publishing any of these figures.

Kumari and Mahalaxmi have distinct in-person and mobile-app rows. The intake compares each channel with its own previous observation, and records the payout schedule where published.

The intake CLI also reports the full roster, banks with captured rates and the official source for each unresolved bank. A bank absent from a snapshot is marked not-captured. A checked source with an unavailable row retains its recorded status.
