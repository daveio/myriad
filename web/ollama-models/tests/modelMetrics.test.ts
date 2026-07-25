import { describe, expect, test } from "vitest";

import {
  parseByteSizeToBytes,
  parseContextToTokens,
  parseParameterEstimate,
  parsePullCount,
} from "../shared/modelMetrics";

describe("model metric parsing", () => {
  test("parses Ollama download sizes as decimal bytes", () => {
    expect(parseByteSizeToBytes("523MB")).toBe(523_000_000);
    expect(parseByteSizeToBytes("5.2GB")).toBe(5_200_000_000);
    expect(parseByteSizeToBytes("1.25TB")).toBe(1_250_000_000_000);
    expect(parseByteSizeToBytes("unknown")).toBeNull();
  });

  test("parses context windows into token counts", () => {
    expect(parseContextToTokens("40K")).toBe(40_000);
    expect(parseContextToTokens("256K context window")).toBe(256_000);
    expect(parseContextToTokens("1M-token context window")).toBe(1_000_000);
    expect(parseContextToTokens("context unavailable")).toBeNull();
  });

  test("parses abbreviated pull counts", () => {
    expect(parsePullCount("30.7M")).toBe(30_700_000);
    expect(parsePullCount("865.7K")).toBe(865_700);
    expect(parsePullCount("42")).toBe(42);
    expect(parsePullCount("many")).toBeNull();
  });

  test("parses parameter estimates from chips and tag names", () => {
    expect(parseParameterEstimate("335m")).toBe(0.335);
    expect(parseParameterEstimate("8x7b")).toBe(56);
    expect(parseParameterEstimate("qwen3:235b-a22b-instruct")).toBe(235);
    expect(parseParameterEstimate("qwen3:latest")).toBeNull();
  });
});
