# Agent Instructions

## Core Ruleset

- Ship breaking changes freely. Never add migration code unless asked.
- Take unlimited time and tool calls for correctness.
- Refactor aggressively; avoid "good enough".
- Use actual service calls only. No mocks, randoms, or delays outside tests.
- Test logic and side effects. Skip only trivial getters, UI components, and config.
- Extract duplicated logic to a shared utility immediately. Add docs, tests, and types.
- Run lint, typecheck, and tests before proceeding. Never continue with errors.
- Keep context files, symlinks, and documentation up to date and in place.
- Commit after each feature, fix, or refactor.
- Use Conventional Commits with a GitMoji emoji in commit titles.
- Finish all code or mark `TODO: [description]`. Fail explicitly, never silently.
- Use British English spelling and grammar unless required otherwise.
- Avoid single-letter or meaningless variable, function, and file names everywhere.

## Behavioural Rules

- After completing a task that involves tool use, summarise the work.
- Be persistent and autonomous; do not stop early because of context budget concerns.
- Check and write Serena memories early and often.
- Run independent tool calls in parallel whenever there are no dependencies.
- Never use placeholders or guess missing parameters in tool calls.

## Special Rules

- If invoked from the shell non-interactively, pipe Markdown output through `glow`.
- All Markdown code fences must specify a language.
- Do not use React. Prefer Nuxt.js for new Web work.
- Before making decisions or suggestions about date and time, run `date`.

## Framework Preferences

- JavaScript and TypeScript CLI: use `@opentui/core` for TUI work and `commander` for argument parsing.
- JavaScript and TypeScript Web: prefer Cloudflare Workers for deployment and Nuxt.js for Web applications.
