import type { Product, ScoreResult } from '../data/types'
import { discount } from './utils'

// ── Factors & Weights ────────────────────────────────────────────
export interface Factor {
  key: string
  label: string
  desc: string
}

export const FACTORS: Factor[] = [
  { key: 'margin', label: 'Marge', desc: 'Handelsspanne in %' },
  { key: 'velocity', label: 'Abverkauf', desc: 'Erwartete Einheiten pro Woche' },
  { key: 'demand', label: 'Nachfrage', desc: 'Such- & Kaufsignale' },
  { key: 'season', label: 'Saison', desc: 'Saisonale Relevanz' },
  { key: 'regionality', label: 'Regionalität', desc: 'Regionale Herkunft & Beliebtheit' },
  { key: 'stock', label: 'Lagerbestand', desc: 'Verfügbarkeit & Abverkaufsdruck' },
]

export const DEFAULT_WEIGHTS: Record<string, number> = {
  margin: 22,
  velocity: 22,
  demand: 18,
  season: 12,
  regionality: 11,
  stock: 15,
}

// ── Presentation smoothing constants (not model output) ──────────
const SCORE_FLOOR = 18
const SCORE_CEIL = 99
const SCORE_GAIN = 0.82

// ── Low-stock threshold ──────────────────────────────────────────
export const LOW_STOCK_UNITS = 180

// ── Percentile helpers ───────────────────────────────────────────

/** Average rank of tied values in a sorted array (1-indexed). */
function averageRanks(values: number[]): number[] {
  const indexed = values.map((v, i) => ({ v, i }))
  indexed.sort((a, b) => a.v - b.v)
  const ranks = new Array(values.length)
  let i = 0
  while (i < indexed.length) {
    let j = i
    while (j < indexed.length && indexed[j].v === indexed[i].v) j++
    const avgRank = (i + 1 + j) / 2
    for (let k = i; k < j; k++) ranks[indexed[k].i] = avgRank
    i = j
  }
  return ranks
}

/** Compute percentile [0,1] for each value, returned as id→percentile map. */
function buildPercentileMap(products: Product[], rawVals: number[]): Map<string, number> {
  const map = new Map<string, number>()
  if (products.length === 0) return map
  if (products.length === 1) { map.set(products[0].id, 0.5); return map }
  const ranks = averageRanks(rawVals)
  const n = products.length
  products.forEach((p, i) => map.set(p.id, Math.max(0, Math.min(1, (ranks[i] - 1) / (n - 1)))))
  return map
}

/** Get raw value for a factor from a product. */
function rawValue(p: Product, key: string): number {
  switch (key) {
    case 'margin': return p.margin
    case 'velocity': return p.velocity
    case 'demand': return p.demand
    case 'season': return p.season
    case 'regionality': return p.regionality
    case 'stock': return p.stock
    default: return 50
  }
}

// ── Core scoring ─────────────────────────────────────────────────

/**
 * Score all products by percentile rank within category cohorts.
 * Precomputes all percentile tables once — O(n log n) overall, not quadratic.
 */
export function scoreProducts(
  products: Product[],
  weights: Record<string, number> = DEFAULT_WEIGHTS,
): Map<string, ScoreResult> {
  const totalW = FACTORS.reduce((s, f) => s + (weights[f.key] ?? 0), 0) || 1

  // Group products by category
  const byCategory = new Map<string, Product[]>()
  for (const p of products) {
    const arr = byCategory.get(p.category) ?? []
    arr.push(p)
    byCategory.set(p.category, arr)
  }

  // Precompute full-dataset percentile tables for fallback
  const fullPctMaps = new Map<string, Map<string, number>>()
  for (const f of FACTORS) {
    if (f.key === 'stock') {
      // stock: exclude low-stock from full cohort
      const eligible = products.filter((p) => p.stock >= LOW_STOCK_UNITS)
      const vals = eligible.map((p) => rawValue(p, f.key))
      fullPctMaps.set(f.key, buildPercentileMap(eligible, vals))
    } else {
      const vals = products.map((p) => rawValue(p, f.key))
      fullPctMaps.set(f.key, buildPercentileMap(products, vals))
    }
  }

  // Per-factor percentile tables (category-aware)
  const factorPctMaps = new Map<string, Map<string, number>>()

  for (const f of FACTORS) {
    const idToPct = new Map<string, number>()

    if (f.key === 'stock') {
      for (const [, catProducts] of byCategory) {
        const eligible = catProducts.filter((p) => p.stock >= LOW_STOCK_UNITS)
        if (eligible.length < 5) {
          // Fallback: use full dataset percentile (already computed)
          const fullMap = fullPctMaps.get(f.key)!
          for (const p of catProducts) {
            idToPct.set(p.id, p.stock < LOW_STOCK_UNITS ? 0.18 : (fullMap.get(p.id) ?? 0.5))
          }
        } else {
          // Category cohort
          const vals = eligible.map((p) => rawValue(p, f.key))
          const pctMap = buildPercentileMap(eligible, vals)
          for (const p of catProducts) {
            idToPct.set(p.id, p.stock < LOW_STOCK_UNITS ? 0.18 : (pctMap.get(p.id) ?? 0.5))
          }
        }
      }
    } else {
      for (const [, catProducts] of byCategory) {
        if (catProducts.length < 5) {
          // Fallback: use full dataset percentile
          const fullMap = fullPctMaps.get(f.key)!
          for (const p of catProducts) {
            idToPct.set(p.id, fullMap.get(p.id) ?? 0.5)
          }
        } else {
          const vals = catProducts.map((p) => rawValue(p, f.key))
          const pctMap = buildPercentileMap(catProducts, vals)
          catProducts.forEach((p) => idToPct.set(p.id, pctMap.get(p.id) ?? 0.5))
        }
      }
    }

    factorPctMaps.set(f.key, idToPct)
  }

  // Score each product
  const results = new Map<string, ScoreResult>()

  for (const p of products) {
    const contributions = FACTORS.map((f) => {
      const pctMap = factorPctMaps.get(f.key)!
      const v = pctMap.get(p.id) ?? 0.5
      const w = (weights[f.key] ?? 0) / totalW
      return { key: f.key, label: f.label, value: v, points: v * w * 100, pct: v * 100 }
    }).sort((a, b) => b.points - a.points)

    const raw = contributions.reduce((s, c) => s + c.points, 0)
    // Presentation smoothing, not model output
    const score = Math.round(Math.min(SCORE_CEIL, Math.max(SCORE_FLOOR, SCORE_FLOOR + raw * SCORE_GAIN)))

    results.set(p.id, { score, contributions, explanation: explain(p, contributions) })
  }

  return results
}

/**
 * Convenience: score a single product against a given cohort.
 * No implicit global — caller must provide the products array.
 */
export function scoreOne(p: Product, products: Product[], weights: Record<string, number> = DEFAULT_WEIGHTS): ScoreResult {
  const map = scoreProducts(products, weights)
  return map.get(p.id) ?? { score: 50, contributions: [], explanation: '' }
}

function explain(p: Product, contribs: ScoreResult['contributions']): string {
  const parts: string[] = []
  const f = (k: string) => contribs.find((c) => c.key === k)!

  if (f('margin').value > 0.72) parts.push('hohe Marge')
  else if (f('margin').value > 0.45) parts.push('solide Marge')

  if (f('velocity').value > 0.7) parts.push('überdurchschnittlicher Abverkauf')
  if (f('demand').value > 0.72) parts.push('steigende regionale Nachfrage')
  else if (f('demand').value > 0.55) parts.push('stabile Nachfrage')
  if (f('season').value > 0.78) {
    parts.push(p.seasonPeak ? `Saison-Peak ${p.seasonPeak}` : 'saisonaler Höhepunkt im Aktionszeitraum')
  }
  if (f('regionality').value > 0.8) parts.push('starker Regionalfaktor')
  if (p.stock < LOW_STOCK_UNITS) parts.push('geringer Lagerbestand begrenzt Reichweite')
  else if (f('stock').value > 0.8) parts.push('hoher Lagerbestand – Abverkauf beschleunigen')

  if (parts.length === 0) return 'Ausgewogenes Kosten-Nutzen-Profil für die Programmplatzierung.'
  const sentence = parts.slice(0, 3).map((x, i) => (i === 0 ? x[0].toUpperCase() + x.slice(1) : x)).join(' + ')
  return sentence.replace(/ \+ ([^+]*)$/, ' und $1') + '.'
}

export function placementFor(score: number): string {
  if (score >= 90) return 'Hero-Platzierung, Seite 1'
  if (score >= 80) return 'Top-Angebot, Seite 1–2'
  if (score >= 70) return 'Kategorie-Führung'
  return 'Standardplatzierung im Rasterteil'
}

// ── PAngV-Prüfung ────────────────────────────────────────────────
export type PangvLevel = 'ok' | 'offen' | 'warnung' | 'kritisch'

export interface PangvIssue {
  label: string
  detail: string
  level: PangvLevel
  requiresConfirmation: boolean
  confirmedBy?: string
}

export function pangvCheck(p: Product): { status: PangvLevel; items: PangvIssue[] } {
  const items: PangvIssue[] = []

  if (p.promo >= p.price) {
    items.push({
      label: 'Aktionspreis',
      detail: 'Aktionspreis liegt nicht unter dem Normalpreis.',
      level: 'kritisch',
      requiresConfirmation: false,
    })
  } else {
    items.push({
      label: 'Aktionspreis',
      detail: `${discount(p.price, p.promo)} % unter Normalpreis – zulässige Preiswerbung.`,
      level: 'ok',
      requiresConfirmation: false,
    })
  }

  if (!p.base || p.base.trim() === '') {
    items.push({
      label: 'Grundpreis',
      detail: 'Grundpreis gemäß § 2 PAngV fehlt.',
      level: 'kritisch',
      requiresConfirmation: false,
    })
  } else if (!/(kg|l|Stück|100 g|Packung|Rolle)/i.test(p.base)) {
    items.push({
      label: 'Grundpreis',
      detail: `Grundpreis "${p.base}" – Bezugseinheit prüfen (§ 2 Abs. 2 PAngV).`,
      level: 'warnung',
      requiresConfirmation: false,
    })
  } else {
    items.push({
      label: 'Grundpreis',
      detail: `${p.base} – Angabe vorhanden, Darstellung im Layout prüfen.`,
      level: 'ok',
      requiresConfirmation: false,
    })
  }

  if (p.category === 'Getränke' && p.deposit == null) {
    items.push({
      label: 'Pfand',
      detail: 'Pfandangabe prüfen – Getränkeverpackung ohne Pfandvermerk.',
      level: 'warnung',
      requiresConfirmation: false,
    })
  } else if (p.deposit != null) {
    items.push({
      label: 'Pfand',
      detail: `zzgl. ${p.deposit.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € Pfand – ausgewiesen.`,
      level: 'ok',
      requiresConfirmation: false,
    })
  } else {
    // Non-Getränke without deposit: we can't verify absence
    items.push({
      label: 'Pfand',
      detail: 'Pfandstatus nicht verifizierbar – manuell prüfen.',
      level: 'offen',
      requiresConfirmation: true,
    })
  }

  if (p.uvp != null && p.promo > p.uvp) {
    items.push({
      label: 'UVP',
      detail: 'Aktionspreis über UVP – Mondpreis-Risiko.',
      level: 'kritisch',
      requiresConfirmation: false,
    })
  } else if (p.uvp != null) {
    items.push({
      label: 'UVP',
      detail: `UVP ${p.uvp.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} als Streichpreis gekennzeichnet.`,
      level: 'ok',
      requiresConfirmation: false,
    })
  } else {
    // No UVP available — can't verify
    items.push({
      label: 'UVP',
      detail: 'Kein UVP im Angebot – Vorprüfung nicht möglich.',
      level: 'offen',
      requiresConfirmation: true,
    })
  }

  const status: PangvLevel = items.some((i) => i.level === 'kritisch')
    ? 'kritisch'
    : items.some((i) => i.level === 'warnung')
      ? 'warnung'
      : items.some((i) => i.level === 'offen')
        ? 'offen'
        : 'ok'

  return { status, items }
}

/**
 * Campaign-level PAngV checks (layout/footer, not per-product).
 * MwSt.-Hinweis and similar items that apply once to the whole flyer.
 */
export function pangvCampaignCheck(): { status: PangvLevel; items: PangvIssue[] } {
  const items: PangvIssue[] = [
    {
      label: 'MwSt.-Hinweis',
      detail: '„Alle Preise inkl. gesetzlicher MwSt." im Footer – Annahme, nicht verifiziert.',
      level: 'offen',
      requiresConfirmation: true,
    },
    {
      label: 'Grundpreise gemäß § 2 PAngV',
      detail: 'Grundpreise im Layout sichtbar und lesbar – Darstellung prüfen.',
      level: 'offen',
      requiresConfirmation: true,
    },
  ]

  const status: PangvLevel = items.some((i) => i.level === 'kritisch')
    ? 'kritisch'
    : items.some((i) => i.level === 'warnung')
      ? 'warnung'
      : items.some((i) => i.level === 'offen')
        ? 'offen'
        : 'ok'

  return { status, items }
}

export function pangvSummary(products: Product[]) {
  let ok = 0, offen = 0, warnung = 0, kritisch = 0
  products.forEach((p) => {
    const s = pangvCheck(p).status
    if (s === 'ok') ok++
    else if (s === 'offen') offen++
    else if (s === 'warnung') warnung++
    else kritisch++
  })
  return { ok, offen, warnung, kritisch, total: products.length }
}

// ── Feld-Mapping für Import ──────────────────────────────────────
export const CANONICAL_FIELDS = [
  { key: 'produktname', label: 'Produktname' },
  { key: 'kategorie', label: 'Kategorie' },
  { key: 'ean', label: 'EAN' },
  { key: 'normalpreis', label: 'Normalpreis' },
  { key: 'aktionspreis', label: 'Aktionspreis' },
  { key: 'grundpreis', label: 'Grundpreis' },
  { key: 'pfand', label: 'Pfand' },
  { key: 'uvp', label: 'UVP' },
  { key: 'marge', label: 'Marge' },
  { key: 'abverkauf', label: 'Abverkauf' },
  { key: 'lagerbestand', label: 'Lagerbestand' },
  { key: 'region', label: 'Region' },
  { key: 'aktionszeitraum', label: 'Aktionszeitraum' },
]
