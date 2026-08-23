import React, { useMemo } from 'react'
import type { Product, Recipe, Bundle as BundleT, SegmentKey } from '../data/types'
import { SEGMENTS, CATEGORY_STYLE, bundleSingleSum } from '../data/mock'
import { scoreProduct } from '../lib/ai'
import { cn, discount, formatDE } from '../lib/utils'
import { useApp } from '../state/AppState'
import { QRCode } from './ui'

// ── Preis im Flyer-Stil (große Zahl + hochgestellte Cent) ───────
export function FlyerPrice({ value, className, size = 'md' }: { value: number; className?: string; size?: 'md' | 'lg' | 'xl' }) {
  const [int, dec] = formatDE(value, 2).split(',')
  const sizes = { md: 'text-[22px]', lg: 'text-[34px]', xl: 'text-[44px]' }[size]
  return (
    <span className={cn('font-extrabold tnum leading-none text-red-600 tracking-tight', sizes, className)}>
      {int}
      <span className="align-top text-[0.52em] font-extrabold">,{dec}</span>{' '}
      <span className="text-[0.52em] font-bold">€*</span>
    </span>
  )
}

function Starburst({ pct, size = 54 }: { pct: number; size?: number }) {
  const pts = useMemo(() => {
    const arr: string[] = []
    const N = 14
    for (let i = 0; i < N * 2; i++) {
      const ang = (Math.PI * i) / N - Math.PI / 2
      const r = i % 2 === 0 ? 30 : 23
      arr.push(`${(Math.cos(ang) * r).toFixed(1)},${(Math.sin(ang) * r).toFixed(1)}`)
    }
    return arr.join(' ')
  }, [])
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="-32 -32 64 64" width={size} height={size}>
        <polygon points={pts} fill="#fbbf24" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold text-zinc-900 tnum">−{pct}%</span>
    </div>
  )
}

function ProductVisual({ p, className, emojiSize = 44 }: { p: Product; className?: string; emojiSize?: number }) {
  const st = CATEGORY_STYLE[p.category]
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden', className)} style={{ background: st.soft }}>
      {p.img ? <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" /> : <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{p.emoji}</span>}
      {p.bio && (
        <span className="absolute top-1.5 left-1.5 text-[8.5px] font-bold tracking-wide bg-emerald-600 text-white rounded px-1 py-0.5">BIO</span>
      )}
    </div>
  )
}

function FlyerProductCard({ p, variant }: { p: Product; variant: 'desktop' | 'mobile' }) {
  const d = discount(p.price, p.promo)
  return (
    <div className={cn('relative rounded-lg border border-zinc-200 bg-white overflow-hidden flex flex-col hover:shadow-lg transition-shadow', variant === 'mobile' && 'text-sm')}>
      <ProductVisual p={p} className="aspect-[4/3]" emojiSize={variant === 'mobile' ? 34 : 42} />
      <div className="absolute top-1.5 right-1.5">
        <Starburst pct={d} size={variant === 'mobile' ? 42 : 50} />
      </div>
      <div className={cn('p-2.5 flex flex-col flex-1', variant === 'desktop' && 'sm:p-3')}>
        <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">{p.brand}</div>
        <div className={cn('font-semibold text-zinc-900 leading-tight line-clamp-2 min-h-[2.4em]', variant === 'mobile' ? 'text-[12px]' : 'text-[12.5px]')}>{p.name}</div>
        <div className="text-[10px] text-zinc-400 mt-0.5">{p.unit}</div>
        <div className="mt-auto pt-2 flex items-end justify-between gap-1">
          <div>
            <div className="text-[10.5px] text-zinc-400 line-through tnum">{formatDE(p.price)} €</div>
            <FlyerPrice value={p.promo} size={variant === 'mobile' ? 'md' : 'md'} />
          </div>
        </div>
        <div className="text-[9px] text-zinc-400 mt-1 tnum">
          Grundpreis {p.base}
          {p.deposit ? ` · zzgl. ${formatDE(p.deposit)} € Pfand` : ''}
        </div>
      </div>
    </div>
  )
}

export default function FlyerPreview({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { state, allRecipes, allBundles } = useApp()
  const { flyer } = state
  const segment: SegmentKey = flyer.segment
  const segDef = SEGMENTS.find((s) => s.key === segment)!

  const included = useMemo(
    () => state.products.filter((p) => flyer.included.includes(p.id)),
    [state.products, flyer.included],
  )

  const scored = useMemo(() => {
    const w = state.weights
    return included
      .map((p) => ({ p, s: scoreProduct(p, w).score, seg: flyer.personalization && p.segments.includes(segment) ? 1 : 0 }))
      .sort((a, b) => (flyer.personalization ? b.seg - a.seg || b.s - a.s : b.s - a.s))
  }, [included, state.weights, flyer.personalization, segment])

  const hero = useMemo(() => {
    const inListed = (id?: string) => included.find((p) => p.id === id)
    if (flyer.personalization) {
      for (const hid of segDef.hero) {
        const found = inListed(hid)
        if (found) return found
      }
    }
    return inListed(flyer.heroId) ?? scored[0]?.p
  }, [flyer.personalization, flyer.heroId, segDef, included, scored])

  const grid = scored.filter((x) => x.p.id !== hero?.id).map((x) => x.p)

  const recipe: Recipe | undefined = allRecipes.find((r) => r.id === flyer.recipeId)
  const bundle: BundleT | undefined = allBundles.find((b) => b.id === flyer.bundleId)
  const bundleSum = bundle ? bundleSingleSum(bundle) : 0

  const groups = useMemo(() => {
    const map = new Map<string, Product[]>()
    grid.forEach((p) => {
      const arr = map.get(p.category) ?? []
      arr.push(p)
      map.set(p.category, arr)
    })
    return [...map.entries()]
  }, [grid])

  const layout = flyer.layout
  const gridCols =
    variant === 'mobile'
      ? 'grid-cols-2 gap-2'
      : layout === 'kompakt'
        ? 'grid-cols-2 sm:grid-cols-4 gap-2.5'
        : layout === 'editorial'
          ? 'grid-cols-2 sm:grid-cols-3 gap-2.5'
          : 'grid-cols-2 sm:grid-cols-3 gap-2.5'

  return (
    <div className={cn('bg-white text-zinc-900 overflow-hidden', variant === 'desktop' ? 'rounded-xl shadow-pop ring-1 ring-zinc-900/10' : 'rounded-[2rem]')}>
      {/* Kopfzeile */}
      <div className="bg-accent-800 text-white">
        <div className={cn('flex items-center justify-between', variant === 'mobile' ? 'px-4 py-2.5' : 'px-6 py-3')}>
          <div className="flex items-center gap-2">
            <span className="size-6 rounded bg-white/15 flex items-center justify-center text-[11px] font-extrabold">FM</span>
            <div className="leading-none">
              <div className="font-extrabold tracking-tight text-[15px]">FrischeMarkt</div>
              <div className="text-[8.5px] uppercase tracking-[0.18em] text-accent-200">Frisch. Nah. Günstig.</div>
            </div>
          </div>
          <div className="text-right leading-none">
            <div className="text-[10px] font-semibold text-accent-200">KW {state.campaignWeek}</div>
            <div className={cn('font-bold tnum', variant === 'mobile' ? 'text-[10px]' : 'text-[11.5px]')}>24.08. – 29.08.26</div>
          </div>
        </div>
        {flyer.personalization && (
          <div className="bg-amber-400 text-zinc-900 text-center text-[10px] font-bold tracking-wide py-1 px-2">
            <span className="uppercase">Ihre Auswahl:</span> Angebote für {segDef.label} · persönlich kuratiert
          </div>
        )}
      </div>

      <div className={cn(variant === 'mobile' ? 'p-4 space-y-4' : 'p-5 sm:p-6 space-y-5')}>
        {/* Headline */}
        <div className={cn(layout === 'editorial' && 'text-center')}>
          <h1 className={cn('font-flyer font-bold uppercase text-zinc-900 leading-[0.95] tracking-tight whitespace-pre-line', variant === 'mobile' ? 'text-[34px]' : 'text-[44px] sm:text-[56px]')}>
            {flyer.headline}
          </h1>
          <p className={cn('text-zinc-500 mt-1.5', variant === 'mobile' ? 'text-[11px]' : 'text-[12.5px]')}>{flyer.subline}</p>
        </div>

        {/* Hero */}
        {hero && (
          <div className={cn('relative rounded-xl overflow-hidden border border-zinc-200 flex', variant === 'mobile' || layout === 'kompakt' ? 'flex-row' : 'flex-col sm:flex-row')}>
            <ProductVisual
              p={hero}
              className={cn(variant === 'mobile' ? 'w-[42%] min-h-36' : layout === 'kompakt' ? 'w-[40%] min-h-32' : 'sm:w-[46%] min-h-44 sm:min-h-56')}
              emojiSize={variant === 'mobile' ? 52 : 72}
            />
            <div className={cn('flex-1 p-4 flex flex-col justify-center', variant !== 'mobile' && 'sm:p-6')}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-red-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded">Preis-Hit der Woche</span>
                {flyer.personalization && <span className="bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Für {segDef.label}</span>}
              </div>
              <div className={cn('font-extrabold text-zinc-900 leading-tight mt-2', variant === 'mobile' ? 'text-lg' : 'text-2xl')}>{hero.name}</div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {hero.brand} · {hero.unit}
              </div>
              <div className="flex items-end gap-3 mt-3">
                <span className="text-sm text-zinc-400 line-through tnum">{formatDE(hero.price)} €</span>
                <FlyerPrice value={hero.promo} size={variant === 'mobile' ? 'lg' : 'xl'} />
                <Starburst pct={discount(hero.price, hero.promo)} size={variant === 'mobile' ? 46 : 56} />
              </div>
              <div className="text-[10px] text-zinc-400 mt-2 tnum">
                Grundpreis {hero.base}
                {hero.deposit ? ` · zzgl. ${formatDE(hero.deposit)} € Pfand` : ''} · Gültig {hero.period}
              </div>
            </div>
          </div>
        )}

        {/* Produktraster */}
        {layout === 'kompakt' || variant === 'mobile' ? (
          <div className={cn('grid', gridCols)}>
            {grid.slice(0, variant === 'mobile' ? 6 : 12).map((p) => (
              <FlyerProductCard key={p.id} p={p} variant={variant} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(([cat, items]) => (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-flyer text-lg font-semibold uppercase tracking-wide text-accent-800">{cat}</span>
                  <span className="flex-1 h-px bg-zinc-200" />
                </div>
                <div className={cn('grid', gridCols)}>
                  {items.map((p) => (
                    <FlyerProductCard key={p.id} p={p} variant={variant} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rezept */}
        {recipe && (
          <div className={cn('rounded-xl border border-zinc-200 overflow-hidden flex', variant === 'mobile' ? 'flex-col' : 'flex-row')}>
            <div className={cn('relative flex items-center justify-center bg-amber-50 overflow-hidden', variant === 'mobile' ? 'h-36' : 'w-[38%] min-h-40')}>
              {recipe.img ? <img src={recipe.img} alt={recipe.title} className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-5xl">{recipe.emoji}</span>}
              <span className="absolute top-2 left-2 bg-accent-700 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded">Rezept der Woche</span>
            </div>
            <div className={cn('flex-1', variant === 'mobile' ? 'p-3.5' : 'p-4 sm:p-5')}>
              <div className={cn('font-extrabold text-zinc-900', variant === 'mobile' ? 'text-base' : 'text-xl')}>{recipe.title}</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[recipe.time, recipe.difficulty, `${recipe.servings} Personen`].map((m) => (
                  <span key={m} className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 rounded-full px-2 py-0.5">{m}</span>
                ))}
              </div>
              <div className="mt-2.5 space-y-1">
                {recipe.ingredients
                  .filter((i) => i.productId)
                  .slice(0, variant === 'mobile' ? 3 : 4)
                  .map((i) => {
                    const prod = state.products.find((x) => x.id === i.productId)
                    if (!prod) return null
                    return (
                      <div key={i.name} className="flex items-center gap-2 text-[11px]">
                        <span>{prod.emoji}</span>
                        <span className="text-zinc-600 flex-1">{i.name}</span>
                        <span className="font-bold tnum text-red-600">{formatDE(prod.promo)} €</span>
                      </div>
                    )
                  })}
              </div>
              <div className="mt-3 text-[11px] font-bold text-accent-700 uppercase tracking-wide">Alle Zutaten im Markt erhältlich →</div>
            </div>
          </div>
        )}

        {/* Bundle */}
        {bundle && (
          <div className="rounded-xl bg-zinc-900 text-white overflow-hidden">
            <div className={cn('flex items-center gap-3', variant === 'mobile' ? 'px-3.5 pt-3.5' : 'px-5 pt-4')}>
              <span className="bg-amber-400 text-zinc-900 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded">Smart Bundle</span>
              {bundle.badge && <span className="text-[10px] text-zinc-400">{bundle.badge}</span>}
            </div>
            <div className={cn(variant === 'mobile' ? 'p-3.5' : 'p-5', 'flex flex-col sm:flex-row sm:items-center gap-4')}>
              <div className="flex-1">
                <div className={cn('font-extrabold leading-tight', variant === 'mobile' ? 'text-base' : 'text-xl')}>{bundle.title}</div>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {bundle.productIds.map((id, i) => {
                    const prod = state.products.find((x) => x.id === id)
                    if (!prod) return null
                    return (
                      <React.Fragment key={id}>
                        {i > 0 && <span className="text-zinc-500 font-bold">+</span>}
                        <span className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1 text-[11px]">
                          <span>{prod.emoji}</span>
                          <span className="text-zinc-200 hidden sm:inline">{prod.name.split(',')[0]}</span>
                        </span>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
              <div className="shrink-0 sm:text-right">
                <div className="text-[11px] text-zinc-400 line-through tnum">einzeln {formatDE(bundleSum)} €</div>
                <div className={cn('font-extrabold tnum text-amber-400', variant === 'mobile' ? 'text-3xl' : 'text-4xl')}>{formatDE(bundle.bundlePrice)} €</div>
                <div className="text-[10px] font-bold text-accent-300 uppercase tracking-wide">Sie sparen {formatDE(bundleSum - bundle.bundlePrice)} €</div>
              </div>
            </div>
          </div>
        )}

        {/* Fußzeile */}
        <div className="rounded-xl bg-accent-950 text-white flex items-center gap-4 p-4">
          <QRCode value={`frischemarkt.de/kw35/${segment}`} size={variant === 'mobile' ? 56 : 72} className="rounded-md shrink-0" />
          <div className="min-w-0">
            <div className={cn('font-extrabold leading-tight', variant === 'mobile' ? 'text-[13px]' : 'text-[15px]')}>Alle Angebote auch online & in der App</div>
            <div className="text-[10.5px] text-accent-300 mt-0.5">Jetzt scannen · persönliche Angebote sichern · Merkliste anlegen</div>
            <div className="text-[8.5px] text-zinc-500 mt-2 leading-snug">
              *Alle Preise inkl. gesetzlicher MwSt., zzgl. Pfand. Grundpreise gemäß § 2 PAngV. Angebote gültig {flyer.subline.includes('24.08.') ? '24.08.–29.08.2026' : 'KW ' + state.campaignWeek}, nur solange der Vorrat reicht.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
