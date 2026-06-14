export interface OllamaTag {
  contextLabel: string | null
  contextTokens: number | null
  digest: string | null
  href: string
  inputTypes: string[]
  name: string
  parameterB: number | null
  sizeBytes: number | null
  sizeLabel: string | null
  tag: string
  updatedLabel: string | null
}

export interface OllamaModel {
  capabilities: string[]
  errors: string[]
  href: string
  name: string
  parameterSizes: string[]
  pullCount: number | null
  pullCountLabel: string | null
  slug: string
  summary: string
  tagCount: number | null
  tags: OllamaTag[]
  updatedAt: string | null
  updatedLabel: string | null
}

export interface OllamaCataloguePayload {
  cache: {
    hit: boolean
    ttlSeconds: number
  }
  errors: string[]
  generatedAt: string
  models: OllamaModel[]
  sourceUrl: string
}

export type SortDirection = 'asc' | 'desc'

export type CatalogueSortKey =
  | 'context'
  | 'name'
  | 'parameters'
  | 'pulls'
  | 'size'
  | 'updated'

export interface CatalogueSort {
  direction: SortDirection
  key: CatalogueSortKey
}

export interface CatalogueFilters {
  capabilities?: string[]
  capability?: string
  inputType?: string
  inputTypes?: string[]
  maxParametersB?: number | null
  maxSizeGb?: number | null
  minContextTokens?: number | null
  minParametersB?: number | null
  minSizeGb?: number | null
  query?: string
}

export interface CatalogueTagRow extends OllamaTag {
  capabilities: string[]
  modelHref: string
  modelName: string
  modelParameterSizes: string[]
  modelSlug: string
  modelSummary: string
  modelUpdatedAt: string | null
  modelUpdatedLabel: string | null
  pullCount: number | null
  pullCountLabel: string | null
  searchText: string
}

export interface CatalogueSummary {
  maxContextTokens: number | null
  minSizeBytes: number | null
  modelCount: number
  tagCount: number
  totalPullCount: number
}
