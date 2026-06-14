import { describe, expect, test } from 'vitest'

import type { OllamaModel } from '../types/ollama'
import {
  filterCatalogueRows,
  flattenCatalogue,
  sortCatalogueRows,
  summariseRows,
} from '../utils/catalogueFilters'

const catalogue: OllamaModel[] = [
  {
    capabilities: ['tools'],
    errors: [],
    href: '/library/llama3.1',
    name: 'llama3.1',
    parameterSizes: ['8b', '70b'],
    pullCount: 115_900_000,
    pullCountLabel: '115.9M',
    slug: 'llama3.1',
    summary: 'General purpose model with long context variants.',
    tagCount: 2,
    tags: [
      {
        contextLabel: '128K',
        contextTokens: 128_000,
        digest: 'aaaaaaaaaaaa',
        href: '/library/llama3.1:8b',
        inputTypes: ['Text'],
        name: 'llama3.1:8b',
        parameterB: 8,
        sizeBytes: 4_900_000_000,
        sizeLabel: '4.9GB',
        tag: '8b',
        updatedLabel: '1 year ago',
      },
      {
        contextLabel: '128K',
        contextTokens: 128_000,
        digest: 'bbbbbbbbbbbb',
        href: '/library/llama3.1:70b',
        inputTypes: ['Text'],
        name: 'llama3.1:70b',
        parameterB: 70,
        sizeBytes: 42_000_000_000,
        sizeLabel: '42GB',
        tag: '70b',
        updatedLabel: '1 year ago',
      },
    ],
    updatedAt: '2024-11-30T22:34:00.000Z',
    updatedLabel: '1 year ago',
  },
  {
    capabilities: ['embedding'],
    errors: [],
    href: '/library/nomic-embed-text',
    name: 'nomic-embed-text',
    parameterSizes: ['137m'],
    pullCount: 9_100_000,
    pullCountLabel: '9.1M',
    slug: 'nomic-embed-text',
    summary: 'Embedding model with a large token context window.',
    tagCount: 1,
    tags: [
      {
        contextLabel: '8K',
        contextTokens: 8_000,
        digest: 'cccccccccccc',
        href: '/library/nomic-embed-text:latest',
        inputTypes: ['Embedding'],
        name: 'nomic-embed-text:latest',
        parameterB: 0.137,
        sizeBytes: 274_000_000,
        sizeLabel: '274MB',
        tag: 'latest',
        updatedLabel: '2 years ago',
      },
    ],
    updatedAt: '2024-01-01T00:00:00.000Z',
    updatedLabel: '2 years ago',
  },
  {
    capabilities: ['vision', 'tools'],
    errors: [],
    href: '/library/qwen3-vl',
    name: 'qwen3-vl',
    parameterSizes: ['8b', '32b'],
    pullCount: 4_100_000,
    pullCountLabel: '4.1M',
    slug: 'qwen3-vl',
    summary: 'Vision-language model for document and image reasoning.',
    tagCount: 1,
    tags: [
      {
        contextLabel: '256K',
        contextTokens: 256_000,
        digest: 'dddddddddddd',
        href: '/library/qwen3-vl:8b',
        inputTypes: ['Vision', 'Text'],
        name: 'qwen3-vl:8b',
        parameterB: 8,
        sizeBytes: 6_100_000_000,
        sizeLabel: '6.1GB',
        tag: '8b',
        updatedLabel: '7 months ago',
      },
    ],
    updatedAt: '2025-11-01T00:00:00.000Z',
    updatedLabel: '7 months ago',
  },
]

describe('catalogue filtering', () => {
  test('flattens models into tag rows with inherited model metadata', () => {
    const rows = flattenCatalogue(catalogue)

    expect(rows).toHaveLength(4)
    expect(rows[0]).toMatchObject({
      modelName: 'llama3.1',
      name: 'llama3.1:8b',
      capabilities: ['tools'],
    })
  })

  test('filters by size, parameters, context, capability, modality, and search text', () => {
    const rows = flattenCatalogue(catalogue)
    const filteredRows = filterCatalogueRows(rows, {
      capability: 'tools',
      inputType: 'Text',
      maxParametersB: 10,
      maxSizeGb: 7,
      minContextTokens: 100_000,
      minParametersB: 1,
      query: 'vision',
    })

    expect(filteredRows.map((row) => row.name)).toEqual(['qwen3-vl:8b'])
  })

  test('sorts tag rows by context then size', () => {
    const rows = flattenCatalogue(catalogue)
    const sortedRows = sortCatalogueRows(rows, {
      direction: 'desc',
      key: 'context',
    })

    expect(sortedRows.map((row) => row.name)).toEqual([
      'qwen3-vl:8b',
      'llama3.1:8b',
      'llama3.1:70b',
      'nomic-embed-text:latest',
    ])
  })

  test('summarises visible rows', () => {
    const summary = summariseRows(flattenCatalogue(catalogue))

    expect(summary).toEqual({
      maxContextTokens: 256_000,
      minSizeBytes: 274_000_000,
      modelCount: 3,
      tagCount: 4,
      totalPullCount: 129_100_000,
    })
  })
})
