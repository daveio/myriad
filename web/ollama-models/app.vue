<script setup lang="ts">
import {
  Check,
  Copy,
  Database,
  Download,
  Filter,
  HardDrive,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Tags,
  Timer,
} from "lucide-vue-next";

import {
  formatBytes,
  formatContext,
  formatParameterBillions,
} from "~/shared/modelMetrics";
import type {
  CatalogueFilters,
  CatalogueSort,
  CatalogueTagRow,
  OllamaCataloguePayload,
  OllamaModel,
} from "~/types/ollama";
import {
  collectCapabilities,
  collectInputTypes,
  filterCatalogueRows,
  flattenCatalogue,
  sortCatalogueRows,
  summariseRows,
} from "~/utils/catalogueFilters";

interface VisibleGroup {
  model: OllamaModel;
  rows: CatalogueTagRow[];
}

const externalBaseUrl = "https://ollama.com";
const visibleIncrement = 250;
const refreshCounter = ref(0);
const visibleLimit = ref(visibleIncrement);
const copiedCommand = ref<string | null>(null);
const sortState = reactive<CatalogueSort>({
  direction: "desc",
  key: "pulls",
});
const filterInputs = reactive({
  capabilities: [] as string[],
  inputTypes: [] as string[],
  maxParametersB: "",
  maxSizeGb: "",
  minContextK: "",
  minParametersB: "",
  query: "",
});

const {
  data: catalogue,
  error,
  refresh,
  status,
} = await useAsyncData<OllamaCataloguePayload>(
  "ollama-catalogue",
  () =>
    $fetch("/api/models", {
      query: refreshCounter.value > 0 ? { refresh: "1" } : undefined,
    }),
  {
    default: () => ({
      cache: {
        hit: false,
        ttlSeconds: 0,
      },
      errors: [],
      generatedAt: "",
      models: [],
      sourceUrl: "",
    }),
  },
);

const isLoading = computed(() => status.value === "pending");
const models = computed(() => catalogue.value?.models ?? []);
const allRows = computed(() => flattenCatalogue(models.value));
const allCapabilities = computed(() => collectCapabilities(models.value));
const allInputTypes = computed(() => collectInputTypes(allRows.value));
const activeFilters = computed<CatalogueFilters>(() => {
  const minContextK = parseOptionalNumber(filterInputs.minContextK);

  return {
    capabilities: filterInputs.capabilities,
    inputTypes: filterInputs.inputTypes,
    maxParametersB: parseOptionalNumber(filterInputs.maxParametersB),
    maxSizeGb: parseOptionalNumber(filterInputs.maxSizeGb),
    minContextTokens: minContextK === null ? null : minContextK * 1_000,
    minParametersB: parseOptionalNumber(filterInputs.minParametersB),
    query: filterInputs.query,
  };
});
const visibleRows = computed(() =>
  sortCatalogueRows(
    filterCatalogueRows(allRows.value, activeFilters.value),
    sortState,
  ),
);
const displayedRows = computed(() =>
  visibleRows.value.slice(0, visibleLimit.value),
);
const visibleSummary = computed(() => summariseRows(visibleRows.value));
const totalSummary = computed(() => summariseRows(allRows.value));
const scrapeErrors = computed(() => catalogue.value?.errors ?? []);
const hasMoreRows = computed(
  () => visibleRows.value.length > displayedRows.value.length,
);
const activeFilterCount = computed(() => {
  const numericFilterCount = [
    filterInputs.maxParametersB,
    filterInputs.maxSizeGb,
    filterInputs.minContextK,
    filterInputs.minParametersB,
  ].filter((value) => value.trim()).length;

  return (
    numericFilterCount +
    filterInputs.capabilities.length +
    filterInputs.inputTypes.length +
    (filterInputs.query.trim() ? 1 : 0)
  );
});
const visibleGroups = computed<VisibleGroup[]>(() => {
  const modelsByName = new Map(
    models.value.map((model) => [model.name, model]),
  );
  const groupsByModel = new Map<string, VisibleGroup>();

  for (const row of displayedRows.value) {
    const model = modelsByName.get(row.modelName);

    if (!model) {
      continue;
    }

    const existingGroup = groupsByModel.get(row.modelName);

    if (existingGroup) {
      existingGroup.rows.push(row);
    } else {
      groupsByModel.set(row.modelName, {
        model,
        rows: [row],
      });
    }
  }

  return [...groupsByModel.values()];
});
const generatedAtLabel = computed(() => {
  if (!catalogue.value?.generatedAt) {
    return "Not loaded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(catalogue.value.generatedAt));
});

watch(
  () => [
    filterInputs.query,
    filterInputs.maxSizeGb,
    filterInputs.minContextK,
    filterInputs.minParametersB,
    filterInputs.maxParametersB,
    filterInputs.capabilities.join("|"),
    filterInputs.inputTypes.join("|"),
    sortState.key,
    sortState.direction,
  ],
  () => {
    visibleLimit.value = visibleIncrement;
  },
);

async function refreshLiveData(): Promise<void> {
  refreshCounter.value += 1;
  await refresh();
}

function resetFilters(): void {
  filterInputs.capabilities = [];
  filterInputs.inputTypes = [];
  filterInputs.maxParametersB = "";
  filterInputs.maxSizeGb = "";
  filterInputs.minContextK = "";
  filterInputs.minParametersB = "";
  filterInputs.query = "";
}

function toggleSelection(values: string[], value: string): void {
  const existingIndex = values.indexOf(value);

  if (existingIndex >= 0) {
    values.splice(existingIndex, 1);
  } else {
    values.push(value);
  }
}

async function copyPullCommand(tagName: string): Promise<void> {
  const command = `ollama pull ${tagName}`;
  await navigator.clipboard.writeText(command);
  copiedCommand.value = tagName;
}

function parseOptionalNumber(value: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div class="brand-block">
        <div class="brand-mark" aria-hidden="true">
          <Database :size="22" />
        </div>
        <div>
          <p class="eyebrow">Live Ollama catalogue</p>
          <h1>Model Browser</h1>
        </div>
      </div>

      <div class="topbar-actions">
        <div class="source-chip">
          <span>{{ catalogue?.cache.hit ? "Cache" : "Live" }}</span>
          <strong>{{ generatedAtLabel }}</strong>
        </div>
        <button
          class="icon-button wide"
          type="button"
          :disabled="isLoading"
          @click="refreshLiveData"
        >
          <RefreshCcw :size="16" :class="{ spinning: isLoading }" />
          <span>Refresh</span>
        </button>
      </div>
    </header>

    <section class="metric-strip" aria-label="Catalogue summary">
      <div class="metric">
        <Tags :size="18" />
        <span>Tags</span>
        <strong>{{ visibleSummary.tagCount.toLocaleString() }}</strong>
        <small>/ {{ totalSummary.tagCount.toLocaleString() }}</small>
      </div>
      <div class="metric">
        <Database :size="18" />
        <span>Models</span>
        <strong>{{ visibleSummary.modelCount.toLocaleString() }}</strong>
        <small>/ {{ totalSummary.modelCount.toLocaleString() }}</small>
      </div>
      <div class="metric">
        <Timer :size="18" />
        <span>Max Context</span>
        <strong>{{ formatContext(visibleSummary.maxContextTokens) }}</strong>
      </div>
      <div class="metric">
        <HardDrive :size="18" />
        <span>Smallest</span>
        <strong>{{ formatBytes(visibleSummary.minSizeBytes) }}</strong>
      </div>
      <div class="metric">
        <Download :size="18" />
        <span>Pulls</span>
        <strong>{{ visibleSummary.totalPullCount.toLocaleString() }}</strong>
      </div>
    </section>

    <div class="workspace">
      <aside class="filter-panel" aria-label="Filters">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Query</p>
            <h2>Filters</h2>
          </div>
          <span class="filter-count">{{ activeFilterCount }}</span>
        </div>

        <label class="search-box">
          <Search :size="17" />
          <input
            v-model="filterInputs.query"
            type="search"
            placeholder="qwen coder vision 128k"
            autocomplete="off"
          />
        </label>

        <div class="filter-grid">
          <label>
            <span>Max GB</span>
            <input
              v-model="filterInputs.maxSizeGb"
              inputmode="decimal"
              type="text"
            />
          </label>
          <label>
            <span>Min ctx K</span>
            <input
              v-model="filterInputs.minContextK"
              inputmode="numeric"
              type="text"
            />
          </label>
          <label>
            <span>Min B</span>
            <input
              v-model="filterInputs.minParametersB"
              inputmode="decimal"
              type="text"
            />
          </label>
          <label>
            <span>Max B</span>
            <input
              v-model="filterInputs.maxParametersB"
              inputmode="decimal"
              type="text"
            />
          </label>
        </div>

        <div class="filter-section">
          <div class="section-title">
            <SlidersHorizontal :size="15" />
            <span>Sort</span>
          </div>
          <div class="sort-row">
            <select v-model="sortState.key">
              <option value="pulls">Pulls</option>
              <option value="context">Context</option>
              <option value="size">Size</option>
              <option value="parameters">Parameters</option>
              <option value="updated">Updated</option>
              <option value="name">Name</option>
            </select>
            <button
              class="segmented-button"
              type="button"
              @click="
                sortState.direction =
                  sortState.direction === 'asc' ? 'desc' : 'asc'
              "
            >
              {{ sortState.direction.toUpperCase() }}
            </button>
          </div>
        </div>

        <div class="filter-section">
          <div class="section-title">
            <Filter :size="15" />
            <span>Capabilities</span>
          </div>
          <div class="chip-grid">
            <button
              v-for="capability in allCapabilities"
              :key="capability"
              class="toggle-chip"
              :class="{
                active: filterInputs.capabilities.includes(capability),
              }"
              type="button"
              @click="toggleSelection(filterInputs.capabilities, capability)"
            >
              {{ capability }}
            </button>
          </div>
        </div>

        <div class="filter-section">
          <div class="section-title">
            <Filter :size="15" />
            <span>Input</span>
          </div>
          <div class="chip-grid">
            <button
              v-for="inputType in allInputTypes"
              :key="inputType"
              class="toggle-chip"
              :class="{ active: filterInputs.inputTypes.includes(inputType) }"
              type="button"
              @click="toggleSelection(filterInputs.inputTypes, inputType)"
            >
              {{ inputType }}
            </button>
          </div>
        </div>

        <button class="reset-button" type="button" @click="resetFilters">
          Reset
        </button>
      </aside>

      <section class="results-panel" aria-live="polite">
        <div v-if="isLoading && allRows.length === 0" class="state-box">
          <RefreshCcw :size="22" class="spinning" />
          <strong>Fetching Ollama catalogue</strong>
          <span>Reading live model and tag pages.</span>
        </div>

        <div v-else-if="error" class="state-box error">
          <strong>Catalogue fetch failed</strong>
          <span>{{ error.message }}</span>
          <button
            class="reset-button compact"
            type="button"
            @click="refreshLiveData"
          >
            Retry
          </button>
        </div>

        <template v-else>
          <div v-if="scrapeErrors.length > 0" class="scrape-warning">
            <strong
              >{{ scrapeErrors.length }} tag page{{
                scrapeErrors.length === 1 ? "" : "s"
              }}
              failed</strong
            >
            <span>{{ scrapeErrors[0] }}</span>
          </div>

          <div class="result-heading">
            <div>
              <p class="eyebrow">Results</p>
              <h2>{{ visibleRows.length.toLocaleString() }} matching tags</h2>
            </div>
            <span
              >{{ visibleGroups.length.toLocaleString() }} model groups
              visible</span
            >
          </div>

          <div v-if="visibleRows.length === 0" class="state-box">
            <Search :size="22" />
            <strong>No matching tags</strong>
            <span>Broaden the active filters.</span>
          </div>

          <article
            v-for="group in visibleGroups"
            :key="group.model.name"
            class="model-card"
          >
            <div class="model-heading">
              <div class="model-title-block">
                <a
                  class="model-title"
                  :href="`${externalBaseUrl}${group.model.href}`"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ group.model.name }}
                </a>
                <p>{{ group.model.summary }}</p>
              </div>
              <div class="model-stats">
                <span>{{ group.model.pullCountLabel ?? "Unknown" }} pulls</span>
                <span
                  >{{ group.model.tagCount ?? group.rows.length }} tags</span
                >
                <span>{{ group.model.updatedLabel ?? "Unknown update" }}</span>
              </div>
            </div>

            <div class="model-chips">
              <span
                v-for="capability in group.model.capabilities"
                :key="`${group.model.name}-${capability}`"
                class="capability-chip"
              >
                {{ capability }}
              </span>
              <span
                v-for="parameterSize in group.model.parameterSizes"
                :key="`${group.model.name}-${parameterSize}`"
                class="parameter-chip"
              >
                {{ parameterSize }}
              </span>
            </div>

            <div class="tag-table">
              <div class="tag-row tag-row-head">
                <span>Tag</span>
                <span>Size</span>
                <span>Context</span>
                <span>Params</span>
                <span>Input</span>
                <span>Digest</span>
                <span aria-label="Copy command" />
              </div>

              <div v-for="row in group.rows" :key="row.name" class="tag-row">
                <a
                  class="tag-name"
                  :href="`${externalBaseUrl}${row.href}`"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ row.name }}
                </a>
                <span>{{ formatBytes(row.sizeBytes) }}</span>
                <span>{{ formatContext(row.contextTokens) }}</span>
                <span>{{ formatParameterBillions(row.parameterB) }}</span>
                <span>{{ row.inputTypes.join(", ") || "Unknown" }}</span>
                <span class="digest">{{ row.digest ?? "Unknown" }}</span>
                <button
                  class="copy-button"
                  type="button"
                  :title="`Copy ollama pull ${row.name}`"
                  @click="copyPullCommand(row.name)"
                >
                  <Check v-if="copiedCommand === row.name" :size="15" />
                  <Copy v-else :size="15" />
                </button>
              </div>
            </div>
          </article>

          <button
            v-if="hasMoreRows"
            class="load-more"
            type="button"
            @click="visibleLimit += visibleIncrement"
          >
            Show
            {{
              Math.min(
                visibleIncrement,
                visibleRows.length - displayedRows.length,
              ).toLocaleString()
            }}
            more tags
          </button>
        </template>
      </section>
    </div>
  </main>
</template>

<style>
:root {
  color-scheme: light;
  --accent: #0f766e;
  --accent-strong: #0b4f49;
  --amber: #b7791f;
  --border: #d8dee2;
  --danger: #b42318;
  --ink: #171b1f;
  --muted: #66717b;
  --paper: #f5f7f8;
  --panel: #ffffff;
  --row: #fbfcfc;
  --steel: #29435c;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    linear-gradient(90deg, rgba(23, 27, 31, 0.035) 1px, transparent 1px),
    linear-gradient(0deg, rgba(23, 27, 31, 0.03) 1px, transparent 1px),
    var(--paper);
  background-size: 32px 32px;
  color: var(--ink);
  font-family: "Avenir Next", "Segoe UI", sans-serif;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.app-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100vh;
  padding: 16px;
}

.topbar,
.metric-strip,
.workspace {
  margin: 0 auto;
  width: min(1540px, 100%);
}

.topbar {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  min-height: 72px;
  padding: 12px 14px;
  position: sticky;
  top: 12px;
  z-index: 10;
}

.brand-block,
.topbar-actions,
.metric,
.section-title,
.sort-row,
.model-stats,
.model-chips {
  align-items: center;
  display: flex;
}

.brand-block {
  gap: 12px;
  min-width: 0;
}

.brand-mark {
  align-items: center;
  background: var(--ink);
  border-radius: 8px;
  color: white;
  display: grid;
  flex: 0 0 44px;
  height: 44px;
  place-items: center;
}

.eyebrow {
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
  margin: 0 0 3px;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(1.45rem, 2vw, 2rem);
  line-height: 1.05;
}

h2 {
  font-size: 1rem;
  line-height: 1.25;
}

.topbar-actions {
  gap: 10px;
}

.source-chip {
  align-items: flex-end;
  border-right: 1px solid var(--border);
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 12px;
  text-align: right;
}

.source-chip span {
  font-size: 0.72rem;
  text-transform: uppercase;
}

.source-chip strong {
  color: var(--ink);
  font-size: 0.82rem;
}

.icon-button,
.copy-button,
.segmented-button,
.toggle-chip,
.reset-button,
.load-more {
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  display: inline-flex;
  justify-content: center;
}

.icon-button {
  background: var(--ink);
  color: white;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
}

.metric-strip {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.metric {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  gap: 8px;
  min-height: 62px;
  min-width: 0;
  padding: 12px;
}

.metric svg {
  color: var(--steel);
  flex: 0 0 auto;
}

.metric span,
.metric small {
  color: var(--muted);
  font-size: 0.78rem;
}

.metric strong {
  font-size: clamp(1rem, 1.7vw, 1.35rem);
  margin-left: auto;
  white-space: nowrap;
}

.workspace {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(280px, 330px) minmax(0, 1fr);
}

.filter-panel,
.results-panel {
  min-width: 0;
}

.filter-panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 14px;
  position: sticky;
  top: 100px;
}

.panel-heading,
.result-heading,
.model-heading {
  align-items: flex-start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.filter-count {
  align-items: center;
  background: var(--accent);
  border-radius: 999px;
  color: white;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 800;
  height: 28px;
  justify-content: center;
  min-width: 28px;
}

.search-box {
  align-items: center;
  background: var(--row);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  gap: 8px;
  min-height: 42px;
  padding: 0 10px;
}

.search-box svg {
  color: var(--muted);
  flex: 0 0 auto;
}

.search-box input,
.filter-grid input,
.sort-row select {
  background: transparent;
  border: 0;
  color: var(--ink);
  min-width: 0;
  outline: 0;
  width: 100%;
}

.filter-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.filter-grid label {
  background: var(--row);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
}

.filter-grid span,
.section-title {
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.filter-grid input {
  font-size: 1rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  gap: 6px;
}

.sort-row {
  gap: 8px;
}

.sort-row select {
  background: var(--row);
  border: 1px solid var(--border);
  border-radius: 8px;
  height: 38px;
  padding: 0 8px;
}

.segmented-button {
  background: var(--steel);
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
  height: 38px;
  min-width: 68px;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.toggle-chip {
  background: white;
  color: var(--ink);
  font-size: 0.8rem;
  min-height: 30px;
  padding: 0 9px;
}

.toggle-chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.reset-button,
.load-more {
  background: white;
  color: var(--ink);
  font-weight: 800;
  min-height: 38px;
  padding: 0 12px;
}

.reset-button.compact {
  margin-top: 8px;
}

.results-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-heading {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
}

.result-heading span {
  color: var(--muted);
  font-size: 0.85rem;
}

.state-box,
.scrape-warning {
  align-items: center;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 180px;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.state-box strong,
.scrape-warning strong {
  color: var(--ink);
}

.state-box.error {
  border-color: rgba(180, 35, 24, 0.35);
  color: var(--danger);
}

.scrape-warning {
  align-items: flex-start;
  border-color: rgba(183, 121, 31, 0.45);
  color: var(--amber);
  min-height: 0;
  text-align: left;
}

.model-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.model-title-block {
  min-width: 0;
}

.model-title {
  color: var(--ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.35rem;
  font-weight: 800;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

.model-title-block p {
  color: var(--muted);
  line-height: 1.45;
  margin-top: 4px;
  max-width: 74ch;
}

.model-stats {
  color: var(--muted);
  flex-wrap: wrap;
  font-size: 0.78rem;
  gap: 8px;
  justify-content: flex-end;
  text-align: right;
}

.model-stats span {
  background: var(--row);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 8px;
  white-space: nowrap;
}

.model-chips {
  flex-wrap: wrap;
  gap: 6px;
}

.capability-chip,
.parameter-chip {
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 8px;
}

.capability-chip {
  background: rgba(15, 118, 110, 0.1);
  color: var(--accent-strong);
}

.parameter-chip {
  background: rgba(41, 67, 92, 0.1);
  color: var(--steel);
}

.tag-table {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.tag-row {
  align-items: center;
  background: var(--row);
  border-top: 1px solid var(--border);
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(220px, 2fr) minmax(72px, 0.7fr) minmax(
      78px,
      0.7fr
    ) minmax(74px, 0.7fr) minmax(90px, 0.8fr) minmax(112px, 0.9fr) 36px;
  min-height: 44px;
  padding: 7px 9px;
}

.tag-row:first-child {
  border-top: 0;
}

.tag-row-head {
  background: #eef2f4;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  min-height: 34px;
  text-transform: uppercase;
}

.tag-name {
  color: var(--ink);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.88rem;
  font-weight: 800;
  min-width: 0;
  overflow-wrap: anywhere;
}

.tag-row span {
  color: var(--muted);
  font-size: 0.84rem;
  min-width: 0;
  overflow-wrap: anywhere;
}

.digest {
  font-family: "SFMono-Regular", Consolas, monospace;
}

.copy-button {
  background: white;
  color: var(--steel);
  height: 30px;
  width: 30px;
}

.load-more {
  align-self: center;
  margin: 8px 0 24px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1050px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .filter-panel {
    position: static;
  }
}

@media (max-width: 760px) {
  .app-shell {
    padding: 10px;
  }

  .topbar {
    align-items: stretch;
    flex-direction: column;
    position: static;
  }

  .topbar-actions {
    justify-content: space-between;
  }

  .source-chip {
    align-items: flex-start;
    border-right: 0;
    padding-right: 0;
    text-align: left;
  }

  .metric-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric:last-child {
    grid-column: 1 / -1;
  }

  .model-heading {
    flex-direction: column;
  }

  .model-stats {
    justify-content: flex-start;
    text-align: left;
  }

  .tag-table {
    border: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tag-row-head {
    display: none;
  }

  .tag-row {
    border: 1px solid var(--border);
    border-radius: 8px;
    grid-template-columns: 1fr 36px;
  }

  .tag-row span {
    display: inline-flex;
  }

  .tag-name {
    grid-column: 1;
  }

  .copy-button {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
