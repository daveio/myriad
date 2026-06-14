const KB_BYTES = 1_000
const MB_BYTES = 1_000_000
const GB_BYTES = 1_000_000_000
const TB_BYTES = 1_000_000_000_000

const DECIMAL_BYTE_MULTIPLIERS: Record<string, number> = {
  b: 1,
  gb: GB_BYTES,
  kb: KB_BYTES,
  mb: MB_BYTES,
  tb: TB_BYTES,
}

const COUNT_MULTIPLIERS: Record<string, number> = {
  b: 1_000_000_000,
  k: 1_000,
  m: 1_000_000,
}

export function parseByteSizeToBytes(value: string | null | undefined): number | null {
  const normalisedValue = value?.trim()

  if (!normalisedValue) {
    return null
  }

  const sizeMatch = normalisedValue.match(/(\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb)\b/i)

  if (!sizeMatch) {
    return null
  }

  const amountText = sizeMatch[1]
  const unit = sizeMatch[2]?.toLowerCase()

  if (!amountText || !unit) {
    return null
  }

  const amount = Number(amountText)
  const multiplier = DECIMAL_BYTE_MULTIPLIERS[unit]

  if (!Number.isFinite(amount) || multiplier === undefined) {
    return null
  }

  return Math.round(amount * multiplier)
}

export function parseContextToTokens(value: string | null | undefined): number | null {
  const normalisedValue = value?.trim()

  if (!normalisedValue) {
    return null
  }

  const contextMatch = normalisedValue.match(/(\d+(?:\.\d+)?)\s*([km])\b/i)

  if (!contextMatch) {
    return null
  }

  const amountText = contextMatch[1]
  const suffix = contextMatch[2]?.toLowerCase()

  if (!amountText || !suffix) {
    return null
  }

  const amount = Number(amountText)
  const multiplier = suffix === 'm' ? 1_000_000 : 1_000

  if (!Number.isFinite(amount)) {
    return null
  }

  return Math.round(amount * multiplier)
}

export function parsePullCount(value: string | null | undefined): number | null {
  const normalisedValue = value?.trim()

  if (!normalisedValue) {
    return null
  }

  const pullCountMatch = normalisedValue.match(/^(\d+(?:\.\d+)?)\s*([kmb])?$/i)

  if (!pullCountMatch) {
    return null
  }

  const amountText = pullCountMatch[1]
  const suffix = pullCountMatch[2]?.toLowerCase()

  if (!amountText) {
    return null
  }

  const amount = Number(amountText)
  const multiplier = suffix ? COUNT_MULTIPLIERS[suffix] : 1

  if (!Number.isFinite(amount) || multiplier === undefined) {
    return null
  }

  return Math.round(amount * multiplier)
}

export function parseParameterEstimate(value: string | null | undefined): number | null {
  const normalisedValue = value?.trim().toLowerCase()

  if (!normalisedValue) {
    return null
  }

  const mixtureMatch = normalisedValue.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*b\b/)

  if (mixtureMatch) {
    const expertCount = Number(mixtureMatch[1] ?? Number.NaN)
    const expertSize = Number(mixtureMatch[2] ?? Number.NaN)

    if (Number.isFinite(expertCount) && Number.isFinite(expertSize)) {
      return roundBillions(expertCount * expertSize)
    }
  }

  const scalarMatches = [...normalisedValue.matchAll(/(\d+(?:\.\d+)?)\s*([mb])\b/g)]
  const estimates = scalarMatches
    .map((scalarMatch) => {
      const amount = Number(scalarMatch[1] ?? Number.NaN)
      const unit = scalarMatch[2]

      if (!Number.isFinite(amount)) {
        return null
      }

      return unit === 'm' ? amount / 1_000 : amount
    })
    .filter((estimate): estimate is number => estimate !== null)

  if (estimates.length === 0) {
    return null
  }

  return roundBillions(Math.max(...estimates))
}

export function formatBytes(value: number | null): string {
  if (value === null) {
    return 'Unknown'
  }

  if (value >= TB_BYTES) {
    return `${formatCompactNumber(value / TB_BYTES)}TB`
  }

  if (value >= GB_BYTES) {
    return `${formatCompactNumber(value / GB_BYTES)}GB`
  }

  if (value >= MB_BYTES) {
    return `${formatCompactNumber(value / MB_BYTES)}MB`
  }

  if (value >= KB_BYTES) {
    return `${formatCompactNumber(value / KB_BYTES)}KB`
  }

  return `${value}B`
}

export function formatContext(value: number | null): string {
  if (value === null) {
    return 'Unknown'
  }

  if (value >= 1_000_000) {
    return `${formatCompactNumber(value / 1_000_000)}M`
  }

  return `${formatCompactNumber(value / 1_000)}K`
}

export function formatParameterBillions(value: number | null): string {
  if (value === null) {
    return 'Unknown'
  }

  if (value < 1) {
    return `${formatCompactNumber(value * 1_000)}M`
  }

  return `${formatCompactNumber(value)}B`
}

export function normaliseSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function formatCompactNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value)
  }

  return value.toFixed(1).replace(/\.0$/, '')
}

function roundBillions(value: number): number {
  return Number(value.toFixed(3))
}
