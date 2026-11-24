# Bank discovery and evidence

The directory uses the Nepal Rastra Bank mid-October 2026 roster for all 20 commercial banks and 17 development banks. The current directory scope covers classes A and B. Licensing entries establish identity. Product facts require product-specific sources and effective dates.

## Data model and workflow

- **Bank** has a stable ID, regulator class, name and searchable aliases. The exact acronym ranks first, then the beginning of a name, then out-of-order token prefixes. Results with equal relevance stay alphabetical. Searches normalize Unicode and work with Nepali aliases.
- **Source seed** is an official bank page whose origin and path are explicitly reviewed. Discovery requests only these pages, with time and byte limits.
- **Source candidate** records bank ID, kind, canonical URL, discovery page and evidence priority. Same-origin links with explicit tariff, rate or terms wording enter the candidate queue. PDFs with matching labels rise to the top. Duplicate URLs collapse. Discovery does not infer the effective date or fetch the candidate URL.
- **Observation** represents a parsed notice with bounded scope, effective date and linked evidence. Conflicting, missing and stale facts stay out.
- **Reviewed offer** joins bank identity and the citations that actually support each comparison field. It stays distinct from the catalog and candidate queue. The bank view exposes available evidence links. A directory entry alone carries no claim about price, eligibility or features.

Run `npm run --silent discover:sources` to scan known official entry points and emit a review queue. The report can be regenerated without a database. Deployments continue to refresh the existing supported notice adapters automatically. New candidate formats and origins need adapter validation before they can supply comparison facts. This is a deliberate boundary for unsupported publishers and documents.
