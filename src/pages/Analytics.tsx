import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { ANALYTICS } from '../data/mock'
import { Badge, Card, DataTable, Donut, HBars, Kpi, LineChart, Progress, SectionHead } from '../components/ui'
import { Icon } from '../lib/icons'
import { formatDE, kfmt, pct } from '../lib/utils'

export default function Analytics() {
  const { state } = useApp()
  const A = ANALYTICS
  const prod = (id: string) => state.products.find((p) => p.id === id)

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Analytics</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Performance der digitalen Handzettel · letzte vollständige Woche (KW 34) · Region Nord</p>
        </div>
        <Badge tone="info">Datenstand: heute, 06:00 Uhr</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <Kpi label="Flyer-Öffnungen" value={kfmt(A.kpis.opens.value)} delta={A.kpis.opens.delta} sub="vs. Vorwoche" />
        <Kpi label="Produktklicks" value={kfmt(A.kpis.clicks.value)} delta={A.kpis.clicks.delta} sub="vs. Vorwoche" />
        <Kpi label="Conversion" value={pct(A.kpis.conversion.value)} delta={A.kpis.conversion.delta} sub="Klick → Kauf" />
        <Kpi label="Umsatz (attribuiert)" value="1,24 Mio. €" delta={A.kpis.revenue.delta} sub="12-Wochen-Hoch" />
        <Kpi label="Ø Warenkorb" value={formatDE(A.kpis.basket.value) + ' €'} delta={A.kpis.basket.delta} sub="dank Bundles" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <Card>
          <SectionHead title="Flyer-Öffnungen nach Wochentag" sub="Digital (App, Web, E-Mail) · in Tausend" right={<Badge tone="accent">Peak: Samstag</Badge>} />
          <LineChart labels={A.opensByDay.labels} series={[{ name: 'Öffnungen', color: '#1e6f4b', points: A.opensByDay.series }]} height={240} />
        </Card>
        <Card>
          <SectionHead title="Kanal-Performance" sub="Anteil der Öffnungen" />
          <Donut data={A.channelShare} centerValue={kfmt(A.kpis.opens.value)} centerLabel="Öffnungen gesamt" />
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <Card>
          <SectionHead title="Best-performing Offers" sub="Top-Angebote der KW 34 nach Klicks" right={<Link to="/ranking" className="text-xs font-semibold text-accent-700">Alle im Ranking</Link>} />
          <DataTable
            keyOf={(r) => r.id}
            columns={[
              { key: 'offer', title: 'Angebot' },
              { key: 'clicks', title: 'Klicks', align: 'right' },
              { key: 'ctr', title: 'CTR', align: 'right' },
              { key: 'revenue', title: 'Umsatz', align: 'right' },
              { key: 'tag', title: 'Signal', align: 'center' },
            ]}
            rows={A.topOffers.map((t) => {
              const p = prod(t.id)
              return {
                offer: (
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{p?.emoji}</span>
                    <span className="font-semibold text-zinc-900 text-[13px]">{p?.name ?? t.id}</span>
                  </div>
                ),
                clicks: <span className="tnum text-zinc-700">{kfmt(t.clicks)}</span>,
                ctr: <span className="tnum text-zinc-700">{pct(t.ctr)}</span>,
                revenue: <span className="tnum font-bold text-zinc-900">{formatDE(t.revenue)} Tsd. €</span>,
                tag: t.ctr > 7.5 ? <Badge tone="ok">Top</Badge> : <Badge tone="zinc">Stabil</Badge>,
              }
            })}
          />
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="size-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Icon name="chef" size={16} />
              </div>
              <div className="text-[14px] font-bold text-zinc-900">Rezept-Engagement</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Aufrufe</div>
                <div className="text-xl font-extrabold tnum">{kfmt(A.recipeEngagement.views)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">„Zutaten auf Liste“</div>
                <div className="text-xl font-extrabold tnum">{kfmt(A.recipeEngagement.addToList)}</div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] mt-3 mb-1"><span className="text-zinc-500">Übernahme-Rate</span><span className="tnum font-bold">{pct(A.recipeEngagement.rate)}</span></div>
            <Progress value={A.recipeEngagement.rate} />
            <div className="text-[11px] text-zinc-500 mt-3">Top-Rezept: <span className="font-semibold text-zinc-800">{A.recipeEngagement.top}</span></div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="size-9 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center">
                <Icon name="layers" size={16} />
              </div>
              <div className="text-[14px] font-bold text-zinc-900">Bundle-Engagement</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Bundle-Käufe</div>
                <div className="text-xl font-extrabold tnum">{kfmt(A.bundleEngagement.purchases)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Warenkorb-Uplift</div>
                <div className="text-xl font-extrabold tnum text-accent-700">+{A.bundleEngagement.uplift} %</div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] mt-3 mb-1"><span className="text-zinc-500">Ansicht → Kauf</span><span className="tnum font-bold">{pct(A.bundleEngagement.rate)}</span></div>
            <Progress value={A.bundleEngagement.rate * 2} />
            <div className="text-[11px] text-zinc-500 mt-3">Top-Bundle: <span className="font-semibold text-zinc-800">{A.bundleEngagement.top}</span></div>
          </Card>
        </div>
      </div>

      {/* Zukunftsfunktionen */}
      <div>
        <SectionHead title="Demnächst in Smart Handzettel" sub="Roadmap-Platzhalter – bereits heute konzeptioniert" />
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: 'compare', title: 'A/B-Testing', desc: 'Headlines, Hero-Produkte und Layouts automatisch gegeneinander testen – Gewinner-Variante übernimmt ab Wochenmitte.', eta: 'Q4 2026' },
            { icon: 'trend', title: 'Predictive Demand', desc: 'Nachfrageprognose je Artikel und Markt auf Basis von Wetter, Feiertagen und POS-Verläufen – direkt im Ranking.', eta: 'Q1 2027' },
            { icon: 'zap', title: 'Echtzeit-Margenoptimierung', desc: 'Aktionspreise dynamisch im zulässigen Korridor nachjustieren, basierend auf Abverkaufsgeschwindigkeit.', eta: 'Q2 2027' },
          ].map((f) => (
            <Card key={f.title} className="border-dashed !border-zinc-300 bg-zinc-50/60">
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center">
                  <Icon name={f.icon} size={16} />
                </div>
                <Badge tone="zinc"><Icon name="lock" size={10} /> {f.eta}</Badge>
              </div>
              <div className="text-[14px] font-bold text-zinc-800 mt-3">{f.title}</div>
              <p className="text-[11.5px] text-zinc-500 mt-1.5 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
