import React, { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/AppState'
import { BUNDLES, SEGMENTS, bundleSingleSum, recipeById } from '../data/mock'
import { scoreProduct } from '../lib/ai'
import { cn, formatDE } from '../lib/utils'
import { Btn, Modal } from './ui'
import { Icon } from '../lib/icons'
import FlyerPreview from './FlyerPreview'

interface Msg {
  id: number
  role: 'user' | 'ai'
  text: string
  productIds?: string[]
  recipeId?: string
  bundleId?: string
}

const QUICK = ['Was kann ich heute für 4 Personen kochen?', 'Etwas Vegetarisches für heute Abend?', 'Was bekomme ich für unter 20 €?', 'Was steht am Wochenende auf dem Grill?']

let seq = 1

export default function Assistant({ compact }: { compact?: boolean }) {
  const { state } = useApp()
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 0,
      role: 'ai',
      text: 'Guten Tag! Ich bin Ihr Einkaufsassistent für den Handzettel der KW ${state.campaignWeek}. Ich kenne alle aktuellen Angebote, Rezepte und Bundles – wie kann ich helfen?',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  const answer = (q: string): Msg => {
    const t = q.toLowerCase()
    const seg = SEGMENTS.find((s) => s.key === state.flyer.segment)!
    const ranked = [...state.products]
      .map((p) => ({ p, s: scoreProduct(p, state.weights).score }))
      .sort((a, b) => b.s - a.s)

    if (/vegetar|veggie|fleischlos|vegan/.test(t)) {
      return {
        id: seq++,
        role: 'ai',
        text: 'Gern! Das vegetarische Ofengemüse mit Hirtenkäse nutzt drei Aktionsartikel der Woche – Kartoffeln, Zucchini und Cherrytomaten. Alle Zutaten zusammen kosten unter 6 €.',
        recipeId: 'ofengemuese',
        productIds: ['kartoffel', 'zucchini', 'feta'],
      }
    }
    if (/grill|bbq|wochenende|wurst|steak/.test(t)) {
      return {
        id: seq++,
        role: 'ai',
        text: 'Für den Grillabend empfehle ich das Smart Bundle „Grillabend für 4 Personen“ – abgestimmt auf die Hitzewelle ab Dienstag. Dazu passen die marinierten Hähnchen-Spieße.',
        bundleId: 'grill-bundle',
        recipeId: 'spiesse',
        productIds: ['grillwurst', 'filet', 'pils'],
      }
    }
    if (/unter 20|20 €|budget|günstig|sparen|billig|preis/.test(t)) {
      const budget = ['eisberg', 'toast', 'kartoffel', 'pizza', 'wasser', 'chips']
      const sum = budget.reduce((s, id) => s + (state.products.find((p) => p.id === id)?.promo ?? 0), 0)
      return {
        id: seq++,
        role: 'ai',
        text: `Mit diesen sechs Aktionsartikeln decken Sie die Mahlzeiten für zwei Personen für zwei Tage ab – zusammen nur ${formatDE(sum)} €. Das spart ${formatDE(
          budget.reduce((s, id) => {
            const p = state.products.find((x) => x.id === id)
            return p ? s + (p.price - p.promo) : s
          }, 0),
        )} € gegenüber dem Normalpreis.`,
        productIds: budget,
      }
    }
    if (/rezept|kochen|personen|essen|heute|abend|mittag/.test(t)) {
      const recipeId = state.flyer.recipeId ?? 'pasta'
      const r = recipeById(recipeId)
      return {
        id: seq++,
        role: 'ai',
        text: `Mit den aktuellen Angeboten empfehle ich Ihnen ${
          r ? `„${r.title}“ – ${r.time}, für ${r.servings} Personen` : 'ein mediterranes Gericht'
        }. Die Zutaten sind diese Woche im Angebot und stammen teils aus dem Sortiment für ${seg.label}. Soll ich alles auf Ihre Merkliste setzen?`,
        recipeId,
        productIds: (r?.ingredients ?? []).filter((i) => i.productId).map((i) => i.productId!) as string[],
      }
    }
    if (/hallo|guten tag|moin|hi$/.test(t)) {
      return { id: seq++, role: 'ai', text: `Moin! In KW ${state.campaignWeek} gibt es ${state.products.length} Top-Angebote – gefiltert für ${seg.label}. Fragen Sie mich gern nach Rezepten, Budgets oder dem Grillwetter.` }
    }
    return {
      id: seq++,
      role: 'ai',
      text: `Dazu habe ich passende Angebote gefunden: Unsere drei stärksten Aktionen der Woche – jeweils mit sehr gutem KI-Ranking in der Region Nord.`,
      productIds: ranked.slice(0, 3).map((x) => x.p.id),
    }
  }

  const send = (text: string) => {
    const q = text.trim()
    if (!q || typing) return
    setMsgs((m) => [...m, { id: seq++, role: 'user', text: q }])
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      setMsgs((m) => [...m, answer(q)])
      setTyping(false)
    }, 900)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
        <div className="size-9 rounded-full bg-accent-600 text-white flex items-center justify-center">
          <Icon name="sparkle" size={16} />
        </div>
        <div>
          <div className="text-[13px] font-bold text-zinc-900">Einkaufsassistent</div>
          <div className="text-[10.5px] text-zinc-500 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 pulse-dot" />
            Online · kennt KW-35-Angebote
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 min-h-0" style={{ maxHeight: compact ? 320 : undefined }}>
        {msgs.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[88%]', m.role === 'user' ? 'order-1' : '')}>
              <div
                className={cn(
                  'rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed',
                  m.role === 'user' ? 'bg-accent-600 text-white rounded-br-md' : 'bg-zinc-100 text-zinc-800 rounded-bl-md',
                )}
              >
                {m.text}
              </div>
              {m.productIds && (
                <div className="mt-1.5 space-y-1">
                  {m.productIds.slice(0, 6).map((id) => {
                    const p = state.products.find((x) => x.id === id)
                    if (!p) return null
                    return (
                      <div key={id} className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[11px] shadow-sm">
                        <span>{p.emoji}</span>
                        <span className="flex-1 text-zinc-700 font-medium truncate">{p.name}</span>
                        <span className="tnum font-bold text-red-600">{formatDE(p.promo)} €</span>
                        <span className="text-[9px] font-bold text-accent-700 bg-accent-50 rounded px-1 py-0.5">+ Liste</span>
                      </div>
                    )
                  })}
                </div>
              )}
              {m.recipeId &&
                (() => {
                  const r = recipeById(m.recipeId)
                  return r ? (
                    <div className="mt-1.5 bg-accent-50 border border-accent-200 rounded-lg px-2.5 py-2 text-[11px]">
                      <div className="font-bold text-accent-900 flex items-center gap-1"><Icon name="chef" size={12} /> {r.title}</div>
                      <div className="text-accent-700 mt-0.5">{r.time} · {r.difficulty} · {r.servings} Pers.</div>
                    </div>
                  ) : null
                })()}
              {m.bundleId &&
                (() => {
                  const bb = m.bundleId ? state.customBundles.find((x) => x.id === m.bundleId) ?? BUNDLES.find((x) => x.id === m.bundleId) : undefined
                  return bb ? (
                    <div className="mt-1.5 bg-zinc-900 text-white rounded-lg px-2.5 py-2 text-[11px]">
                      <div className="font-bold">{bb.title}</div>
                      <div className="mt-0.5 text-zinc-300">
                        {bb.productIds.length} Produkte · <span className="text-amber-400 font-bold">{formatDE(bb.bundlePrice)} €</span>{' '}
                        <span className="line-through text-zinc-500">{formatDE(bundleSingleSum(bb))} €</span>
                      </div>
                    </div>
                  ) : null
                })()}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex">
            <div className="bg-zinc-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[12px] text-zinc-500 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-zinc-400 pulse-dot" />
              <span className="size-1.5 rounded-full bg-zinc-400 pulse-dot" style={{ animationDelay: '0.3s' }} />
              <span className="size-1.5 rounded-full bg-zinc-400 pulse-dot" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="pt-2.5 border-t border-zinc-100">
        <div className="flex gap-1.5 flex-wrap mb-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-[10.5px] font-medium text-zinc-600 bg-zinc-100 hover:bg-accent-50 hover:text-accent-800 border border-zinc-200 hover:border-accent-200 rounded-full px-2.5 py-1 cursor-pointer transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Frage zu Angeboten, Rezepten, Budget …"
            className="flex-1 h-9.5 px-3 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600/25 focus:border-accent-600"
          />
          <Btn onClick={() => send(input)} disabled={!input.trim()}>
            <Icon name="send" size={15} />
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ── Digitaler Handzettel: Flyer (mobil) + Assistent ─────────────
export function DigitalFlyerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} full title="Digitaler Handzettel – Kundenansicht" sub="So erleben Kundinnen und Kunden den personalisierten Handzettel in App & Web">
      <div className="grid lg:grid-cols-[1fr_380px] gap-0 h-full">
        <div className="bg-zinc-100 p-6 overflow-y-auto flex justify-center">
          <div className="w-[370px] shrink-0">
            <div className="rounded-[2rem] border-8 border-zinc-900 shadow-pop overflow-hidden bg-white">
              <div className="bg-zinc-900 h-6 flex items-center justify-center">
                <span className="size-1.5 rounded-full bg-zinc-700" />
              </div>
              <FlyerPreview variant="mobile" />
            </div>
          </div>
        </div>
        <div className="border-t lg:border-t-0 lg:border-l border-zinc-200 p-5 bg-white lg:h-full flex flex-col min-h-[480px]">
          <Assistant />
        </div>
      </div>
    </Modal>
  )
}
