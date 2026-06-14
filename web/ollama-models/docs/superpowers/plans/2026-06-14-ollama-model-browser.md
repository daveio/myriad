# Ollama Model Browser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Nuxt Web interface that fetches the live Ollama model collection and lets users search, sort, and filter by tag-level metadata.

**Architecture:** Nuxt serves the browser UI and exposes one server endpoint, `/api/models`, backed by a server-side scraper/cache. Shared TypeScript utilities normalise metrics and filter flattened model/tag rows so the core behaviours are testable outside Vue.

**Tech Stack:** Nuxt, Vue, TypeScript, Cheerio, Vitest, ESLint, lucide-vue-next.

---

## File Structure

- Create `package.json`, `nuxt.config.ts`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs`, and `.gitignore` for the project toolchain.
- Create `types/ollama.ts` for catalogue, tag, filter, sort, and API payload types.
- Create `shared/modelMetrics.ts` for parsing pull counts, byte sizes, contexts, and parameter estimates.
- Create `server/utils/ollamaCatalogue.ts` for live Ollama fetching, HTML parsing, enrichment, error reporting, and cache management.
- Create `server/api/models.get.ts` for the catalogue API route.
- Create `utils/catalogueFilters.ts` for flattening, filtering, sorting, and summary metrics.
- Create `app.vue` for the Web interface.
- Create `tests/modelMetrics.test.ts`, `tests/ollamaCatalogue.test.ts`, and `tests/catalogueFilters.test.ts`.
- Create `README.md` for human setup, usage, and data-source notes.

## Tasks

### Task 1: Toolchain and Tests

- [ ] Add Nuxt/Vitest/ESLint package configuration.
- [ ] Install dependencies with `bun install`.
- [ ] Write `tests/modelMetrics.test.ts` before `shared/modelMetrics.ts`.
- [ ] Run `bun test tests/modelMetrics.test.ts` and confirm it fails because the metric parser module is missing.
- [ ] Write `tests/ollamaCatalogue.test.ts` before `server/utils/ollamaCatalogue.ts`.
- [ ] Run `bun test tests/ollamaCatalogue.test.ts` and confirm it fails because the scraper module is missing.
- [ ] Write `tests/catalogueFilters.test.ts` before `utils/catalogueFilters.ts`.
- [ ] Run `bun test tests/catalogueFilters.test.ts` and confirm it fails because the filter module is missing.

### Task 2: Core Data Logic

- [ ] Implement `types/ollama.ts`.
- [ ] Implement `shared/modelMetrics.ts`.
- [ ] Run `bun test tests/modelMetrics.test.ts` and confirm it passes.
- [ ] Implement `server/utils/ollamaCatalogue.ts` with real `fetch` calls, Cheerio parsing, bounded concurrency, in-memory cache, and explicit per-model scrape errors.
- [ ] Run `bun test tests/ollamaCatalogue.test.ts` and confirm it passes against live Ollama pages.
- [ ] Implement `utils/catalogueFilters.ts`.
- [ ] Run `bun test tests/catalogueFilters.test.ts` and confirm it passes.
- [ ] Commit the tested data layer.

### Task 3: Nuxt API and Interface

- [ ] Implement `server/api/models.get.ts` to return cached live data.
- [ ] Implement `app.vue` with search, numeric filters, capability toggles, modality selection, sort controls, result summaries, grouped model sections, tag rows, copy commands, loading, error, and partial-error states.
- [ ] Add `README.md` with install, dev, test, build, data source, and limitation notes.
- [ ] Run `bun run lint`, `bun run typecheck`, `bun test`, and `bun run build`.
- [ ] Start the Nuxt dev server and inspect the app in the browser.
- [ ] Commit the complete Web interface.

### Task 4: Project Memory

- [ ] Write Serena memories `mem:core`, `mem:tech_stack`, `mem:suggested_commands`, `mem:conventions`, and `mem:task_completion`.
- [ ] Mention that `serena memories check` can be run from the project root.
