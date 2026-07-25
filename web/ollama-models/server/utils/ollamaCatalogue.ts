import { load } from "cheerio";

import {
  parseByteSizeToBytes,
  parseContextToTokens,
  parseParameterEstimate,
  parsePullCount,
} from "../../shared/modelMetrics";
import type {
  OllamaCataloguePayload,
  OllamaModel,
  OllamaTag,
} from "../../types/ollama";

export const OLLAMA_BASE_URL = "https://ollama.com";
export const OLLAMA_LIBRARY_URL = `${OLLAMA_BASE_URL}/library`;

const CACHE_TTL_MS = 15 * 60 * 1_000;
const DEFAULT_TAG_FETCH_CONCURRENCY = 6;

let cachedCatalogue: {
  expiresAt: number;
  payload: OllamaCataloguePayload;
} | null = null;

export async function fetchOllamaHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "ollama-model-browser/1.0 (+https://ollama.com/library)",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed for ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

export function parseLibraryModels(html: string): OllamaModel[] {
  const document = load(html);
  const models: OllamaModel[] = [];

  document("li[x-test-model]").each((_rowIndex, element) => {
    const row = document(element);
    const href = row.find('a[href^="/library/"]').first().attr("href") ?? "";
    const slug = href.replace(/^\/library\//, "");
    const titleElement = row.find("[x-test-model-title]").first();
    const name = cleanText(
      titleElement.attr("title") ??
        titleElement.find("span").first().text() ??
        slug,
    );

    if (!name || !slug) {
      return;
    }

    const pullCountLabel =
      cleanText(row.find("[x-test-pull-count]").first().text()) || null;
    const tagCountText = cleanText(
      row.find("[x-test-tag-count]").first().text(),
    );
    const updatedElement = row.find("[x-test-updated]").first();
    const updatedAtTitle =
      updatedElement.closest("[title]").attr("title") ?? null;

    models.push({
      capabilities: uniqueTexts(
        row
          .find("[x-test-capability]")
          .map((_chipIndex, chip) => document(chip).text())
          .get(),
      ),
      errors: [],
      href,
      name,
      parameterSizes: uniqueTexts(
        row
          .find("[x-test-size]")
          .map((_chipIndex, chip) => document(chip).text())
          .get(),
      ),
      pullCount: parsePullCount(pullCountLabel),
      pullCountLabel,
      slug,
      summary: cleanText(titleElement.find("p").first().text()),
      tagCount: tagCountText ? Number.parseInt(tagCountText, 10) : null,
      tags: [],
      updatedAt: parseDateTitle(updatedAtTitle),
      updatedLabel: cleanText(updatedElement.text()) || null,
    });
  });

  return dedupeModels(models);
}

export function parseModelTags(modelName: string, html: string): OllamaTag[] {
  const document = load(html);
  const tags: OllamaTag[] = [];

  document("input.command").each((_inputIndex, element) => {
    const commandInput = document(element);
    const tagName = cleanText(commandInput.attr("value") ?? "");

    if (!tagName) {
      return;
    }

    const desktopContainer = commandInput
      .parents()
      .filter((_candidateIndex, candidate) => {
        const className = document(candidate).attr("class") ?? "";
        return className.includes("hidden md:flex");
      })
      .first();
    const grid = desktopContainer.find(".grid").first();
    const metricColumns = grid
      .children("p")
      .map((_columnIndex, column) => cleanText(document(column).text()))
      .get();
    const inputTypes = parseInputTypes(grid.children("div").last().text());
    const metadataText = cleanText(
      desktopContainer.find(".font-mono").parent().text(),
    );
    const metadataParts = metadataText
      .split("·")
      .map((part) => cleanText(part));
    const digest =
      (metadataParts[0] ?? "").match(/[a-f0-9]{12}/i)?.[0]?.toLowerCase() ??
      null;
    const updatedLabel = metadataParts[1] ?? null;
    const sizeLabel = metricColumns[0] || null;
    const contextLabel = metricColumns[1] || null;

    tags.push({
      contextLabel,
      contextTokens: parseContextToTokens(contextLabel),
      digest,
      href:
        grid.find('a[href^="/library/"]').first().attr("href") ??
        `/library/${tagName}`,
      inputTypes,
      name: tagName,
      parameterB: parseParameterEstimate(tagName),
      sizeBytes: parseByteSizeToBytes(sizeLabel),
      sizeLabel,
      tag: tagName.startsWith(`${modelName}:`)
        ? tagName.slice(modelName.length + 1)
        : (tagName.split(":").at(-1) ?? tagName),
      updatedLabel,
    });
  });

  return inferParametersFromDuplicateDigests(dedupeTags(tags));
}

export async function fetchOllamaCatalogue(
  options: { refresh?: boolean } = {},
): Promise<OllamaCataloguePayload> {
  const now = Date.now();

  if (!options.refresh && cachedCatalogue && cachedCatalogue.expiresAt > now) {
    return {
      ...cachedCatalogue.payload,
      cache: {
        hit: true,
        ttlSeconds: Math.max(
          0,
          Math.round((cachedCatalogue.expiresAt - now) / 1_000),
        ),
      },
    };
  }

  const libraryHtml = await fetchOllamaHtml(OLLAMA_LIBRARY_URL);
  const libraryModels = parseLibraryModels(libraryHtml);
  const models = await mapWithConcurrency(
    libraryModels,
    DEFAULT_TAG_FETCH_CONCURRENCY,
    async (model) => {
      try {
        const tagsHtml = await fetchOllamaHtml(
          `${OLLAMA_LIBRARY_URL}/${encodeURIComponent(model.slug)}/tags`,
        );
        const tags = parseModelTags(model.name, tagsHtml);

        return {
          ...model,
          tags,
        };
      } catch (error) {
        return {
          ...model,
          errors: [
            `Failed to fetch tags for ${model.name}: ${error instanceof Error ? error.message : String(error)}`,
          ],
          tags: [],
        };
      }
    },
  );
  const payload: OllamaCataloguePayload = {
    cache: {
      hit: false,
      ttlSeconds: Math.round(CACHE_TTL_MS / 1_000),
    },
    errors: models.flatMap((model) => model.errors),
    generatedAt: new Date(now).toISOString(),
    models,
    sourceUrl: OLLAMA_LIBRARY_URL,
  };

  cachedCatalogue = {
    expiresAt: now + CACHE_TTL_MS,
    payload,
  };

  return payload;
}

function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function uniqueTexts(values: string[]): string[] {
  return [...new Set(values.map((value) => cleanText(value)).filter(Boolean))];
}

function parseDateTitle(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

function parseInputTypes(value: string): string[] {
  const matches = [...value.matchAll(/\b(Text|Vision|Embedding|Audio)\b/gi)]
    .map((match) => match[1])
    .filter((match): match is string => Boolean(match))
    .map((match) => normaliseInputType(match));
  return [...new Set(matches)];
}

function normaliseInputType(value: string): string {
  const lowerValue = value.toLowerCase();
  return lowerValue.charAt(0).toUpperCase() + lowerValue.slice(1);
}

function dedupeModels(models: OllamaModel[]): OllamaModel[] {
  const modelsByName = new Map<string, OllamaModel>();

  for (const model of models) {
    modelsByName.set(model.name, model);
  }

  return [...modelsByName.values()];
}

function dedupeTags(tags: OllamaTag[]): OllamaTag[] {
  const tagsByName = new Map<string, OllamaTag>();

  for (const tag of tags) {
    tagsByName.set(tag.name, tag);
  }

  return [...tagsByName.values()];
}

function inferParametersFromDuplicateDigests(tags: OllamaTag[]): OllamaTag[] {
  const parametersByDigest = new Map<string, number>();

  for (const tag of tags) {
    if (tag.digest && tag.parameterB !== null) {
      const existingParameter = parametersByDigest.get(tag.digest);
      parametersByDigest.set(
        tag.digest,
        Math.max(existingParameter ?? 0, tag.parameterB),
      );
    }
  }

  return tags.map((tag) => {
    if (tag.parameterB !== null || !tag.digest) {
      return tag;
    }

    return {
      ...tag,
      parameterB: parametersByDigest.get(tag.digest) ?? null,
    };
  });
}

async function mapWithConcurrency<Input, Output>(
  items: Input[],
  concurrency: number,
  mapper: (item: Input) => Promise<Output>,
): Promise<Output[]> {
  const results: Output[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const item = items[currentIndex];

      if (item !== undefined) {
        results[currentIndex] = await mapper(item);
      }
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}
