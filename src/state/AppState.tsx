import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { BUNDLES, CHANNELS, PRODUCTS, RECIPES } from '../data/mock'
import type { Bundle, CampaignStatus, ChannelState, Product, ProductAsset, Recipe, SegmentKey, StepState, Toast } from '../data/types'
import { DEFAULT_WEIGHTS, pangvSummary, scoreProducts } from '../lib/ai'
import { assetSummary } from '../lib/assets'

export type FlyerLayout = 'klassisch' | 'editorial' | 'kompakt'

export interface FlyerState {
  headline: string
  subline: string
  layout: FlyerLayout
  heroId: string
  included: string[]
  recipeId: string | null
  bundleId: string | null
  segment: SegmentKey
  personalization: boolean
  committed: boolean
  builderSeen: boolean
}

export interface ImportState {
  status: 'idle' | 'processing' | 'done'
  source: string | null
  rows: number
  errors: number
  warnings: number
  at: string | null
}

export interface State {
  products: Product[]
  customRecipes: Recipe[]
  customBundles: Bundle[]
  weights: Record<string, number>
  flyer: FlyerState
  importSt: ImportState
  campaignStatus: CampaignStatus
  campaignWeek: string
  rankingConfirmed: boolean
  approval: { recipeOk: boolean; bundleOk: boolean; note: string }
  channels: Record<string, ChannelState>
  publishedAt: string | null
  approvedAt: string | null
  toasts: Toast[]
  trendBoost: string | null
  assets: ProductAsset[]
  pangvConfirmations: Record<string, string>
}

function defaultIncluded() {
  return [...PRODUCTS]
    .map((p) => ({ p, s: scoreProducts([p], DEFAULT_WEIGHTS).get(p.id)?.score ?? 50 }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 9)
    .map((x) => x.p.id)
}

const initialChannels = (): Record<string, ChannelState> =>
  Object.fromEntries(
    CHANNELS.map((c) => [
      c.id,
      { status: c.id === 'dooh' ? 'aktualisierung' : 'bereit', last: null } as ChannelState,
    ]),
  )

export const CAMPAIGN_WEEK_DEFAULT = '35'

export const initialState: State = {
  products: PRODUCTS,
  customRecipes: [],
  customBundles: [],
  weights: { ...DEFAULT_WEIGHTS },
  flyer: {
    headline: 'Große Marktfrische.\nKleine Preise.',
    subline: 'Angebote gültig von Montag, 24.08. bis Samstag, 29.08.2026 – nur solange der Vorrat reicht.',
    layout: 'klassisch',
    heroId: 'grillwurst',
    included: defaultIncluded(),
    recipeId: 'pasta',
    bundleId: 'grill-bundle',
    segment: 'grill',
    personalization: true,
    committed: false,
    builderSeen: false,
  },
  importSt: { status: 'idle', source: null, rows: 0, errors: 0, warnings: 0, at: null },
  campaignStatus: 'in_pruefung',
  campaignWeek: CAMPAIGN_WEEK_DEFAULT,
  rankingConfirmed: false,
  approval: { recipeOk: false, bundleOk: false, note: '' },
  channels: initialChannels(),
  publishedAt: null,
  approvedAt: null,
  toasts: [],
  trendBoost: null,
  assets: [],
  pangvConfirmations: {},
}

type Action =
  | { type: 'hydrate'; payload: State }
  | { type: 'toast'; toast: Toast }
  | { type: 'toast/dismiss'; id: number }
  | { type: 'weights/set'; key: string; value: number }
  | { type: 'weights/reset' }
  | { type: 'flyer/patch'; patch: Partial<FlyerState> }
  | { type: 'flyer/toggleProduct'; id: string }
  | { type: 'ranking/confirm'; ids: string[] }
  | { type: 'import/done'; source: string; rows: number; errors: number; warnings: number; products?: Product[] }
  | { type: 'import/reset' }
  | { type: 'approval/patch'; patch: Partial<State['approval']> }
  | { type: 'campaign/approve' }
  | { type: 'campaign/requestChanges'; note: string }
  | { type: 'channel/publish'; id: string }
  | { type: 'channel/revert' }
  | { type: 'recipe/add'; recipe: Recipe }
  | { type: 'bundle/add'; bundle: Bundle }
  | { type: 'trend/boost'; id: string | null }
  | { type: 'campaignWeek/set'; week: string }
  | { type: 'asset/set'; asset: ProductAsset }
  | { type: 'pangv/confirm'; key: string }
  | { type: 'reset' }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate':
      return a.payload
    case 'toast':
      return { ...s, toasts: [...s.toasts, a.toast] }
    case 'toast/dismiss':
      return { ...s, toasts: s.toasts.filter((t) => t.id !== a.id) }
    case 'weights/set':
      return { ...s, weights: { ...s.weights, [a.key]: a.value } }
    case 'weights/reset':
      return { ...s, weights: { ...DEFAULT_WEIGHTS } }
    case 'flyer/patch':
      return { ...s, flyer: { ...s.flyer, ...a.patch, committed: a.patch.committed ?? false } }
    case 'flyer/toggleProduct': {
      const has = s.flyer.included.includes(a.id)
      return { ...s, flyer: { ...s.flyer, committed: false, included: has ? s.flyer.included.filter((x) => x !== a.id) : [...s.flyer.included, a.id] } }
    }
    case 'ranking/confirm':
      return { ...s, rankingConfirmed: true, campaignStatus: s.campaignStatus === 'in_pruefung' ? 'entwurf' : s.campaignStatus, flyer: { ...s.flyer, included: a.ids, heroId: s.flyer.heroId && a.ids.includes(s.flyer.heroId) ? s.flyer.heroId : a.ids[0], committed: false } }
    case 'import/done':
      return {
        ...s,
        importSt: { status: 'done', source: a.source, rows: a.rows, errors: a.errors, warnings: a.warnings, at: new Date().toLocaleString('de-DE') },
        products: a.products && a.products.length ? a.products : s.products,
        rankingConfirmed: false,
        campaignStatus: 'entwurf',
      }
    case 'import/reset':
      return { ...s, importSt: { ...initialState.importSt } }
    case 'approval/patch':
      return { ...s, approval: { ...s.approval, ...a.patch } }
    case 'campaign/approve':
      return { ...s, campaignStatus: 'freigegeben', approvedAt: new Date().toLocaleString('de-DE') }
    case 'campaign/requestChanges':
      return { ...s, campaignStatus: 'entwurf', approval: { ...initialState.approval, note: a.note }, flyer: { ...s.flyer, committed: false }, rankingConfirmed: s.rankingConfirmed }
    case 'channel/publish': {
      const channels = { ...s.channels, [a.id]: { status: 'veroeffentlicht' as const, last: new Date().toLocaleString('de-DE') } }
      const anyPub = Object.values(channels).some((c) => c.status === 'veroeffentlicht')
      return { ...s, channels, campaignStatus: anyPub ? 'veroeffentlicht' : s.campaignStatus, publishedAt: anyPub ? new Date().toLocaleString('de-DE') : s.publishedAt }
    }
    case 'channel/revert':
      return { ...s, channels: initialChannels(), campaignStatus: 'freigegeben', publishedAt: null }
    case 'recipe/add':
      return { ...s, customRecipes: [a.recipe, ...s.customRecipes] }
    case 'bundle/add':
      return { ...s, customBundles: [a.bundle, ...s.customBundles] }
    case 'trend/boost':
      return { ...s, trendBoost: a.id }
    case 'campaignWeek/set':
      return { ...s, campaignWeek: a.week }
    case 'asset/set': {
      const existing = s.assets.findIndex((ea) => ea.productId === a.asset.productId)
      const newAssets = existing >= 0 ? s.assets.map((ea, i) => i === existing ? a.asset : ea) : [...s.assets, a.asset]
      return { ...s, assets: newAssets }
    }
    case 'pangv/confirm': {
      const isConfirmed = s.pangvConfirmations[a.key]
      const newConfs = { ...s.pangvConfirmations }
      if (isConfirmed) {
        delete newConfs[a.key]
      } else {
        newConfs[a.key] = new Date().toLocaleString('de-DE')
      }
      return { ...s, pangvConfirmations: newConfs }
    }
    case 'reset':
      return { ...initialState, weights: { ...DEFAULT_WEIGHTS }, channels: initialChannels(), flyer: { ...initialState.flyer, included: defaultIncluded() } }
    default:
      return s
  }
}

const LS_KEY = 'smart-handzettel:v2'

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> }>({ state: initialState, dispatch: () => {} })

let toastSeq = 1

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (base) => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Filter out undefined values from old payloads so defaults from base are preserved
        const clean = Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined)) as Partial<State>
        return { ...base, ...clean, toasts: [], flyer: { ...base.flyer, ...(clean.flyer || {}) }, importSt: { ...base.importSt, ...(clean.importSt || {}) }, approval: { ...base.approval, ...(clean.approval || {}) } }
      }
    } catch {}
    return base
  })

  useEffect(() => {
    try {
      const { toasts, ...rest } = state
      localStorage.setItem(LS_KEY, JSON.stringify(rest))
    } catch {}
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const { state, dispatch } = useContext(Ctx)
  const notify = (msg: string, kind: Toast['kind'] = 'ok') => {
    const id = toastSeq++
    dispatch({ type: 'toast', toast: { id, msg, kind } })
    window.setTimeout(() => dispatch({ type: 'toast/dismiss', id }), 4200)
  }
  const allRecipes = useMemo(() => [...state.customRecipes, ...RECIPES], [state.customRecipes])
  const allBundles = useMemo(() => [...state.customBundles, ...BUNDLES], [state.customBundles])
  return { state, dispatch, notify, allRecipes, allBundles }
}

// ── Abgeleitete Workflow-Logik ───────────────────────────────────
export function stepStates(s: State): StepState[] {
  const importDone = s.importSt.status === 'done'
  const pangv = pangvSummary(s.products)
  const approved = s.campaignStatus === 'freigegeben' || s.campaignStatus === 'veroeffentlicht'
  const published = s.campaignStatus === 'veroeffentlicht' && Object.values(s.channels).some((c) => c.status === 'veroeffentlicht')

  return [
    importDone ? (s.importSt.errors > 0 ? 'attention' : 'done') : s.importSt.status === 'processing' ? 'active' : 'locked',
    !importDone ? 'locked' : s.rankingConfirmed ? 'done' : 'active',
    !s.rankingConfirmed ? 'locked' : pangv.kritisch > 0 ? 'attention' : s.flyer.committed ? 'done' : 'active',
    approved ? 'done' : s.flyer.committed ? 'active' : 'locked',
    published ? 'done' : approved ? 'active' : 'locked',
  ]
}

export const STEP_META = [
  { key: 'daten', label: 'Daten', icon: 'db', to: '/handzettel/import' },
  { key: 'ranking', label: 'Smart Ranking', icon: 'bars', to: '/ranking' },
  { key: 'handzettel', label: 'Handzettel', icon: 'flyer', to: '/handzettel/builder' },
  { key: 'freigabe', label: 'Freigabe', icon: 'shield', to: '/kampagnen' },
  { key: 'export', label: 'Export', icon: 'share', to: '/handzettel/export' },
]

export interface CheckRow {
  key: string
  label: string
  detail: string
  state: 'ok' | 'open' | 'error'
  action?: 'recipe' | 'bundle'
}

export function approvalChecklist(s: State): CheckRow[] {
  const importDone = s.importSt.status === 'done'
  const pricesOk = s.products.every((p) => p.promo < p.price)
  const pangv = pangvSummary(s.products)
  return [
    { key: 'produkte', label: 'Produkte validiert', detail: importDone ? `${s.importSt.rows} Datensätze · ${s.importSt.warnings} Warnungen` : `Noch kein validierter Import für KW ${s.campaignWeek}`, state: importDone && s.importSt.errors === 0 ? 'ok' : 'error' },
    { key: 'preise', label: 'Preise validiert', detail: pricesOk ? 'Alle Aktionspreise unterhalb der Normalpreise' : 'Mindestens ein Aktionspreis ≥ Normalpreis', state: pricesOk ? 'ok' : 'error' },
    { key: 'pangv', label: 'PAngV-Vorprüfung', detail: `${pangv.ok + pangv.offen}/${pangv.total} geprüft · ${pangv.offen} offen · ${pangv.warnung} Warnungen · ${pangv.kritisch} kritisch`, state: pangv.kritisch === 0 ? 'ok' : 'error' },
    { key: 'bilder', label: 'Bilder verfügbar', detail: (() => { const a = assetSummary(s.assets); return s.assets.length === 0 ? `${s.products.length}/${s.products.length} no asignados` : `${s.products.length} Artikel — ${a.lieferant} Lief., ${a.optimiert} opt., ${a.ki} KI` })(), state: s.assets.length >= s.products.length ? 'ok' : 'open' },
    { key: 'rezepte', label: 'Rezepte freigegeben', detail: s.flyer.recipeId ? (s.approval.recipeOk ? 'Rezept der Woche bestätigt' : 'Rezept im Flyer – Bestätigung ausstehend') : 'Kein Rezept im Flyer', state: s.flyer.recipeId && s.approval.recipeOk ? 'ok' : 'open', action: 'recipe' },
    { key: 'bundles', label: 'Bundles freigegeben', detail: s.flyer.bundleId ? (s.approval.bundleOk ? 'Smart Bundle bestätigt' : 'Bundle im Flyer – Bestätigung ausstehend') : 'Kein Bundle im Flyer', state: s.flyer.bundleId && s.approval.bundleOk ? 'ok' : 'open', action: 'bundle' },
    { key: 'personalisierung', label: 'Personalisierung bereit', detail: s.flyer.personalization ? '6 Zielgruppensegmente aktiv, Vorschau geprüft' : 'Personalisierung deaktiviert – alle Kunden sehen denselben Flyer', state: s.flyer.personalization ? 'ok' : 'open' },
  ]
}

export const CAMPAIGN_LABEL: Record<CampaignStatus, { label: string; tone: 'zinc' | 'info' | 'ok' | 'accent' }> = {
  entwurf: { label: 'Entwurf', tone: 'zinc' },
  in_pruefung: { label: 'In Prüfung', tone: 'info' },
  freigegeben: { label: 'Freigegeben', tone: 'ok' },
  veroeffentlicht: { label: 'Veröffentlicht', tone: 'accent' },
  archiv: { label: 'Archiv', tone: 'zinc' },
}
