# Ollama Model Browser

A local Nuxt Web interface for browsing the live public Ollama model catalogue with filters Ollama's own library page does not expose: context window, download size, parameter estimate, capabilities, input modality, and tag-level search.

## Data Sources

The app uses actual Ollama service calls from the Nuxt server:

- `https://ollama.com/library`
- `https://ollama.com/library/<model>/tags`

The first full load fetches the catalogue page and each model's tag page with bounded concurrency. Results are cached in memory for 15 minutes per server process. The interface never uses a fake model list.

## Commands

```bash
bun install
bun run dev
```

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

`bun run build` uses `scripts/build.mjs`, which prefers the bundled Codex Node runtime on this machine because the active mise Node 24.16.0 currently fails Vite's spawned build service with `write EBADF`. Set `NUXT_BUILD_NODE=/path/to/node` to use another Node binary.

## Notes

- Filtering is tag-level: a model appears when at least one of its tags matches the active filters.
- Parameter counts are estimates parsed from Ollama size chips and tag names. Mixture-of-experts tags use the largest visible total-parameter value, so `235b-a22b` filters as `235B`.
- If an Ollama page changes its HTML structure, the API fails explicitly or records a per-model scrape error instead of returning invented data.
