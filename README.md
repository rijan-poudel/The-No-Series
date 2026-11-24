# No. 01 — Money

The No Series comparison app for Nepali fixed deposits and dollar cards. Readers choose a category, learn what to watch for and request a verified pick for a specific criterion. The public app contains zero approved financial offers. The separate local demonstration has fictional offers, visible sample labels and example evidence.

## Run it

Use Node 24 and npm with the checked-in lockfile.

```sh
npm ci
MONEY_DEMO=1 npm run dev
```

Open `http://localhost:3000` for the bilingual demonstration. Try a 12-month fixed deposit with interest paid at maturity, then open its source. For dollar cards, compare app and branch reload fees separately. The local demonstration is dated 23 November 2026. Open Coverage → Source review walkthrough to step through a fictional notice, approval, publication and suppression. Run `npm run dev` with the demo flag unset to see unseeded public behavior.

```sh
npm run typecheck
npm test
npm run review:demo
npm run review:intake -- evidence/fd-pilot-2026-11-23.json
npm run build
npm run test:production
npx playwright install chromium
npm run test:e2e
MONEY_E2E_PUBLIC=1 npm run test:e2e
```

| Area                                                | Path                                          |
| --------------------------------------------------- | --------------------------------------------- |
| Pages and localized navigation                      | `app/[locale]/money`                          |
| Comparison API                                      | `app/api/v1/compare/[product]/route.ts`       |
| Typed calculation engine and scenarios              | `src/domain`                                  |
| Fixture releases and public repository              | `src/data`                                    |
| Editorial simulation                                | `npm run review:demo`                         |
| PostgreSQL rollout and checks                       | `db/001_evidence.sql`, `db/test_evidence.sql` |
| Requirements, editorial operations and verification | `docs/`                                       |

The app uses a POST body for comparison scenarios and keeps draft inputs and pins in the current browser visit. It needs no Supabase project for local development or the unseeded public build. See [the rollout runbook](docs/operations.md) before connecting an approved dataset.

## Work with a coding agent

Open this folder in Codex. The [project instructions](AGENTS.md) and [agent setup guide](docs/agent-development.md) cover the local demo, JSON comparison tool, and verification commands. The [blueprint](docs/nepal_banking_comparison_blueprint.md) and [master build prompt](no01_money_coding_agent_prompt.md) are saved in the project.

The [current design direction](docs/design.md) defines the editorial journey and ranking scope.
