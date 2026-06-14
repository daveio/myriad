import { normaliseSearchText } from '../shared/modelMetrics'
import type {
  CatalogueFilters,
  CatalogueSort,
  CatalogueSummary,
  CatalogueTagRow,
  OllamaModel,
} from '../types/ollama'

const BYTES_PER_GB = 1_000_000_000

export function flattenCatalogue(models: OllamaModel[]): CatalogueTagRow[] {
  return models.flatMap((model) =>
    model.tags.map((tag) => {
      const searchText = normaliseSearchText(
        [
          model.name,
          model.summary,
          model.capabilities.join(' '),
          model.parameterSizes.join(' '),
          tag.name,
          tag.digest ?? '',
          tag.inputTypes.join(' '),
          tag.sizeLabel ?? '',
          tag.contextLabel ?? '',
        ].join(' '),
      )

      return {
        ...tag,
        capabilities: model.capabilities,
        modelHref: model.href,
        modelName: model.name,
        modelParameterSizes: model.parameterSizes,
        modelSlug: model.slug,
        modelSummary: model.summary,
        modelUpdatedAt: model.updatedAt,
        modelUpdatedLabel: model.updatedLabel,
        pullCount: model.pullCount,
        pullCountLabel: model.pullCountLabel,
        searchText,
      }
    }),
  )
}

export function filterCatalogueRows(rows: CatalogueTagRow[], filters: CatalogueFilters): CatalogueTagRow[] {
  const query = normaliseSearchText(filters.query ?? '')
  const requiredCapabilities = normaliseFilterList([
    ...(filters.capabilities ?? []),
    ...(filters.capability ? [filters.capability] : []),
  ])
  const requiredInputTypes = normaliseFilterList([
    ...(filters.inputTypes ?? []),
    ...(filters.inputType ? [filters.inputType] : []),
  ])

  return rows.filter((row) => {
    if (query && !row.searchText.includes(query)) {
      return false
    }

    if (
      requiredCapabilities.length > 0 &&
      !requiredCapabilities.every((capability) => row.capabilities.map(normaliseSearchText).includes(capability))
    ) {
      return false
    }

    if (
      requiredInputTypes.length > 0 &&
      !requiredInputTypes.every((inputType) => row.inputTypes.map(normaliseSearchText).includes(inputType))
    ) {
      return false
    }

    if (!passesMinimum(row.sizeBytes, gbToBytes(filters.minSizeGb))) {
      return false
    }

    if (!passesMaximum(row.sizeBytes, gbToBytes(filters.maxSizeGb))) {
      return false
    }

    if (!passesMinimum(row.contextTokens, filters.minContextTokens ?? null)) {
      return false
    }

    if (!passesMinimum(row.parameterB, filters.minParametersB ?? null)) {
      return false
    }

    if (!passesMaximum(row.parameterB, filters.maxParametersB ?? null)) {
      return false
    }

    return true
  })
}

export function sortCatalogueRows(rows: CatalogueTagRow[], sort: CatalogueSort): CatalogueTagRow[] {
  const directionMultiplier = sort.direction === 'asc' ? 1 : -1

  return [...rows].sort((leftRow, rightRow) => {
    const primaryComparison = compareNullable(sortValue(leftRow, sort.key), sortValue(rightRow, sort.key))

    if (primaryComparison !== 0) {
      return primaryComparison * directionMultiplier
    }

    const secondarySizeComparison = compareNullable(leftRow.sizeBytes, rightRow.sizeBytes)

    if (secondarySizeComparison !== 0) {
      return secondarySizeComparison
    }

    return leftRow.name.localeCompare(rightRow.name)
  })
}

export function summariseRows(rows: CatalogueTagRow[]): CatalogueSummary {
  const modelPullCounts = new Map<string, number>()
  const sizeValues = rows.map((row) => row.sizeBytes).filter((value): value is number => value !== null)
  const contextValues = rows.map((row) => row.contextTokens).filter((value): value is number => value !== null)

  for (const row of rows) {
    if (row.pullCount !== null) {
      modelPullCounts.set(row.modelName, row.pullCount)
    }
  }

  return {
    maxContextTokens: contextValues.length > 0 ? Math.max(...contextValues) : null,
    minSizeBytes: sizeValues.length > 0 ? Math.min(...sizeValues) : null,
    modelCount: new Set(rows.map((row) => row.modelName)).size,
    tagCount: rows.length,
    totalPullCount: [...modelPullCounts.values()].reduce((totalPullCount, pullCount) => totalPullCount + pullCount, 0),
  }
}

export function collectCapabilities(models: OllamaModel[]): string[] {
  return [...new Set(models.flatMap((model) => model.capabilities))].sort((leftValue, rightValue) =>
    leftValue.localeCompare(rightValue),
  )
}

export function collectInputTypes(rows: CatalogueTagRow[]): string[] {
  return [...new Set(rows.flatMap((row) => row.inputTypes))].sort((leftValue, rightValue) =>
    leftValue.localeCompare(rightValue),
  )
}

function normaliseFilterList(values: string[]): string[] {
  return values.map(normaliseSearchText).filter(Boolean)
}

function gbToBytes(value: number | null | undefined): number | null {
  return value === null || value === undefined ? null : value * BYTES_PER_GB
}

function passesMinimum(actualValue: number | null, requiredValue: number | null): boolean {
  return requiredValue === null || (actualValue !== null && actualValue >= requiredValue)
}

function passesMaximum(actualValue: number | null, requiredValue: number | null): boolean {
  return requiredValue === null || (actualValue !== null && actualValue <= requiredValue)
}

function compareNullable(leftValue: number | string | null, rightValue: number | string | null): number {
  if (leftValue === null && rightValue === null) {
    return 0
  }

  if (leftValue === null) {
    return 1
  }

  if (rightValue === null) {
    return -1
  }

  if (typeof leftValue === 'string' && typeof rightValue === 'string') {
    return leftValue.localeCompare(rightValue)
  }

  return Number(leftValue) - Number(rightValue)
}

function sortValue(row: CatalogueTagRow, sortKey: CatalogueSort['key']): number | string | null {
  switch (sortKey) {
    case 'context':
      return row.contextTokens
    case 'name':
      return row.name
    case 'parameters':
      return row.parameterB
    case 'pulls':
      return row.pullCount
    case 'size':
      return row.sizeBytes
    case 'updated':
      return row.modelUpdatedAt ? new Date(row.modelUpdatedAt).getTime() : null
  }
}
