import React, { useState } from 'react'
import { useApp } from '../state/AppState'
import { RECIPES } from '../data/mock'
import type { Recipe } from '../data/types'
import { AiTag, Badge, Btn, Card, Drawer, Modal, SectionHead, Spinner, cn, inputCls } from '../components/ui'
import { Icon } from '../lib/icons'
import { formatDE } from '../lib/utils'

const STYLES = [
  { key: 'mediterran', label: 'Mediterran', emoji: '🍝', title: 'Mediterrane Ofen-Pasta', ids: ['penne', 'zucchini', 'cherrytomaten', 'feta'], time: '30 Min.' },
  { key: 'asia', label: 'Asiatisch', emoji: '🍜', title: 'Asia-Gemüsepfanne mit Hähnchen', ids: ['haehnchen', 'zucchini', 'nuesse'], time: '25 Min.' },
  { key: 'deftig', label: 'Deftig', emoji: '🥘', title: 'Deftiger Bauern-Auflauf', ids: ['hack', 'kartoffel', 'gouda', 'schmand'], time: '45 Min.' },
  { key: 'leicht', label: 'Leicht & Protein', emoji: '🥣', title: 'Protein-Skyr-Bowl mit Apfel', ids: ['skyr', 'apfel', 'nuesse'], time: '10 Min.' },
]

export default function Rezepte() {
  const { state, dispatch, notify, allRecipes } = useApp()
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [genOpen, setGenOpen] = useState(false)
  const [style, setStyle] = useState('mediterran')
  const [generating, setGenerating] = useState(false)
  const [msg, setMsg] = useState('')

  const featured = allRecipes.find((r) => r.id === state.flyer.recipeId) ?? allRecipes[0]
  const drawerRecipe = allRecipes.find((r) => r.id === drawerId)

  const generate = () => {
    const s = STYLES.find((x) => x.key === style)!
    setGenerating(true)
    const stages = ['Analysiere KW-35-Sortiment …', 'Kombiniere Aktionsartikel nach Margen- und Saisonprofil …', 'Prüfe Zutatenverfügbarkeit und Grundpreise …']
    let i = 0
    setMsg(stages[0])
    const t = window.setInterval(() => {
      i++
      if (i >= stages.length) {
        window.clearInterval(t)
        const recipe: Recipe = {
          id: 'ki-' + Date.now(),
          title: s.title + ' (KW ' + state.campaignWeek + ')',
          desc: `KI-generiert aus den aktuellen Aktionsartikeln der KW ${state.campaignWeek} – Variante ${s.label}.`,
          time: s.time,
          difficulty: 'Einfach',
          servings: 4,
          emoji: s.emoji,
          ingredients: s.ids.map((id) => {
            const p = state.products.find((x) => x.id === id)
            return { productId: id, name: p?.name ?? id, amount: p?.unit ?? '1 Stück' }
          }),
          steps: ['Zutaten vorbereiten und schneiden.', 'Nach Anleitung garen bzw. kombinieren.', 'Abschmecken und gemeinsam servieren.'],
          tags: [s.label, 'KI-generiert'],
          segments: ['familien', 'singles'],
          ki: true,
        }
        dispatch({ type: 'recipe/add', recipe })
        dispatch({ type: 'flyer/patch', patch: { recipeId: recipe.id } })
        setGenerating(false)
        setGenOpen(false)
        setDrawerId(recipe.id)
        notify('KI-Rezept erstellt und direkt im Flyer platziert.')
      } else {
        setMsg(stages[i])
      }
    }, 700)
  }

  const RecipeCard = ({ r }: { r: Recipe }) => {
    const active = state.flyer.recipeId === r.id
    return (
      <Card pad={false} className={cn('overflow-hidden flex flex-col', active && 'ring-1 ring-accent-400')}>
        <div className="h-32 relative flex items-center justify-center bg-amber-50 overflow-hidden">
          {r.img ? <img src={r.img} alt={r.title} className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-5xl">{r.emoji}</span>}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {r.ki && <AiTag />}
            {active && <Badge tone="accent">Im Flyer</Badge>}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="text-[14px] font-bold text-zinc-900 leading-snug">{r.title}</div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {[r.time, r.difficulty, `${r.servings} Pers.`].map((m) => (
              <span key={m} className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">{m}</span>
            ))}
          </div>
          <div className="text-[11px] text-zinc-500 mt-2 line-clamp-2">{r.desc}</div>
          <div className="flex gap-2 mt-auto pt-3.5">
            <Btn size="sm" variant="secondary" className="flex-1" onClick={() => setDrawerId(r.id)}>Details</Btn>
            <Btn
              size="sm"
              className="flex-1"
              disabled={active}
              onClick={() => {
                dispatch({ type: 'flyer/patch', patch: { recipeId: r.id } })
                notify(`„${r.title}" als Rezept der Woche im Flyer gesetzt.`)
              }}
            >
              {active ? <Icon name="checkc" size={13} /> : <Icon name="plus" size={13} />}
              {active ? 'Aktiv' : 'Zum Flyer'}
            </Btn>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Rezepte</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Rezepte verkaufen Zutaten: Jede Zutat eines Rezepts ist direkt mit einem Angebot der Woche verknüpft</p>
        </div>
        <Btn onClick={() => setGenOpen(true)}>
          <Icon name="sparkle" size={15} />
          Rezept mit KI erstellen
        </Btn>
      </div>

      {/* Rezept der Woche */}
      {featured && (
        <Card pad={false} className="overflow-hidden">
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            <div className="relative min-h-64 bg-amber-50 flex items-center justify-center overflow-hidden">
              {featured.img ? <img src={featured.img} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-8xl">{featured.emoji}</span>}
              <span className="absolute top-3 left-3 bg-accent-700 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded">Rezept der Woche</span>
            </div>
            <div className="p-5 lg:p-6">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">{featured.title}</h2>
              <p className="text-[12.5px] text-zinc-500 mt-1 leading-relaxed">{featured.desc}</p>
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                {[featured.time, featured.difficulty, `${featured.servings} Personen`, ...(featured.kcal ? [featured.kcal] : [])].map((m) => (
                  <span key={m} className="text-[10.5px] font-semibold text-zinc-600 bg-zinc-100 rounded-full px-2.5 py-1">{m}</span>
                ))}
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Zutaten – verknüpft mit Angeboten</div>
                <div className="space-y-1.5">
                  {featured.ingredients.map((ing) => {
                    const p = ing.productId ? state.products.find((x) => x.id === ing.productId) : undefined
                    return (
                      <div key={ing.name} className="flex items-center gap-2.5 text-[12.5px]">
                        <span className="w-5 text-center">{p?.emoji ?? '🧂'}</span>
                        <span className="text-zinc-700 flex-1 truncate">{ing.name}</span>
                        <span className="text-zinc-400 tnum">{ing.amount}</span>
                        {p ? (
                          <span className="tnum font-bold text-red-600">{formatDE(p.promo)} €</span>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Vorratskammer</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
                <div className="text-[11px] text-zinc-500">
                  Warenkorb-Preis aller Aktions-Zutaten:{' '}
                  <span className="font-extrabold tnum text-zinc-900">
                    {formatDE(featured.ingredients.reduce((s, i) => s + (i.productId ? state.products.find((x) => x.id === i.productId)?.promo ?? 0 : 0), 0))} €
                  </span>
                </div>
                <Btn variant="secondary" size="sm" onClick={() => setDrawerId(featured.id)}>Zubereitung</Btn>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div>
        <SectionHead title="Alle Rezepte" sub={`${allRecipes.length} verfügbar · Zutaten jeweils mit KW-35-Angeboten verknüpft`} />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {allRecipes.map((r) => (
            <RecipeCard key={r.id} r={r} />
          ))}
        </div>
      </div>

      {/* Generator-Modal */}
      <Modal open={genOpen} onClose={() => !generating && setGenOpen(false)} title="Rezept mit KI erstellen" sub={`Die KI kombiniert Aktionsartikel der KW ${state.campaignWeek} zu einem verkaufsfördernden Rezept`}>
        <div className="p-6">
          {!generating ? (
            <>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Küchenstil</div>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStyle(s.key)}
                    className={cn(
                      'rounded-xl border p-3.5 text-left cursor-pointer transition-colors',
                      style === s.key ? 'border-accent-500 bg-accent-50 ring-1 ring-accent-200' : 'border-zinc-200 hover:border-zinc-300',
                    )}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <div className="text-[13px] font-semibold text-zinc-900 mt-1">{s.label}</div>
                    <div className="text-[10.5px] text-zinc-500 mt-0.5">z. B. {s.title}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-accent-50 border border-accent-200 px-3.5 py-2.5 text-[11.5px] text-accent-900 leading-relaxed">
                Vorauswahl für „{STYLES.find((s) => s.key === style)?.label}": {STYLES.find((s) => s.key === style)!.ids.map((id) => state.products.find((p) => p.id === id)?.name.split(',')[0]).join(', ')}
              </div>
              <Btn className="w-full mt-4" onClick={generate}>
                <Icon name="sparkle" size={15} />
                Rezept generieren
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

      {/* Detail-Drawer */}
      <Drawer open={!!drawerRecipe} onClose={() => setDrawerId(null)} title={drawerRecipe?.title ?? ''} width={480}>
        {drawerRecipe && (
          <div className="space-y-4">
            <div className="h-44 rounded-xl relative flex items-center justify-center bg-amber-50 overflow-hidden">
              {drawerRecipe.img ? <img src={drawerRecipe.img} className="absolute inset-0 w-full h-full object-cover" alt="" /> : <span className="text-7xl">{drawerRecipe.emoji}</span>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[drawerRecipe.time, drawerRecipe.difficulty, `${drawerRecipe.servings} Personen`, ...drawerRecipe.tags].map((m) => (
                <span key={m} className="text-[10.5px] font-semibold text-zinc-600 bg-zinc-100 rounded-full px-2.5 py-1">{m}</span>
              ))}
            </div>
            <p className="text-[12.5px] text-zinc-600 leading-relaxed">{drawerRecipe.desc}</p>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Zubereitung</div>
              <ol className="space-y-2.5">
                {drawerRecipe.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[13px]">
                    <span className="size-6 rounded-full bg-accent-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 tnum">{i + 1}</span>
                    <span className="text-zinc-700 leading-relaxed pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Btn
              className="w-full"
              disabled={state.flyer.recipeId === drawerRecipe.id}
              onClick={() => {
                dispatch({ type: 'flyer/patch', patch: { recipeId: drawerRecipe.id } })
                notify(`„${drawerRecipe.title}" im Flyer gesetzt.`)
              }}
            >
              <Icon name="flyer" size={15} />
              {state.flyer.recipeId === drawerRecipe.id ? 'Bereits Rezept der Woche' : 'Als Rezept der Woche setzen'}
            </Btn>
          </div>
        )}
      </Drawer>
    </div>
  )
}
