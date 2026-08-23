import React, { useState } from 'react'
import { useApp } from '../state/AppState'
import { SEGMENTS, bundleSingleSum } from '../data/mock'
import type { Bundle } from '../data/types'
import { AiTag, Badge, Btn, Card, Modal, Progress, SectionHead, Spinner, cn } from '../components/ui'
import { Icon } from '../lib/icons'
import { discount, formatDE, pct } from '../lib/utils'

const GOALS = [
  { key: 'grill', label: 'Grillabend', emoji: '🔥', ids: ['filet', 'baguette', 'bbq', 'pils'], title: 'Grill-Spezial: Filet & Pils' },
  { key: 'fruehstueck', label: 'Familienfrühstück', emoji: '🥐', ids: ['croissant', 'osaft', 'schoko', 'milch'], title: 'Sonntags-Frühstück Plus' },
  { key: 'snack', label: 'Snack-Abend', emoji: '🍿', ids: ['chips', 'cola', 'eis', 'schoko'], title: 'Couch-Klassiker' },
  { key: 'protein', label: 'Protein & Fitness', emoji: '💪', ids: ['skyr', 'haehnchen', 'nuesse', 'banane'], title: 'Protein-Kick' },
]

export default function Bundles() {
  const { state, dispatch, notify, allBundles } = useApp()
  const [genOpen, setGenOpen] = useState(false)
  const [goal, setGoal] = useState('grill')
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState('')

  const generate = () => {
    const g = GOALS.find((x) => x.key === goal)!
    setGenerating(true)
    const stages = ['Analysiere Kaufverhaltens-Korrelationen …', 'Optimiere Bundle-Preis (Marge vs. Attraktivität) …', 'Prüfe Lagerbestände & PAngV …']
    let i = 0
    setMsg(stages[0])
    const t = window.setInterval(() => {
      i++
      if (i >= stages.length) {
        window.clearInterval(t)
        const sum = g.ids.reduce((s, id) => s + (state.products.find((p) => p.id === id)?.promo ?? 0), 0)
        const bundle: Bundle = {
          id: 'ki-b-' + Date.now(),
          title: g.title,
          desc: `KI-generiert aus den Kaufkorrelationen der Region Nord – Ziel: ${g.label}.`,
          productIds: g.ids,
          bundlePrice: Math.floor(sum * 0.88 * 100) / 100,
          basketEffect: 8 + Math.round(Math.random() * 12),
          segments: goal === 'grill' ? ['grill'] : goal === 'protein' ? ['singles'] : ['familien'],
          badge: 'Neu · KI-generiert',
          ki: true,
        }
        dispatch({ type: 'bundle/add', bundle })
        dispatch({ type: 'flyer/patch', patch: { bundleId: bundle.id } })
        setGenerating(false)
        setGenOpen(false)
        notify('KI-Bundle erstellt und im Flyer platziert.')
      } else {
        setMsg(stages[i])
      }
    }, 700)
  }

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Smart Bundles</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Bundles erhöhen den Warenkorb: 3–5 komplementäre Angebote zu einem Preis, der sich lohnt</p>
        </div>
        <Btn onClick={() => setGenOpen(true)}>
          <Icon name="sparkle" size={15} />
          Bundle mit KI erstellen
        </Btn>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {allBundles.map((b) => {
          const sum = bundleSingleSum(b)
          const act = state.flyer.bundleId === b.id
          const segs = SEGMENTS.filter((s) => b.segments.includes(s.key))
          return (
            <Card key={b.id} className={cn('flex flex-col', act && 'ring-1 ring-accent-400')}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15.5px] font-bold text-zinc-900">{b.title}</span>
                    {b.ki && <AiTag />}
                    {act && <Badge tone="accent">Im Flyer</Badge>}
                  </div>
                  <p className="text-[11.5px] text-zinc-500 mt-0.5">{b.desc}</p>
                </div>
                {b.badge && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5 whitespace-nowrap">{b.badge}</span>}
              </div>

              <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100">
                {b.productIds.map((id) => {
                  const p = state.products.find((x) => x.id === id)
                  if (!p) return null
                  return (
                    <div key={id} className="flex items-center gap-2.5 px-3 py-2 text-[12.5px]">
                      <span className="text-base">{p.emoji}</span>
                      <span className="flex-1 text-zinc-700 truncate">{p.name}</span>
                      <span className="text-[10.5px] text-zinc-400">{p.unit}</span>
                      <span className="tnum font-bold text-red-600">{formatDE(p.promo)} €</span>
                    </div>
                  )
                })}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3.5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Einzelsumme</div>
                  <div className="tnum font-bold text-zinc-500 line-through mt-0.5">{formatDE(sum)} €</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Bundle-Preis</div>
                  <div className="tnum font-extrabold text-accent-700 text-lg leading-6">{formatDE(b.bundlePrice)} €</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Kundenvorteil</div>
                  <div className="tnum font-bold text-emerald-600 mt-0.5">−{formatDE(sum - b.bundlePrice)} €</div>
                </div>
              </div>

              <div className="mt-3.5">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-zinc-500">Erwarteter Warenkorb-Effekt</span>
                  <span className="tnum font-bold text-zinc-900">+{b.basketEffect} %</span>
                </div>
                <Progress value={b.basketEffect * 4} />
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-3.5 border-t border-zinc-100">
                <div className="flex gap-1 flex-wrap">
                  {segs.map((s) => (
                    <span key={s.key} className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">{s.label}</span>
                  ))}
                </div>
                <Btn
                  size="sm"
                  variant={act ? 'secondary' : 'primary'}
                  disabled={act}
                  onClick={() => {
                    dispatch({ type: 'flyer/patch', patch: { bundleId: b.id } })
                    notify(`„${b.title}" im Flyer platziert.`)
                  }}
                >
                  {act ? <Icon name="checkc" size={13} /> : <Icon name="plus" size={13} />}
                  {act ? 'Aktiv' : 'Zum Flyer'}
                </Btn>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="border-accent-200 bg-accent-50/40">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="flex items-center gap-2">
              <Icon name="sparkle" size={16} className="text-accent-700" />
              <span className="text-[14px] font-bold text-zinc-900">Wie die KI Bundles zusammenstellt</span>
            </div>
            <p className="text-[12px] text-zinc-600 mt-1 leading-relaxed">
              Kaufkorrelationen aus Kassendaten + Komplementarität (Essen, Trinken, Beilage) + Margenfenster. Der Bundle-Preis liegt typischerweise 8–15 % unter der Einzelsumme – hoch genug für Marge, niedrig genug für „das nehme ich mit".
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ['+21 %', 'Warenkorb Grill-Bundle'],
              ['68 %', 'Cross-Selling-Quote'],
              ['4,7 Tsd.', 'Bundle-Käufe KW 34'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-lg font-extrabold tnum text-accent-800">{v}</div>
                <div className="text-[10px] text-zinc-500 leading-tight">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Modal open={genOpen} onClose={() => !generating && setGenOpen(false)} title="Bundle mit KI erstellen" sub="Ziel wählen – die KI optimiert Zusammensetzung und Preis">
        <div className="p-6">
          {!generating ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className={cn('rounded-xl border p-3.5 text-left cursor-pointer transition-colors', goal === g.key ? 'border-accent-500 bg-accent-50 ring-1 ring-accent-200' : 'border-zinc-200 hover:border-zinc-300')}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <div className="text-[13px] font-semibold text-zinc-900 mt-1">{g.label}</div>
                    <div className="text-[10.5px] text-zinc-500 mt-0.5">{g.ids.length} Produkte · Vorschlag „{g.title}"</div>
                  </button>
                ))}
              </div>
              <Btn className="w-full mt-4" onClick={generate}>
                <Icon name="sparkle" size={15} />
                Bundle generieren
              </Btn>
            </>
          ) : (
            <div className="py-10 text-center">
              <Spinner size={28} className="mx-auto text-accent-600" />
              <div className="text-sm font-bold text-zinc-900 mt-4">KI arbeitet …</div>
              <div className="text-xs text-zinc-500 mt-1.5">{msg}</div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
