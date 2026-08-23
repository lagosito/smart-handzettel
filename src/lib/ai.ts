import type { Product, ScoreResult } from '../data/types'
import { discount } from './utils'

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

const norm = (v: number, min: number, max: number) => Math.max(0, Math.min(1, (v - min) / (max - min)))

function factorValue(p: Product, key: string): number {
  switch (key) {
    case 'margin':
      return norm(p.margin, 15, 45)
    case 'velocity':
      return norm(p.velocity, 300, 2800)
    case 'demand':
      return norm(p.demand, 40, 95)
    case 'season':
      return norm(p.season, 35, 98)
    case 'regionality':
      return norm(p.regionality, 10, 95)
    case 'stock':
      // hoher Bestand = Abverkaufsdruck → positiv; sehr knapper Bestand = Risiko
      if (p.stock < 180) return 0.18
      return norm(p.stock, 180, 1600)
    default:
      return 0.5
  }
}

export function scoreProduct(p: Product, weights: Record<string, number> = DEFAULT_WEIGHTS): ScoreResult {
  const totalW = FACTORS.reduce((s, f) => s + (weights[f.key] ?? 0), 0) || 1
  const contributions = FACTORS.map((f) => {
    const v = factorValue(p, f.key)
    const w = (weights[f.key] ?? 0) / totalW
    return { key: f.key, label: f.label, value: v, points: v * w * 100, pct: v * 100 }
  }).sort((a, b) => b.points - a.points)

  const raw = contributions.reduce((s, c) => s + c.points, 0)
  const score = Math.round(Math.min(99, Math.max(18, 18 + raw * 0.82)))

  return { score, contributions, explanation: explain(p, contributions) }
}

function explain(p: Product, contribs: ScoreResult['contributions']): string {
  const parts: string[] = []
  const f = (k: string) => contribs.find((c) => c.key === k)!

  if (f('margin').value > 0.72) parts.push('hohe Marge')
  else if (f('margin').value > 0.45) parts.push('solide Marge')

  if (f('velocity').value > 0.7) parts.push('überdurchschnittlicher Abverkauf')
  if (f('demand').value > 0.72) parts.push('steigende regionale Nachfrage')
  else if (f('demand').value > 0.55) parts.push('stabile Nachfrage')
  if (f('season').value > 0.78) parts.push('Saison-Peak in KW 35')
  if (f('regionality').value > 0.8) parts.push('starker Regionalfaktor')
  if (p.stock < 180) parts.push('geringer Lagerbestand begrenzt Reichweite')
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
export type PangvLevel = 'konform' | 'warnung' | 'fehler'

export interface PangvIssue {
  label: string
  detail: string
  level: PangvLevel
}

export function pangvCheck(p: Product): { status: PangvLevel; items: PangvIssue[] } {
  const items: PangvIssue[] = []

  if (p.promo >= p.price) {
    items.push({ label: 'Aktionspreis', detail: 'Aktionspreis liegt nicht unter dem Normalpreis.', level: 'fehler' })
  } else {
    items.push({ label: 'Aktionspreis', detail: `${discount(p.price, p.promo)} % unter Normalpreis – zulässige Preiswerbung.`, level: 'konform' })
  }

  if (!p.base || p.base.trim() === '') {
    items.push({ label: 'Grundpreis', detail: 'Grundpreis gemäß § 2 PAngV fehlt.', level: 'fehler' })
  } else if (!/(kg|l|Stück|100 g|Packung|Rolle)/i.test(p.base)) {
    items.push({ label: 'Grundpreis', detail: `Grundpreis "${p.base}" – Bezugseinheit prüfen (§ 2 Abs. 2 PAngV).`, level: 'warnung' })
  } else {
    items.push({ label: 'Grundpreis', detail: `${p.base} – Angabe vollständig und lesbar.`, level: 'konform' })
  }

  if (p.category === 'Getränke' && p.deposit == null) {
    items.push({ label: 'Pfand', detail: 'Pfandangabe prüfen – Getränkeverpackung ohne Pfandvermerk.', level: 'warnung' })
  } else if (p.deposit != null) {
    items.push({ label: 'Pfand', detail: `zzgl. ${p.deposit.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € Pfand – ausgewiesen.`, level: 'konform' })
  } else {
    items.push({ label: 'Pfand', detail: 'Nicht pfandpflichtig.', level: 'konform' })
  }

  if (p.uvp != null && p.promo > p.uvp) {
    items.push({ label: 'UVP', detail: 'Aktionspreis über UVP – Mondpreis-Risiko.', level: 'fehler' })
  } else if (p.uvp != null) {
    items.push({ label: 'UVP', detail: `UVP ${p.uvp.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} korrekt als Streichpreis gekennzeichnet.`, level: 'konform' })
  } else {
    items.push({ label: 'UVP', detail: 'Kein UVP im Angebot – keine Sonderprüfung nötig.', level: 'konform' })
  }

  items.push({ label: 'MwSt.-Hinweis', detail: '„Alle Preise inkl. gesetzlicher MwSt.“ im Footer vorhanden.', level: 'konform' })

  const status: PangvLevel = items.some((i) => i.level === 'fehler')
    ? 'fehler'
    : items.some((i) => i.level === 'warnung')
      ? 'warnung'
      : 'konform'

  return { status, items }
}

export function pangvSummary(products: Product[]) {
  let konform = 0, warnung = 0, fehler = 0
  products.forEach((p) => {
    const s = pangvCheck(p).status
    if (s === 'konform') konform++
    else if (s === 'warnung') warnung++
    else fehler++
  })
  return { konform, warnung, fehler, total: products.length }
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
