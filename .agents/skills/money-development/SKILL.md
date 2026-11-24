---
name: money-development
description: Develop and verify the No. 01 Money site, comparison engine, bilingual journeys, and evidence workflows.
---

1. Read the repo's AGENTS.md and docs/agent-development.md. Confirm current product behavior and the change boundary.
2. Exercise a baseline through the app or `npm run --silent agent:compare -- --demo` with a scenario on stdin. For calculation changes, work through independent expected cash flows and assert the relevant verification status.
3. Make the smallest complete implementation. For UI changes check both locales, responsive layout and keyboard paths. For evidence changes trace values, dates and review state through publication and suppression.
4. Run the appropriate local and production checks listed in the workflow. Save relevant decisions and test evidence. Distinguish fixture checks from live validation.
