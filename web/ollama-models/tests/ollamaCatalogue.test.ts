import { describe, expect, test } from "vitest";

import {
  OLLAMA_LIBRARY_URL,
  fetchOllamaHtml,
  parseLibraryModels,
  parseModelTags,
} from "../server/utils/ollamaCatalogue";

describe("Ollama catalogue scraping", () => {
  test("parses model summaries from the live Ollama library page", async () => {
    const html = await fetchOllamaHtml(`${OLLAMA_LIBRARY_URL}?q=qwen3`);
    const models = parseLibraryModels(html);
    const qwen3 = models.find((model) => model.name === "qwen3");

    expect(qwen3).toBeDefined();
    expect(qwen3?.summary).toContain("Qwen3");
    expect(qwen3?.capabilities).toEqual(
      expect.arrayContaining(["tools", "thinking"]),
    );
    expect(qwen3?.parameterSizes).toEqual(
      expect.arrayContaining(["0.6b", "235b"]),
    );
    expect(qwen3?.pullCount).toBeGreaterThan(1_000_000);
    expect(qwen3?.tagCount).toBeGreaterThan(10);
  });

  test("parses tag sizes and context windows from a live model tag page", async () => {
    const html = await fetchOllamaHtml(`${OLLAMA_LIBRARY_URL}/qwen3/tags`);
    const tags = parseModelTags("qwen3", html);
    const fourB = tags.find((tag) => tag.name === "qwen3:4b");

    expect(tags.length).toBeGreaterThan(10);
    expect(fourB).toBeDefined();
    expect(fourB?.sizeBytes).toBeGreaterThan(2_000_000_000);
    expect(fourB?.contextTokens).toBeGreaterThanOrEqual(256_000);
    expect(fourB?.inputTypes).toContain("Text");
    expect(fourB?.digest).toMatch(/^[a-f0-9]{12}$/);
  });
});
