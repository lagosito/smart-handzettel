export type Category =
  | 'Obst & Gemüse'
  | 'Fleisch'
  | 'Molkerei'
  | 'Getränke'
  | 'Tiefkühl'
  | 'Backwaren'
  | 'Snacks'
  | 'Feinkost'
  | 'Haushalt'

export type Region = 'Nord' | 'Süd' | 'West' | 'Ost' | 'Bundesweit'

export type SegmentKey = 'familien' | 'singles' | 'preis' | 'veggie' | 'grill' | 'stamm'

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  ean: string
  unit: string
  price: number // Normalpreis
  promo: number // Aktionspreis
  base: string // Grundpreis z. B. "7,18 €/kg"
  deposit?: number // Pfand
  uvp?: number
  margin: number // %
  velocity: number // Abverkauf Einheiten / Woche
  stock: number // Lagerbestand
  demand: number // 0–100 Nachfragesignal
  season: number // 0–100 Saisonalität
  seasonPeak?: string
  regionality: number // 0–100
  region: Region
  emoji: string
  img?: string
  segments: SegmentKey[]
  period: string
  bio?: boolean
}

export interface RecipeIngredient {
  productId?: string
  name: string
  amount: string
}

export interface Recipe {
  id: string
  title: string
  desc: string
  time: string
  difficulty: 'Einfach' | 'Mittel' | 'Anspruchsvoll'
  servings: number
  kcal?: string
  img?: string
  emoji: string
  ingredients: RecipeIngredient[]
  steps: string[]
  tags: string[]
  segments: SegmentKey[]
  ki?: boolean
}

export interface Bundle {
  id: string
  title: string
  desc: string
  productIds: string[]
  bundlePrice: number
  basketEffect: number // erwarteter Warenkorb-Effekt in %
  segments: SegmentKey[]
  badge?: string
  ki?: boolean
}

export type ChannelId =
  | 'print'
  | 'web'
  | 'app'
  | 'email'
  | 'push'
  | 'social'
  | 'ooh'
  | 'dooh'
  | 'instore'

export interface Channel {
  id: ChannelId
  name: string
  icon: string
  desc: string
  format: string
}

export type ChannelStatus = 'bereit' | 'veroeffentlicht' | 'aktualisierung' | 'fehler' | 'gesperrt'

export interface ChannelState {
  status: ChannelStatus
  last: string | null
}

export type CampaignStatus = 'entwurf' | 'in_pruefung' | 'freigegeben' | 'veroeffentlicht' | 'archiv'

export interface Integration {
  id: string
  name: string
  icon: string
  desc: string
  status: 'verbunden' | 'fehler' | 'getrennt'
  lastSync: string | null
  detail: string
}

export interface ImportIssue {
  row: number
  field: string
  severity: 'fehler' | 'warnung'
  message: string
}

export interface Toast {
  id: number
  kind: 'ok' | 'info' | 'warn' | 'error'
  msg: string
}

export type StepState = 'done' | 'active' | 'attention' | 'locked'

export interface ScoreResult {
  score: number
  contributions: { key: string; label: string; points: number; pct: number }[]
  explanation: string
}
