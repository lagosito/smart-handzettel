import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { FACTORS, scoreOne, scoreProducts } from '../lib/ai'
import type { Category, Product, Region } from '../data/types'
import { Badge, Btn, Card, Drawer, Progress, ScoreRing, SectionHead, cn, inputCls } from '../components/ui'
import { Icon } from '../lib/icons'
import { CATEGORY_STYLE } from '../data/mock'
import { discount, eur, formatDE, kfmt } from '../lib/utils'

type SortKey = 'score' | 'margin' | 'velocity' | 'discount'

export default function Ranking() {
  const { state, dispatch, notify } = useApp()
  const nav = useNavigate()
  const [sort, setSort] = useState<SortKey>('score')
  const [cat, setCat] = useState<'alle' | Category>('alle')
  const [region, setRegion] = useState<'alle' | Region>('alle')
  const [q, setQ] = useState('')
  const [quick, setQuick] = useState<Product | null>(null)

  const ranked = useMemo(() => {
    let list = state.products.map((p) => ({ p, r: scoreOne(p, state.products, state.weights) }))
    if (cat !== 'alle') list = list.filter((x) => x.p.category === cat)
    if (region !== 'alle') list = list.filter((x) => x.p.region === region || x.p.region === 'Bundesweit')
    if (q.trim()) {
      const t = q.toLowerCase()
      list = list.filter((x) => x.p.name.toLowerCase().includes(t) || x.p.brand.toLowerCase().includes(t))
    }
    switch (sort) {
      case 'margin':
        return list.sort((a, b) => b.p.margin - a.p.margin)
      case 'velocity':
        return list.sort((a, b) => b.p.velocity - a.p.velocity)
      case 'discount':
        return list.sort((a, b) => discount(b.p.price, b.p.promo) - discount(a.p.price, a.p.promo))
      default:
        return list.sort((a, b) => b.r.score - a.r.score)
    }
  }, [state.products, state.weights, sort, cat, region, q])

  const cats = useMemo(() => [...new Set(state.products.map((p) => p.category))], [state.products])
  const avg = Math.round(ranked.reduce((s, x) => s + x.r.score, 0) / (ranked.length || 1))
  const topN = ranked.filter((x) => x.r.score >= 88).length
  const take = ranked.slice(0, 9)

  const confirm = () => {
    dispatch({ type: 'ranking/confirm', ids: take.map((x) => x.p.id) })
    notify(`${take.length} Top-Produkte als Flyer-Auswahl übernommen.`)
    nav('/handzettel/builder')
  }

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Smart Ranking</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            Schritt 2 von 5 · Die KI priorisiert alle {state.products.length} Artikel – mit erklärbarem Score statt Blackbox
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge tone="accent">Ø Score {avg}</Badge>
          <Badge tone="ok">{topN} Top-Kandidaten (≥ 88)</Badge>
          {state.rankingConfirmed && <Badge tone="ok">Auswahl bestätigt</Badge>}
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
        {/* Gewichtung */}
        <Card className="lg:sticky lg:top-24">
          <SectionHead
            title="KI-Gewichtung"
            sub="Welche Faktoren sollen stärker zählen? Das Ranking aktualisiert sich live."
            right={
              <button className="text-[11px] font-semibold text-accent-700 hover:underline cursor-pointer" onClick={() => dispatch({ type: 'weights/reset' })}>
                Reset
              </button>
            }
          />
          <div className="space-y-4">
            {FACTORS.map((f) => (
              <div key={f.key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800">{f.label}</span>
                  <span className="tnum font-bold text-accent-700">{state.weights[f.key]} %</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={state.weights[f.key]}
                  onChange={(e) => dispatch({ type: 'weights/set', key: f.key, value: Number(e.target.value) })}
                  className="w-full accent-accent-600 cursor-pointer"
                />
                <div className="text-[10px] text-zinc-400">{f.desc}</div>
              </div>
            ))}
          </div>
          {state.importSt.status !== 'done' && (
            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-[11px] text-amber-800 leading-relaxed">
              Hinweis: Für den Workflow-Schritt 1 steht der <button className="font-bold underline cursor-pointer" onClick={() => nav('/handzettel/import')}>Import</button> noch aus.
            </div>
          )}
        </Card>

        {/* Liste */}
        <div className="space-y-3 min-w-0">
          <Card className="!p-3 flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-44">
              <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Produkt oder Marke suchen …" className={cn(inputCls, 'pl-9')} />
            </div>
            <select className={cn(inputCls, 'w-auto')} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="score">Höchster KI-Score</option>
              <option value="margin">Höchste Marge</option>
              <option value="velocity">Höchster Abverkauf</option>
              <option value="discount">Höchster Rabatt</option>
            </select>
            <select className={cn(inputCls, 'w-auto')} value={cat} onChange={(e) => setCat(e.target.value as any)}>
              <option value="alle">Alle Kategorien</option>
              {cats.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className={cn(inputCls, 'w-auto')} value={region} onChange={(e) => setRegion(e.target.value as any)}>
              <option value="alle">Alle Regionen</option>
              {(['Nord', 'Süd', 'West', 'Ost'] as Region[]).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Card>

          <div className="space-y-2">
            {ranked.map(({ p, r }, i) => {
              const st = CATEGORY_STYLE[p.category]
              const inTop = take.some((x) => x.p.id === p.id)
              return (
                <Card key={p.id} className={cn('!p-3.5 flex items-center gap-4 hover:border-accent-300 transition-colors', inTop && 'ring-1 ring-accent-200')}>
                  <div className={cn('text-center w-7 shrink-0', i < 3 ? 'text-accent-700' : 'text-zinc-400')}>
                    <div className="text-lg font-extrabold tnum">{i + 1}</div>
                    {i < 3 && sort === 'score' && <Icon name="star" size={12} className="mx-auto" />}
                  </div>
                  <div className="size-13 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden" style={{ background: st.soft }}>
                    {p.img ? <img src={p.img} alt="" className="w-full h-full object-cover" /> : p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/produkte/${p.id}`} className="text-[13.5px] font-semibold text-zinc-900 hover:text-accent-700 hover:underline underline-offset-2 truncate">
                        {p.name}
                      </Link>
                      {inTop && <Badge tone="accent" className="!px-1.5">im Flyer</Badge>}
                      {p.stock < 180 && <Badge tone="warn" className="!px-1.5">Bestand knapp</Badge>}
                      {p.bio && <Badge tone="ok" className="!px-1.5">BIO</Badge>}
                    </div>
                    <div className="text-[11px] text-zinc-400">{p.brand} · {p.category} · {p.region}</div>
                    <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
                      <Icon name="sparkle" size={11} className="text-accent-600 shrink-0" />
                      <span className="truncate">{r.explanation}</span>
                    </div>
                  </div>
                  <div className="hidden md:block text-right shrink-0 w-16">
                    <div className="text-[14px] font-bold tnum text-red-600">{formatDE(p.promo)} €</div>
                    <div className="text-[10.5px] text-zinc-400 line-through tnum">{formatDE(p.price)} €</div>
                  </div>
                  <div className="hidden lg:block w-16 shrink-0 text-center">
                    <div className="text-[12.5px] font-bold tnum text-zinc-800">{p.margin} %</div>
                    <div className="text-[10px] text-zinc-400">Marge</div>
                  </div>
                  <div className="hidden lg:block w-20 shrink-0 text-center">
                    <div className="text-[12.5px] font-bold tnum text-zinc-800">{kfmt(p.velocity)}</div>
                    <div className="text-[10px] text-zinc-400">Abverk./Wo.</div>
                  </div>
                  <div className="hidden xl:block w-24 shrink-0">
                    <Progress value={Math.min(100, (p.stock / 1600) * 100)} tone={p.stock < 180 ? 'amber' : 'accent'} />
                    <div className="text-[10px] text-zinc-400 mt-1 text-center tnum">{p.stock} St.</div>
                  </div>
                  <div className="w-px self-stretch bg-zinc-100 hidden md:block" />
                  <ScoreRing score={r.score} size={46} />
                  <button
                    onClick={() => setQuick(p)}
                    className="size-8.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-accent-700 hover:border-accent-300 flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="Schnellansicht"
                  >
                    <Icon name="eye" size={15} />
                  </button>
                </Card>
              )
            })}
          </div>

          {/* Bestätigungsleiste */}
          <div className="sticky bottom-4 z-10">
            <div className="rounded-2xl bg-zinc-900 text-white shadow-pop px-5 py-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-56">
                <div className="text-[14px] font-bold">Top {take.length} der aktuellen Ansicht als Flyer-Auswahl übernehmen?</div>
                <div className="text-[11.5px] text-zinc-400 mt-0.5">Ø Score der Auswahl: {Math.round(take.reduce((s, x) => s + x.r.score, 0) / (take.length || 1))}/100 · anpassbar über Filter & Gewichtung</div>
              </div>
              <Btn variant="ghost" className="!text-zinc-300 hover:!bg-white/10" onClick={() => nav('/produkte')}>Alle Produkte</Btn>
              <Btn onClick={confirm} className="!bg-white !text-zinc-900 !border-white hover:!bg-zinc-100">
                <Icon name="check" size={15} />
                Auswahl übernehmen & zum Builder
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Schnellansicht */}
      <Drawer open={!!quick} onClose={() => setQuick(null)} title={quick ? `Schnellansicht: ${quick.name}` : ''}>
        {quick &&
          (() => {
            const r = scoreOne(quick, state.products, state.weights)
            const st = CATEGORY_STYLE[quick.category]
            return (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="size-20 rounded-2xl flex items-center justify-center text-4xl overflow-hidden" style={{ background: st.soft }}>
                    {quick.img ? <img src={quick.img} className="w-full h-full object-cover" alt="" /> : quick.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900">{quick.name}</div>
                    <div className="text-xs text-zinc-500">{quick.brand} · {quick.unit}</div>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-xl font-extrabold tnum text-red-600">{formatDE(quick.promo)} €</span>
                      <span className="text-xs text-zinc-400 line-through tnum mb-0.5">{formatDE(quick.price)} €</span>
                      <Badge tone="accent">−{discount(quick.price, quick.promo)} %</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ScoreRing score={r.score} size={38} />
                    <div className="text-xs font-semibold text-zinc-700">KI-Score {r.score}/100</div>
                  </div>
                  <div className="space-y-2">
                    {r.contributions.map((c) => (
                      <div key={c.key}>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-zinc-600">{c.label}</span>
                          <span className="tnum font-semibold text-zinc-800">{Math.round(c.pct)} %</span>
                        </div>
                        <Progress value={c.pct} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-lg bg-accent-50 border border-accent-200 px-3 py-2.5 text-[11.5px] text-accent-900 leading-relaxed">
                    <span className="font-bold">Warum dieser Score?</span> {r.explanation}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Btn className="flex-1" onClick={() => nav(`/produkte/${quick.id}`)}>
                    Produktdetail öffnen
                    <Icon name="arrowR" size={14} />
                  </Btn>
                </div>
              </div>
            )
          })()}
      </Drawer>
    </div>
  )
}
