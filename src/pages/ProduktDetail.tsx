import React, { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { pangvCheck, placementFor, scoreProduct } from '../lib/ai'
import { Badge, Btn, Card, HBars, Progress, ScoreRing, SectionHead, Sparkline, cn } from '../components/ui'
import { Icon } from '../lib/icons'
import { CATEGORY_STYLE } from '../data/mock'
import { discount, formatDE, hashStr, kfmt, mulberry32 } from '../lib/utils'

export default function ProduktDetail() {
  const { id } = useParams()
  const { state, dispatch, notify } = useApp()
  const nav = useNavigate()
  const p = state.products.find((x) => x.id === id)

  const regionPerf = useMemo(() => {
    if (!p) return []
    const rnd = mulberry32(hashStr(p.id))
    return (['Nord', 'Süd', 'West', 'Ost'] as const).map((r) => ({
      label: r,
      value: Math.round(Math.max(8, Math.min(100, p.regionality * (r === p.region ? 1.15 : 0.55) + rnd() * 30))),
      hint: r === p.region ? 'Herkunftsregion' : undefined,
    })).sort((a, b) => b.value - a.value)
  }, [p])

  const velHistory = useMemo(() => {
    if (!p) return []
    const rnd = mulberry32(hashStr(p.id + 'v'))
    return Array.from({ length: 8 }, () => Math.round(p.velocity * (0.72 + rnd() * 0.55)))
  }, [p])

  if (!p) {
    return (
      <Card className="text-center py-16">
        <div className="text-sm text-zinc-500">Produkt nicht gefunden.</div>
        <Btn variant="secondary" className="mt-4" onClick={() => nav('/produkte')}>Zurück zur Liste</Btn>
      </Card>
    )
  }

  const pv = pangvCheck(p)
  const r = scoreProduct(p, state.weights)
  const st = CATEGORY_STYLE[p.category]
  const inFlyer = state.flyer.included.includes(p.id)
  const danger = pv.status === 'kritisch'

  return (
    <div className="space-y-5 anim-in max-w-6xl">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link to="/produkte" className="hover:text-accent-700 font-medium">Produkte</Link>
        <Icon name="chevR" size={12} />
        <span className="text-zinc-600 font-medium">{p.name}</span>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-4 items-start">
        {/* Produktkarte */}
        <Card pad={false}>
          <div className="h-56 flex items-center justify-center relative overflow-hidden rounded-t-xl" style={{ background: st.soft }}>
            {p.img ? <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-7xl">{p.emoji}</span>}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {p.bio && <Badge tone="ok">BIO</Badge>}
              {p.stock < 180 && <Badge tone="warn">Bestand knapp</Badge>}
            </div>
            {inFlyer && <Badge tone="accent" className="absolute top-3 right-3">Im Flyer</Badge>}
          </div>
          <div className="p-5">
            <div className="text-[10.5px] uppercase tracking-wider font-bold text-zinc-400">{p.brand}</div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 mt-0.5">{p.name}</h1>
            <div className="text-xs text-zinc-500 mt-1">{p.category} · {p.unit} · EAN <span className="tnum">{p.ean}</span></div>
            <div className="text-[11px] text-zinc-400 mt-0.5 tnum">Aktionszeitraum: {p.period} · Region: {p.region}</div>

            <div className="mt-4 rounded-xl border border-zinc-200 divide-y divide-zinc-100 text-[13px]">
              <div className="flex justify-between px-3.5 py-2.5"><span className="text-zinc-500">Normalpreis</span><span className="tnum line-through text-zinc-400">{formatDE(p.price)} €</span></div>
              <div className="flex justify-between px-3.5 py-2.5 bg-red-50/50"><span className="text-zinc-700 font-semibold">Aktionspreis</span><span className="tnum font-extrabold text-red-600 text-base">{formatDE(p.promo)} €</span></div>
              <div className="flex justify-between px-3.5 py-2.5"><span className="text-zinc-500">Kunden-Ersparnis</span><Badge tone="accent" dot={false}>−{discount(p.price, p.promo)} % · {formatDE(p.price - p.promo)} €</Badge></div>
              <div className="flex justify-between px-3.5 py-2.5"><span className="text-zinc-500">Grundpreis</span><span className="tnum text-zinc-700">{p.base}</span></div>
              <div className="flex justify-between px-3.5 py-2.5"><span className="text-zinc-500">Pfand</span><span className="tnum text-zinc-700">{p.deposit != null ? `zzgl. ${formatDE(p.deposit)} €` : '–'}</span></div>
              <div className="flex justify-between px-3.5 py-2.5"><span className="text-zinc-500">UVP</span><span className="tnum text-zinc-700">{p.uvp != null ? formatDE(p.uvp) + ' €' : '–'}</span></div>
            </div>

            <Btn
              className="w-full mt-4"
              variant={inFlyer ? 'secondary' : 'primary'}
              onClick={() => {
                dispatch({ type: 'flyer/toggleProduct', id: p.id })
                notify(inFlyer ? `${p.name} aus dem Flyer entfernt.` : `${p.name} zum Flyer hinzugefügt.`, 'info')
              }}
            >
              <Icon name={inFlyer ? 'minus' : 'plus'} size={15} />
              {inFlyer ? 'Aus Flyer entfernen' : 'Zum Flyer hinzufügen'}
            </Btn>
          </div>
        </Card>

        {/* Rechte Spalte */}
        <div className="space-y-4 min-w-0">
          {/* Kommerzielle Daten */}
          <Card>
            <SectionHead title="Kommerzielle Daten" sub="Handelszahlen der aktuellen Planung · Region Nord" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-400">Marge</div>
                <div className="text-2xl font-bold tnum text-zinc-900 mt-1">{p.margin} %</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Ø Kategorie: 29 %</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-400">Abverkauf</div>
                <div className="text-2xl font-bold tnum text-zinc-900 mt-1">{kfmt(p.velocity)}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Einheiten / Woche</div>
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-400">Lagerbestand</span>
                  <span className={cn('text-[11px] font-semibold', p.stock < 180 ? 'text-amber-600' : 'text-emerald-600')}>{p.stock} Stück</span>
                </div>
                <Progress value={Math.min(100, (p.stock / 1600) * 100)} tone={p.stock < 180 ? 'amber' : 'accent'} className="mt-2.5" />
                <div className="text-[11px] text-zinc-400 mt-1.5">
                  {p.stock < 180 ? 'Warnung: Bestand reicht voraussichtlich nur für 2–3 Aktionstage.' : `Reicht für ca. ${Math.ceil(p.stock / (p.velocity / 6))} Aktionstage.`}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 mt-5 pt-5 border-t border-zinc-100">
              <div>
                <div className="text-xs font-semibold text-zinc-700 mb-2">Abverkauf der letzten 8 Wochen</div>
                <div className="flex items-end gap-2">
                  <Sparkline points={velHistory} width={170} height={52} />
                  <div className="text-[11px] text-zinc-400 leading-snug">
                    Trend: <span className="font-bold text-emerald-600">steigend</span>
                    <br />unterstützt durch Hitzewelle KW ${state.campaignWeek}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-700 mb-2">Regionale Performance (Index)</div>
                <HBars rows={regionPerf} format={(v) => String(v)} />
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* PAngV */}
            <Card>
              <SectionHead
                title="PAngV-Check"
                sub="Preisangabenverordnung §§ 1–3"
                right={<Badge tone={danger ? 'err' : pv.status === 'warnung' ? 'warn' : 'ok'}>{danger ? 'Fehler' : pv.status === 'warnung' ? 'Warnung' : 'Konform'}</Badge>}
              />
              <div className="space-y-2">
                {pv.items.map((i) => (
                  <div key={i.label} className="flex items-start gap-2.5 text-[12px]">
                    <Icon
                      name={i.level === 'ok' ? 'checkc' : i.level === 'warnung' ? 'alert' : 'xc'}
                      size={15}
                      className={cn('mt-px shrink-0', i.level === 'ok' ? 'text-emerald-600' : i.level === 'warnung' ? 'text-amber-500' : 'text-red-500')}
                    />
                    <div>
                      <span className="font-semibold text-zinc-800">{i.label}</span>
                      <div className="text-zinc-500 leading-snug">{i.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* KI-Empfehlung */}
            <Card className="border-accent-200 bg-accent-50/40">
              <SectionHead title="KI-Empfehlung" sub="Warum gehört dieser Artikel in welche Position?" />
              <div className="flex items-center gap-3.5">
                <ScoreRing score={r.score} size={62} />
                <div>
                  <div className="text-lg font-bold text-zinc-900 tnum">{r.score} / 100</div>
                  <div className="text-[11.5px] text-zinc-500">{placementFor(r.score)}</div>
                </div>
              </div>
              <p className="text-[12.5px] text-zinc-700 leading-relaxed mt-3.5">{r.explanation}</p>
              <div className="space-y-1.5 mt-3.5">
                {r.contributions.slice(0, 3).map((c) => (
                  <div key={c.key}>
                    <div className="flex justify-between text-[10.5px] mb-0.5">
                      <span className="text-zinc-500">{c.label}</span>
                      <span className="tnum font-semibold text-zinc-800">{Math.round(c.pct)} %</span>
                    </div>
                    <Progress value={c.pct} className="!h-1.5" />
                  </div>
                ))}
              </div>
              {r.score >= 85 && (
                <div className="mt-3.5 rounded-lg bg-white border border-accent-200 px-3 py-2 text-[11.5px] text-accent-900">
                  <span className="font-bold">Empfehlung:</span> Auf Seite 1 platzieren – prognostizierter Mehrumsatz +{formatDE(p.velocity * (p.price - p.promo) * 0.4)} € in KW ${state.campaignWeek}.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
