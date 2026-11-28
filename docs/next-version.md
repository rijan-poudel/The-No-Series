# Retail bank coverage

The directory covers 20 commercial banks and 17 development banks. Each bank profile links to its official publisher and shows the coverage of savings, ordinary individual 12-month NPR fixed deposits, dollar-card charges and mobile banking charges.

| Reader task               | Implemented in this version                                                                                                                                                   | Remaining evidence or functionality                                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Find a bank or branch     | Bilingual profiles for 37 banks, register dates and capital, and 5,953 dated NCHL-IPS entries across 36 banks                                                                 | Reconcile new source editions and confirm location-level hours and services with each bank. Karnali has an official locator.                                                      |
| Compare savings           | Compare 22 named accounts from the Mangsir 2083 notices. Two-bank comparisons show annual rates, minimum balances, sources and whether each minimum fits the reader’s balance | Capture other banks and account variants, including eligibility, interest crediting and withdrawal rules.                                                                         |
| Compare fixed deposits    | Two dated editorial intakes cover 23 distinct banks. Profiles show the date of the last observation.                                                                          | Obtain current individual 12-month rows for 14 banks. Confirm payout, eligibility, limits, tax, early withdrawal, fees and notice validity before independent review and release. |
| Estimate everyday fees    | A reader chooses annual domestic off-us ATM withdrawals and optional mobile renewal for one existing account. Known zeroes and missing figures remain distinct.               | Complete remaining ATM and mobile schedules, then support card issuance, renewals, transfers, tiered fees and exemptions.                                                         |
| Choose a bank for a goal  | The existing best-by-use page checks approved offers by payout or card fee event.                                                                                             | Publish eligible reviewed offers and show comparable market coverage for each goal. Add scenario rankings as evidence becomes complete.                                           |
| Check specialist products | Official publisher links for each bank, Nepal Bank's opening checklist, and sourced examples covering debit issuance, RTGS transfers, credit and remittance terms             | Collect product-specific remittance terms, card eligibility and loan costs. Verify rate bases, spreads, mandatory fees and reset dates before comparing credit.                   |

## Refresh and release

Record each new observation against its bank, notice edition, exact account or term, channel, units, source locator and capture date. Use dated intake files so reviewing a new source never silently re-dates older observations. Regenerate the public per-bank check metadata with `node scripts/fd-coverage.ts > src/data/fd-bank-checks.json` when a notice is read and run the coverage regression check.

Run the intake review for each new file and run the full release checks. Retain superseded source editions for audit, suppress stale offers from rankings and keep partial fee totals visibly incomplete. Additional institution classes need a separately reconciled roster and comparable products before joining a retail comparison.

Reproduce the January branch edition by converting the official NCHL PDF with pdftotext in layout mode and passing that text file to scripts/import-ips-branches.py. A new edition needs a bank-code reconciliation and refreshed edition labels.

## Next release priorities

1. Make the savings shortlist usable on phones. Readers can now filter accounts by whether a known minimum fits their balance, inspect unknown minimums separately, and carry a selected bank and balance into comparison.
2. Complete the missing savings minimums from account-specific terms. Keep the verification date of new account evidence separate from the date of the rate notice. NMB Go-Green was checked on 28 November.
3. Resolve the remaining one-year deposit gaps and obtain independent review before publishing rankings. Prioritize conflicting term boundaries and notices that have been replaced.
