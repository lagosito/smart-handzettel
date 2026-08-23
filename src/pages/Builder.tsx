import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { SEGMENTS, bundleById, recipeById } from '../data/mock'
import { pangvSummary, scoreProduct } from '../lib/ai'
import { canGenerateImage, generateAsset } from '../lib/assets'
import { AiTag, Badge, Btn, Card, Toggle, cn, inputCls } from '../components/ui'
import { Icon } from '../lib/icons'
import FlyerPreview from '../components/FlyerPreview'
import { DigitalFlyerModal } from '../components/Assistant'
import type { FlyerLayout } from '../state/AppState'

const LAYOUTS: { key: FlyerLayout; name: string; desc: string }[] = [
  { key: 'klassisch', name: 'Klassisch', desc: 'Hero links, 3-spaltiges Raster, Kategoriebänder' },
  { key: 'editorial', name: 'Editorial', desc: 'Großzügiger Hero, fokussierte Produktbühne' },
  { key: 'kompakt', name: 'Kompakt', desc: 'Dichtes 4-Spalten-Raster für viele Angebote' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">{children}</div>
}

export default function Builder() {
  const { state, dispatch, notify, allRecipes, allBundles } = useApp()
  const nav = useNavigate()
  const { flyer } = state
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop')
  const [openSection, setOpenSection] = useState<'layout' | 'inhalt' | 'texte'>('inhalt')
  const [search, setSearch] = useState('')
  const [digitalOpen, setDigitalOpen] = useState(false)
  const [catOpen, setCatOpen] = useState<string | null>(null)

  const includedScore = useMemo(() => {
    const list = state.products.filter((p) => flyer.included.includes(p.id))
    if (!list.length) return 0
    return Math.round(list.reduce((s, p) => s + scoreProduct(p, state.weights).score, 0) / list.length)
  }, [state.products, flyer.included, state.weights])

  const marginAvg = useMemo(() => {
    const list = state.products.filter((p) => flyer.included.includes(p.id))
    return list.length ? (list.reduce((s, p) => s + p.margin, 0) / list.length).toFixed(1) : '0'
  }, [state.products, flyer.included])

  const catCoverage = useMemo(() => new Set(state.products.filter((p) => flyer.included.includes(p.id)).map((p) => p.category)).size, [state.products, flyer.included])
  const pangv = pangvSummary(state.products.filter((p) => flyer.included.includes(p.id)))

  const suggestions = useMemo(() => {
    const out: { icon: string; tone: 'ok' | 'warn' | 'info'; text: string; action?: () => void; actionLabel?: string }[] = []
    const missing = state.products
      .filter((p) => !flyer.included.includes(p.id))
      .map((p) => ({ p, s: scoreProduct(p, state.weights).score }))
      .sort((a, b) => b.s - a.s)[0]
    if (missing && missing.s >= 88) {
      out.push({
        icon: 'sparkle',
        tone: 'info',
        text: `„${missing.p.name}" (Score ${missing.s}) ist nicht im Flyer – stärker als manche enthaltene Artikel.`,
        actionLabel: 'Hinzufügen',
        action: () => {
          dispatch({ type: 'flyer/toggleProduct', id: missing.p.id })
          notify(`„${missing.p.name}" hinzugefügt.`)
        },
      })
    }
    const low = state.products.find((p) => flyer.included.includes(p.id) && p.stock < 180)
    if (low) out.push({ icon: 'alert', tone: 'warn', text: `„${low.name}" hat nur ${low.stock} Stück Bestand – Reichweite oder Platzierung reduzieren.` })
    if (pangv.kritisch > 0) out.push({ icon: 'alert', tone: 'warn', text: `${pangv.kritisch} Artikel im Flyer verletzen die PAngV – bitte Preise prüfen.` })
    if (flyer.personalization) out.push({ icon: 'checkc', tone: 'ok', text: `Personalisierung aktiv: 6 Segmente erhalten eigene Hero-Produkte, Rezepte & Bundles.` })
    return out
  }, [state.products, state.weights, flyer, pangv.kritisch])

  const setSegment = (key: string) => {
    const seg = SEGMENTS.find((s) => s.key === key)!
    const hero = seg.hero.find((h) => flyer.included.includes(h)) ?? flyer.heroId
    dispatch({ type: 'flyer/patch', patch: { segment: seg.key, heroId: hero, recipeId: seg.recipeId, bundleId: seg.bundleId } })
    notify(`Vorschau: Handzettel für „${seg.label}" personalisiert.`, 'info')
  }

  const grouped = useMemo(() => {
    const map = new Map<string, typeof state.products>()
    state.products
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category === catOpen)
      .forEach((p) => {
        const arr = map.get(p.category) ?? []
        arr.push(p)
        map.set(p.category, arr)
      })
    return [...map.entries()]
  }, [state.products, search, catOpen])

  const commit = () => {
    dispatch({ type: 'flyer/patch', patch: { committed: true, builderSeen: true } })
    notify('Flyer-Konfiguration übernommen – bereit zur Freigabe.')
    nav('/kampagnen?tab=freigabe')
  }

  return (
    <div className="anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Flyer Builder</h1>
            <AiTag />
          </div>
          <p className="text-[13px] text-zinc-500 mt-0.5">Schritt 3 von 5 · Die KI hat den Entwurf für KW ${state.campaignWeek} vorbereitet – Sie behalten die Kontrolle</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="inline-flex rounded-lg border border-zinc-300 bg-white p-0.5">
            {(['desktop', 'mobile'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn('h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer', view === v ? 'bg-zinc-900 text-white' : 'text-zinc-500')}
              >
                <Icon name={v === 'desktop' ? 'tv' : 'phone'} size={13} />
                {v === 'desktop' ? 'Desktop' : 'Mobil'}
              </button>
            ))}
          </div>
          <Btn variant="secondary" onClick={() => setDigitalOpen(true)}>
            <Icon name="chat" size={15} />
            Digitaler Handzettel
          </Btn>
          <Btn onClick={commit}>
            <Icon name="check" size={15} />
            Übernehmen & zur Freigabe
          </Btn>
        </div>
      </div>

      <div className="grid xl:grid-cols-[272px_minmax(0,1fr)_300px] lg:grid-cols-[240px_minmax(0,1fr)] gap-4 items-start">
        {/* Linke Spalte */}
        <div className="space-y-3 lg:sticky lg:top-24">
          {/* Layout */}
          <Card className="!p-3.5">
            <button className="w-full flex items-center justify-between cursor-pointer" onClick={() => setOpenSection(openSection === 'layout' ? 'inhalt' : 'layout')}>
              <SectionTitle>Layout</SectionTitle>
              <Icon name="chevD" size={14} className={cn('text-zinc-400 transition-transform', openSection !== 'layout' && '-rotate-90')} />
            </button>
            <div className={cn('space-y-2', openSection !== 'layout' && 'hidden')}>
              {LAYOUTS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => dispatch({ type: 'flyer/patch', patch: { layout: l.key } })}
                  className={cn(
                    'w-full text-left rounded-xl border p-2.5 transition-colors cursor-pointer',
                    flyer.layout === l.key ? 'border-accent-500 bg-accent-50/60 ring-1 ring-accent-200' : 'border-zinc-200 hover:border-zinc-300',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-12 h-15 rounded-md border bg-white shrink-0 grid gap-0.5 p-1', l.key === 'editorial' ? 'grid-rows-[2fr_1fr_1fr]' : l.key === 'kompakt' ? 'grid-cols-4 grid-rows-3' : 'grid-cols-[1.4fr_1fr] grid-rows-2')}>
                      <div className={cn('rounded-sm bg-accent-300', l.key === 'editorial' && 'col-span-4', l.key === 'kompakt' && 'col-span-4')} />
                      {Array.from({ length: l.key === 'kompakt' ? 8 : 2 }).map((_, i) => (
                        <div key={i} className={cn('rounded-[3px] bg-zinc-200', l.key === 'editorial' && 'hidden')} />
                      ))}
                      {l.key === 'editorial' && Array.from({ length: 2 }).map((_, i) => <div key={i} className="rounded-sm bg-zinc-200" />)}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-zinc-900">{l.name}</div>
                      <div className="text-[10.5px] text-zinc-500 leading-tight">{l.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Inhalt */}
          <Card className="!p-3.5">
            <button className="w-full flex items-center justify-between cursor-pointer" onClick={() => setOpenSection(openSection === 'inhalt' ? 'texte' : 'inhalt')}>
              <SectionTitle>Inhalt · {flyer.included.length} Angebote</SectionTitle>
              <Icon name="chevD" size={14} className={cn('text-zinc-400 transition-transform', openSection !== 'inhalt' && '-rotate-90')} />
            </button>
            <div className={cn(openSection !== 'inhalt' && 'hidden')}>
              <div className="relative mb-2.5">
                <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen …" className={cn(inputCls, 'pl-8 h-8.5 text-xs')} />
              </div>
              <div className="max-h-[420px] overflow-y-auto -mx-1 px-1 space-y-2.5">
                {grouped.map(([cat, items]) => (
                  <div key={cat}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{cat}</div>
                    <div className="space-y-1">
                      {items.map((p) => {
                        const on = flyer.included.includes(p.id)
                        const isHero = flyer.heroId === p.id
                        const asset = state.assets.find((a) => a.productId === p.id)
                        const kiCheck = canGenerateImage(p)
                        const handleGenerateKi = async () => {
                          if (!kiCheck.allowed) return
                          const newAsset = await generateAsset(p)
                          dispatch({ type: 'asset/set', asset: newAsset })
                          notify(`KI-Bild für ${p.name} erzeugt.`)
                        }
                        const sourceLabel = asset?.source === 'ki' ? 'KI' : asset?.source === 'optimiert' ? 'OPT' : asset?.source === 'lieferant' ? 'LIEF' : null
                        return (
                          <div key={p.id} className={cn('flex items-center gap-2 rounded-lg border px-2 py-1.5', on ? 'border-accent-300 bg-accent-50/50' : 'border-zinc-150 border-zinc-200 bg-white')}>
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => dispatch({ type: 'flyer/toggleProduct', id: p.id })}
                              className="accent-accent-600 cursor-pointer shrink-0"
                              aria-label={`${p.name} im Flyer`}
                            />
                            <span className="text-sm">{p.emoji}</span>
                            <span className={cn('flex-1 text-[11.5px] font-medium truncate', on ? 'text-zinc-900' : 'text-zinc-500')}>{p.name}</span>
                            {sourceLabel && (
                              <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded shrink-0', asset?.source === 'ki' ? 'bg-violet-100 text-violet-700' : asset?.source === 'optimiert' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600')}>
                                {sourceLabel}
                              </span>
                            )}
                            {kiCheck.allowed && on && (
                              <button
                                title={kiCheck.allowed ? 'KI-Bild erzeugen' : kiCheck.reason}
                                onClick={handleGenerateKi}
                                className="shrink-0 text-[9px] font-semibold text-violet-500 hover:text-violet-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={!kiCheck.allowed}
                              >
                                KI
                              </button>
                            )}
                            {!kiCheck.allowed && on && (
                              <span className="text-[8px] text-zinc-400 shrink-0" title={kiCheck.reason}>✗ KI</span>
                            )}
                            <button
                              title={isHero ? 'Hero-Produkt' : 'Als Hero setzen'}
                              onClick={() => on && dispatch({ type: 'flyer/patch', patch: { heroId: p.id } })}
                              className={cn('shrink-0 cursor-pointer', isHero ? 'text-amber-500' : on ? 'text-zinc-300 hover:text-amber-500' : 'text-zinc-200')}
                            >
                              <Icon name="star" size={14} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Texte */}
          <Card className="!p-3.5">
            <button className="w-full flex items-center justify-between cursor-pointer" onClick={() => setOpenSection(openSection === 'texte' ? 'layout' : 'texte')}>
              <SectionTitle>Headline & Texte</SectionTitle>
              <Icon name="chevD" size={14} className={cn('text-zinc-400 transition-transform', openSection !== 'texte' && '-rotate-90')} />
            </button>
            <div className={cn('space-y-2.5', openSection !== 'texte' && 'hidden')}>
              <label className="block">
                <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Headline</span>
                <textarea
                  rows={2}
                  value={flyer.headline}
                  onChange={(e) => dispatch({ type: 'flyer/patch', patch: { headline: e.target.value } })}
                  className={cn(inputCls, 'h-auto py-2 resize-none')}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Subline / Gültigkeit</span>
                <textarea
                  rows={2}
                  value={flyer.subline}
                  onChange={(e) => dispatch({ type: 'flyer/patch', patch: { subline: e.target.value } })}
                  className={cn(inputCls, 'h-auto py-2 resize-none text-xs')}
                />
              </label>
            </div>
          </Card>
        </div>

        {/* Mitte: Live-Vorschau */}
        <div className="min-w-0">
          <div className="rounded-2xl bg-zinc-200/80 p-3 sm:p-5 flex justify-center">
            <div className={cn('w-full', view === 'mobile' ? 'max-w-[380px]' : 'max-w-[860px]')}>
              {view === 'mobile' ? (
                <div className="rounded-[2rem] border-8 border-zinc-900 shadow-pop overflow-hidden bg-white">
                  <div className="bg-zinc-900 h-5 flex items-center justify-center"><span className="size-1.5 rounded-full bg-zinc-700" /></div>
                  <FlyerPreview variant="mobile" />
                </div>
              ) : (
                <FlyerPreview variant="desktop" />
              )}
            </div>
          </div>
        </div>

        {/* Rechte Spalte: KI-Steuerung */}
        <div className="space-y-3 xl:sticky xl:top-24 lg:col-span-2 xl:col-span-1">
          <Card className="border-accent-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AiTag />
                <span className="text-[13px] font-bold text-zinc-900">Handzettel personalisieren</span>
              </div>
              <Toggle on={flyer.personalization} onChange={(v) => dispatch({ type: 'flyer/patch', patch: { personalization: v } })} />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
              Jeder Kunde sieht passendere Angebote statt denselben Flyer wie alle anderen. Segment wählen – die Vorschau wechselt sofort.
            </p>
            <div className={cn('grid grid-cols-2 gap-1.5', !flyer.personalization && 'opacity-40 pointer-events-none')}>
              {SEGMENTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSegment(s.key)}
                  title={s.desc}
                  className={cn(
                    'rounded-lg border px-2.5 py-2 text-left transition-colors cursor-pointer',
                    flyer.segment === s.key ? 'border-accent-500 bg-accent-50 ring-1 ring-accent-200' : 'border-zinc-200 hover:border-zinc-300 bg-white',
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon name={s.icon} size={13} className={flyer.segment === s.key ? 'text-accent-700' : 'text-zinc-400'} />
                    <span className={cn('text-[11.5px] font-semibold', flyer.segment === s.key ? 'text-accent-900' : 'text-zinc-700')}>{s.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>KI-Analyse des Entwurfs</SectionTitle>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
              {[
                { l: 'Ø KI-Score', v: String(includedScore) },
                { l: 'Ø Marge', v: marginAvg + ' %' },
                { l: 'Kategorien', v: `${catCoverage}/9` },
                { l: 'PAngV', v: pangv.kritisch === 0 ? 'konform' : `${pangv.kritisch} Fehler` },
              ].map((x) => (
                <div key={x.l}>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">{x.l}</div>
                  <div className={cn('text-lg font-bold tnum mt-0.5', x.v === 'konform' ? 'text-emerald-600' : x.v.includes('Fehler') ? 'text-red-600' : 'text-zinc-900')}>{x.v}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 mt-4 pt-3.5 border-t border-zinc-100">
              {suggestions.map((su, i) => (
                <div key={i} className={cn('rounded-lg border px-2.5 py-2 text-[11px] leading-snug', su.tone === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : su.tone === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-sky-50 border-sky-200 text-sky-900')}>
                  <div className="flex items-start gap-1.5">
                    <Icon name={su.icon} size={13} className="mt-px shrink-0" />
                    <span className="flex-1">{su.text}</span>
                  </div>
                  {su.action && (
                    <button onClick={su.action} className="mt-1.5 text-[10.5px] font-bold underline cursor-pointer">
                      {su.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>Rezept & Smart Bundle</SectionTitle>
            <label className="block mb-3">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Rezept der Woche</span>
              <select className={cn(inputCls, 'text-xs')} value={flyer.recipeId ?? ''} onChange={(e) => dispatch({ type: 'flyer/patch', patch: { recipeId: e.target.value || null } })}>
                <option value="">– kein Rezept –</option>
                {allRecipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} {r.ki ? '(KI-generiert)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold text-zinc-600 block mb-1">Smart Bundle</span>
              <select className={cn(inputCls, 'text-xs')} value={flyer.bundleId ?? ''} onChange={(e) => dispatch({ type: 'flyer/patch', patch: { bundleId: e.target.value || null } })}>
                <option value="">– kein Bundle –</option>
                {allBundles.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 mt-3.5">
              <Btn variant="soft" size="sm" className="flex-1" onClick={() => nav('/rezepte')}>
                <Icon name="plus" size={13} />
                KI-Rezept
              </Btn>
              <Btn variant="soft" size="sm" className="flex-1" onClick={() => nav('/bundles')}>
                <Icon name="plus" size={13} />
                KI-Bundle
              </Btn>
            </div>
          </Card>
        </div>
      </div>

      <DigitalFlyerModal open={digitalOpen} onClose={() => setDigitalOpen(false)} />
    </div>
  )
}
