# Tariff intake and product research

The bank search shows up to five suggestions while typing. Select a suggestion to open its reading in No. The bank's published document sits under Sources. The first dollar-card readings cover NMB, NIC ASIA, Everest and Global IME. Each preserves the bank's currency and distinguishes charges at issuance, on reloading and on payment. Everest's percentage payment fee retains its USD minimum. The Nepal SBI reading explains mobile banking and scheduled-payment fees from sections 30.1 to 30.6 of its 1 June 2026 schedule. Its product page is undated, so the source label shows the date checked.

## Collect official materials

Run `npm run --silent archive:tariffs` from the project root. It visits the catalogued official entry points across the NRB commercial and development bank roster. The archive groups responses by SHA-256, limits request time and size, and rejects redirects and invalid PDFs. HTML may be a fee table or an index. A successful capture records what was retrieved and does not establish the latest effective edition. The script saves the bytes and a timestamped JSON report in the ignored `evidence/stc-archive/` directory. The checked-in index records this run's provenance without distributing the original bank pages.

The Everest HTML adapter emits structured issuance, reload rate, percentage payment fee and payment minimum when the known product section matches. This is a review candidate. It never modifies published amounts. PDFs and additional table layouts still need individually verified adapters or reviewed transcriptions, and a missing source is reported separately from a failed retrieval. The product reading labels its edition or checked date and exposes its section. The existing editorial release workflow owns publication of new ranked offer data.

## Questions to answer, in the words users look for

- Does the bank charge every time I load the card, including the first load? Does the app use a different fee from the branch?
- Does an advertised free reload come with a charge on each payment, a cross-border percentage or an FX charge?
- Do I need a bank account to get the card? Do virtual and physical cards have different issuance or renewal fees?
- Can the card pay a specific merchant or subscription? Treat this as a separate acceptance question. Keep merchant anecdotes out of the fee data.

The questions recur in [a top-up discussion](https://www.reddit.com/r/technepal/comments/1t1hobv/nabil_bank_mastercard_topup/), [a hidden-fee discussion](https://www.reddit.com/r/Nepal/comments/1edxn5x) and [a comparison discussion](https://www.reddit.com/r/NepalSocial/comments/1xofi4c/which_bank_should_i_choose_to_get_a_doller_card/). These posts informed fields and wording. Fee amounts come from [NMB's tariff archive](https://nmb.com.np/np/download/standard-tariff-charges), [NIC ASIA's September 2026 tariff](https://cms.nicasiabank.com/framework/uploads/STC/STC_Sept%202026.pdf) and [Everest's product page](https://everestbankltd.com/product-and-services/card-services/prepaid-dollar-e-commerce-card/).

## 24 November 2026 run

The [source index](../evidence/stc-intake-2026-11-24.json) covers 37 directory banks. It records 29 captured entry points, four entries that did not return an acceptable document, and four banks with an unresolved tariff entry point. The extra Everest product capture and the Nepal SBI, NMB and Global IME PDF captures succeeded. The NMB adapter selects the newest uniquely dated edition in its archive and removes temporary authorization parameters from the report. Several captured entries are HTML archives or older documents. Latest-edition validation remains open outside the dated and attributed readings. The script also identifies same-origin unsigned PDF candidates in HTML indexes for later validation.

The Global IME September 2026 tariff lists a counter charge in a footnote. The app price remains unknown from this document.

## Review successive scans

Run `npm run --silent review:tariffs -- previous.json current.json` to compare two indexes. The report includes changed extracted fields, newly extracted facts, new or changed documents, failed fetches and missing sources. A changed HTML fingerprint alone is a document change. A loss of extraction is a review item without a fee claim. The report leaves publication to the editorial workflow.

The mobile banking guide now includes Everest's individual service charges. The bank distinguishes a free self-service PIN reset from a branch reset. [Everest service charges](https://everestbankltd.com/supports/interest-and-rates/fees-and-services/)

The [second capture](../evidence/stc-refresh-2026-11-24.json) and [review report](../evidence/stc-review-2026-11-24.json) record the follow-up run. Newly extracted Nepal Bank mobile fees appear as newly found facts.

GitHub Actions runs the bank tariff monitor on Mondays and on manual dispatch. Each completed run saves the source index and difference report for 30 days. Reports compare against the checked-in November 24 baseline and will repeat known changes until a reviewed baseline is committed. Publication remains in the editorial workflow.

The mobile banking guide opens its annual-fee comparison on request. Only charges explicitly identified as annual or annual renewal enter the comparison. Nepal Bank's renewal amount is per account. Everest stays visible with its annual amount unconfirmed.

Verification used Node 24, the release checks, and both Chromium suites.

A previously captured URL absent from a later scan appears as `not-observed`. An attempted request that fails still appears as `unavailable`. A new PDF URL can appear alongside the missing one. Verify whether the bank replaced the edition before updating any fee. The regression test covers a rotated supplemental PDF and preserves the unknown fee state. Node 24 verification uses `npm run verify:agent`.

The GitHub run summary groups extracted value changes first, then source gaps and document-only changes. Missing values read “unconfirmed,” including when the other value is a published zero. Download the JSON artifact for the source URLs and full report. The same CLI accepts an optional Markdown summary path after the two indexes.

The summary uses registered bank names, fee labels with units and exact UTC scan timestamps. The JSON keeps stable bank and field IDs for automated consumers. The report test covers same-day scans and a per-account renewal amount.

## PDF tariff extraction

The weekly scanner converts the captured, allowlisted Nepal SBI PDF with Poppler and reads rows 30.1–30.4 for Yono registration, annual charge, PIN reset and cheque book requests. Each row must appear exactly once with its expected label and an explicit NPR amount or `Nil`. Unsupported layouts, missing rows and failed conversions leave the candidate unconfirmed. The captured document fingerprint and source URL accompany the candidate in the review artifact. On a workstation, put Poppler's `pdftotext` on the PATH before running `npm run --silent archive:tariffs`. GitHub Actions ensures it is available.

A Reddit discussion surfaced a practical question about recurring fees for both the card and its companion app. The official tariff review keeps those fee events separate. Account-plan waivers and any requirement to subscribe to mobile banking need their own official evidence before anyone can calculate a combined cost. [Reddit discussion](https://www.reddit.com/r/technepal/comments/1ooz5wz) · [Nepal SBI schedule](https://nsbl.statebank/documents/1872337/1875858/Service%2BCharges%2Band%2BFees%2B2026-06-01.pdf/58266e90-6d22-2610-4bff-d2280689ba61?t=1780303766274)

Global IME's September 2026 PDF adapter checks the personal E-Com issuance column against its virtual and physical card footnote, then extracts the separately labeled counter top-up or withdrawal charge. App pricing remains unconfirmed from this tariff. Unsupported or inconsistent layouts yield no candidate. Node 24 verification covers a distinct corporate column and a changed channel label. [Global IME schedule](https://gibl-assets.gibl.com.np/uploads/Schedule%20of%20Fees%20and%20Charges-%20Sep%202026.pdf)

The weekly review flags `extraction-unconfirmed` when a captured document has an adapter result of `null`. This includes the first scan and puts the source under “Sources to recheck.” A failed download is unavailable, a document with no adapter can still be a new document, and a previously extracted result that disappears is extraction lost. The regression test covers these distinctions without assigning a fee.
