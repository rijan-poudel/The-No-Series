# Working on No. 01 — Money

Use [the README](README.md) for startup, [the agent workflow](docs/agent-development.md) for handoff, and [the operations runbook](docs/operations.md) before changing the public data path. The [master blueprint](docs/nepal_banking_comparison_blueprint.md) describes the intended product. Use the [current design direction](docs/design.md) for the public, catch-first editorial flow. It supersedes the calculator-oriented interface in the original blueprint.

- Use Node 24 and the npm lockfile. Run `npm run verify:agent` for local changes. Run `npm run verify:release` and both browser suites for release work.
- Keep comparison math in `src/domain`, official evidence and releases in `src/data`, the review workflow in `src/editorial`, and localized presentation in `src/ui`. The agent CLI and the website use the same scenario schema and engine.
- Use local fixtures for generated examples. Real rates, terms and fees require date-specific first-party evidence and human approval. Preserve the distinction between missing, verified zero, stale, conflicted and revoked.
- Change English and Nepali together. Verify keyboard operation, focus, reduced motion and narrow widths for UI changes.
- Keep scenarios transient and credentials out of prompts, Git and logs. Public access uses the existing read-only data boundary. Live publishing belongs to the editorial release workflow.
- Record changed behavior, checks actually run, and open rollout dependencies in the relevant docs. Keep demo and unseeded behavior verifiable.
