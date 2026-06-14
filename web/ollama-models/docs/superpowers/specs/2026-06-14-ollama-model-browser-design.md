# Ollama Model Browser Design

## Goal

Build a local Web interface for browsing the public Ollama model collection with filters and sorting that Ollama's own library UI does not provide: context window, download size, parameter estimate, modality/capability, and text search across models and tags.

## Data Source

Use actual public Ollama service calls from the server side:

- `https://ollama.com/library` for the complete model catalogue, including model name, summary, capability chips, parameter-size chips, pull count, tag count, and updated timestamps.
- `https://ollama.com/library/<model>/tags` for downloadable tag rows, including tag name, digest prefix, size, context window, input modality, and updated age.
- `https://registry.ollama.ai/v2/library/<model>/manifests/<tag>` is useful for exact manifest information, but does not expose a public tag-list endpoint. It is not the primary discovery path.

The app must not embed a fake model list. The catalogue endpoint fetches and parses Ollama pages, then caches the parsed result in memory for a short period to keep reloads quick and polite.

## Architecture

Use Nuxt with TypeScript. Nuxt gives a Vue interface and Nitro server routes without React.

- `server/utils/ollamaCatalogue.ts`: fetches Ollama pages, parses catalogue and tag HTML, normalises records, and maintains a bounded-concurrency fetch pipeline.
- `server/api/models.get.ts`: returns the cached catalogue payload to the browser.
- `shared/modelMetrics.ts`: parses size, context, pull-count, and parameter strings into sortable numbers.
- `utils/catalogueFilters.ts`: filters, flattens, sorts, and summarises the catalogue for the UI.
- `app.vue`: presents a dense operational browser with controls, metrics, grouped model results, matching tag rows, and copyable pull commands.

## Interface

The first screen is the tool itself, not a landing page. It should feel like a compact operations console: a sticky filter rail, fast summary counters, sortable results, and clear tag rows. Controls include full-text search, max download size, min/max parameter estimate, minimum context, capability chips, input type, and sort direction.

Each result shows the model summary, pulls, tags, updated time, advertised parameter chips, capabilities, and the matching tags. Tag rows show command, size, context window, parameter estimate, digest prefix, modality, update age, and a copy button.

## Error Handling

The API should return explicit failures if Ollama pages cannot be fetched or parsed. The UI should show a retryable error state instead of silently falling back to stale or fake data. Individual tag-page failures are recorded on the affected model so the user can see partial scrape issues.

## Testing

Use Vitest for the logic that matters:

- Metric parsing covers byte sizes, contexts, pull-count suffixes, and parameter estimates.
- HTML parsing is verified against live Ollama pages for at least one known model.
- Filtering and sorting cover the workflows requested by the user.

UI components are not unit-tested because this project treats UI component rendering as an allowed skip. The final verification still includes lint, typecheck, tests, production build, and browser inspection of the local Nuxt app.
