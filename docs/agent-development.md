# Coding-agent setup and handoff

Open this folder as your project in Codex. The root `AGENTS.md` guides coding agents. The repo also includes a task-specific skill under `.agents/skills/money-development`. Use the [build prompt](../no01_money_coding_agent_prompt.md) and [blueprint](nepal_banking_comparison_blueprint.md) for larger milestones.

## Local workflow

1. Install Node 24 and run `npm ci`. Use `npm run dev:demo` for fictional offers or `npm run dev` for unseeded public behavior. No AI account, API key or database is needed for these workflows.
2. Call the read-only comparison tool with JSON on stdin. Use `--demo` for fixed-date fictional output or `--empty` for an unseeded response. Both use the site's schema and engine and run without network access. The output is JSON suitable for agent use. Validation failures write to stderr and exit nonzero.
3. Run `npm run verify:agent` for formatting, types, engine tests and a fictional editorial walkthrough. Run `npm run verify:release` for those checks plus a public build and its fixture-isolation tests. Browser checks and database rehearsal are listed in the README and CI.

```sh
printf '%s\n' '{"product":"fixed-deposits","amount":"१,००,०००","currency":"NPR","months":12,"payout":"any","customer":"individual"}' |
  npm run --silent agent:compare -- --demo
```

The CLI reports a fixture's own status and evidence. Use it to reproduce behavior in a ticket or review and describe amounts as fictional. It is a local developer integration. The website itself uses deterministic comparisons through its existing POST route.

## When resuming work

Use [implementation decisions](implementation.md) to check supported rules and gaps, [operations](operations.md) for evidence intake and publication, and [verification](verification.md) for recorded results. State your starting scenario in the work record and link code, fixtures, or evidence from the handoff. Document observed results and remaining gates. Keep credentialed data activation, native Nepali review and independent source review in the release track.
