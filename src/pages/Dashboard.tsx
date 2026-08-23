import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp, stepStates, STEP_META, CAMPAIGN_LABEL } from '../state/AppState'
import { DASH_KPIS, RETAILER, TREND_EVENTS } from '../data/mock'
import { scoreProduct } from '../lib/ai'
import { Badge, Btn, Card, SectionHead, Kpi, ScoreRing, cn } from '../components/ui'
import { Icon } from '../lib/icons'
import { formatDE } from '../lib/utils'

const NEXT_STEP_COPY: { title: string; desc: string; cta: string }[] = [
  { title: 'Aktionsdaten für KW ${state.campaignWeek} importieren', desc: 'Artikel, Preise und Bestände aus Excel, Sheets oder SAP übernehmen und validieren.', cta: 'Daten importieren' },
  { title: 'KI-Ranking prüfen & bestätigen', desc: 'Die KI hat alle Artikel bewertet. Gewichtung anpassen und Top-Auswahl übernehmen.', cta: 'Ranking öffnen' },
  { title: 'Handzettel im Builder finalisieren', desc: 'Layout, Hero-Produkt, Rezept & Bundle prüfen – inklusive Segment-Personalisierung.', cta: 'Zum Flyer Builder' },
  { title: 'Kampagne KW ${state.campaignWeek} freigeben', desc: 'Checkliste bestätigen: Produkte, Preise, PAngV, Bilder, Rezepte und Bundles.', cta: 'Zur Freigabe' },
  { title: 'Kampagne veröffentlichen', desc: 'Ein Klick: Print-PDF, Web, App, E-Mail, Push, Social, OOH, DooH & In-Store.', cta: 'Zum Export' },
]

export default function Dashboard() {
  const { state, allRecipes } = useApp()
  const nav = useNavigate()
  const steps = stepStates(state)
  const camp = CAMPAIGN_LABEL[state.campaignStatus]
  const nextIdx = steps.findIndex((s) => s !== 'done')
  const next = NEXT_STEP_COPY[nextIdx === -1 ? 4 : nextIdx]

  const top = [...state.products]
    .map((p) => ({ p, r: scoreProduct(p, state.weights) }))
    .sort((a, b) => b.r.score - a.r.score)
    .slice(0, 4)

  const doneCount = steps.filter((s) => s === 'done').length

  return (
    <div className="space-y-5 anim-in">
      {/* Kopf */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Guten Tag, {RETAILER.user.name.split(' ')[0]}</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Sonntag, 23. August 2026 · {RETAILER.region}</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={() => nav('/handzettel/import')}>
            <Icon name="upload" size={15} />
            Daten importieren
          </Btn>
          <Btn size="md" onClick={() => nav('/handzettel')}>
            <Icon name="zap" size={15} />
            Handzettel erstellen
          </Btn>
        </div>
      </div>

      {/* KPI-Raster */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {DASH_KPIS.map((k) => (
          <Kpi key={k.id} label={k.label} value={k.value} sub={k.sub} delta={k.delta} points={k.points} />
        ))}
      </div>

      {/* Kampagnen-Hero */}
      <div className="rounded-2xl bg-accent-950 text-white overflow-hidden">
        <div className="p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-64">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-300">Aktuelle Wochenkampagne</span>
              <Badge tone={camp.tone}>{camp.label}</Badge>
              <span className="text-[11px] text-zinc-400">{doneCount}/5 Schritte abgeschlossen</span>
            </div>
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold tracking-tight">Handzettel KW ${state.campaignWeek}</span>
              <span className="text-sm text-zinc-400 tnum">{RETAILER.campaign.periodLong}</span>
            </div>
            <p className="text-[13px] text-zinc-400 mt-2 max-w-xl leading-relaxed">
              {state.flyer.included.length} Angebote kuratiert · Rezept & Smart Bundle aktiv · Personalisierung für 6 Segmente –
              PAngV-Prüfung ohne Befund.
            </p>
            <div className="flex gap-2.5 mt-4 flex-wrap">
              <Btn variant="soft" className="!bg-white !text-accent-900 !border-white hover:!bg-accent-50" onClick={() => nav('/handzettel')}>
                <Icon name="zap" size={15} />
                Handzettel erstellen
              </Btn>
              <Btn variant="ghost" className="!text-zinc-300 hover:!bg-white/10 hover:!text-white" onClick={() => nav('/handzettel/import')}>
                <Icon name="upload" size={15} />
                Daten importieren
              </Btn>
            </div>
          </div>
          <div className="lg:w-[420px] shrink-0">
            <div className="grid grid-cols-5 gap-1.5">
              {STEP_META.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => nav(s.to)}
                  className={cn(
                    'rounded-xl border p-2.5 text-left transition-colors cursor-pointer',
                    steps[i] === 'done'
                      ? 'bg-accent-800/60 border-accent-700'
                      : steps[i] === 'active'
                        ? 'bg-white/5 border-accent-400/50'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/10',
                  )}
                >
                  <Icon
                    name={steps[i] === 'done' ? 'checkc' : s.icon}
                    size={15}
                    className={steps[i] === 'done' ? 'text-accent-300' : steps[i] === 'locked' ? 'text-zinc-500' : 'text-amber-300'}
                  />
                  <div className="text-[10px] font-semibold mt-1.5 leading-tight">{i + 1} {s.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drei Spalten */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Nächster Schritt */}
        <Card className="flex flex-col">
          <SectionHead title="Nächster Schritt" sub="Was passiert gerade – und was ist zu tun?" />
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 flex items-center justify-center shrink-0">
                <Icon name={nextIdx === -1 ? 'checkc' : STEP_META[Math.max(0, nextIdx)].icon} size={18} />
              </div>
              <div>
                <div className="text-[14.5px] font-semibold text-zinc-900 leading-snug">{next.title}</div>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{next.desc}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <Btn className="w-full" onClick={() => nav(nextIdx === -1 ? '/analytics' : STEP_META[nextIdx].to)}>
              {nextIdx === -1 ? 'Performance ansehen' : next.cta}
              <Icon name="arrowR" size={15} />
            </Btn>
          </div>
        </Card>

        {/* KI Top-Angebote */}
        <Card>
          <SectionHead
            title="KI-Top-Angebote der Woche"
            sub="Warum diese Artikel? Score-Erklärung inklusive"
            right={
              <Link to="/ranking" className="text-xs font-semibold text-accent-700 hover:text-accent-800 inline-flex items-center gap-1">
                Alle <Icon name="chevR" size={13} />
              </Link>
            }
          />
          <div className="space-y-2.5">
            {top.map(({ p, r }) => (
              <Link key={p.id} to={`/produkte/${p.id}`} className="flex items-center gap-3 rounded-lg border border-zinc-100 hover:border-accent-200 hover:bg-accent-50/40 px-2.5 py-2 transition-colors">
                <span className="text-xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900 truncate">{p.name}</div>
                  <div className="text-[10.5px] text-zinc-500 truncate">{r.explanation}</div>
                </div>
                <div className="text-right mr-1">
                  <div className="text-[13px] font-bold tnum text-red-600">{formatDE(p.promo)} €</div>
                  <div className="text-[10px] text-zinc-400 line-through tnum">{formatDE(p.price)} €</div>
                </div>
                <ScoreRing score={r.score} size={40} />
              </Link>
            ))}
          </div>
        </Card>

        {/* Trend-Signale */}
        <Card>
          <SectionHead
            title="Trend-Signale für KW ${state.campaignWeek}"
            sub="Wetter, Events & Nachfragespitzen"
            right={
              <Link to="/trends" className="text-xs font-semibold text-accent-700 hover:text-accent-800 inline-flex items-center gap-1">
                Trend Engine <Icon name="chevR" size={13} />
              </Link>
            }
          />
          <div className="space-y-2.5">
            {TREND_EVENTS.map((e) => (
              <div key={e.title} className="flex items-start gap-3 rounded-lg border border-zinc-100 px-3 py-2.5">
                <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', e.level === 'hoch' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500')}>
                  <Icon name={e.icon} size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-zinc-900">{e.title}</div>
                  <div className="text-[11px] text-zinc-500">{e.span}</div>
                  <div className="text-[11px] font-semibold text-accent-700 mt-0.5">{e.impact}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-accent-50 border border-accent-200 px-3 py-2.5 text-[11.5px] text-accent-900 leading-relaxed">
            <span className="font-bold">KI-Empfehlung:</span> Wasser & Eis bereits auf Seite 1 platziert – passt zur prognostizierten Hitzewelle ab Dienstag.
          </div>
        </Card>
      </div>

      {/* Transformation */}
      <Card>
        <SectionHead title="Vom manuellen Prozess zur Automatisierung" sub="Was Smart Handzettel für Ihr Team verändert" />
        <div className="grid md:grid-cols-[1fr_auto_1fr] items-stretch gap-4">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Heute: manuell</div>
            {['Agentur-Abstimmung per E-Mail', '4–6 Tage bis zur Druckfreigabe', 'Derselbe Flyer für alle Kunden', 'Fehleranfällige Preisprüfung per Hand'].map((x) => (
              <div key={x} className="flex items-center gap-2 text-[12.5px] text-zinc-600 py-1.5">
                <Icon name="xc" size={13} className="text-red-400 shrink-0" />
                {x}
              </div>
            ))}
          </div>
          <div className="flex md:flex-col items-center justify-center gap-1 text-accent-600">
            <div className="h-px w-10 md:w-px md:h-full bg-accent-200" />
            <Icon name="arrowR" size={18} className="rotate-90 md:rotate-0" />
          </div>
          <div className="rounded-xl border border-accent-200 bg-accent-50 p-4">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-accent-700 mb-3">Smart Handzettel</div>
            {['Automatisierte Produktion aus Sortimentsdaten', 'Freigabe in Minuten, nicht Tagen', 'Personalisierte Angebote für 6 Segmente', 'PAngV-Prüfung automatisch – 100 % nachvollziehbar'].map((x) => (
              <div key={x} className="flex items-center gap-2 text-[12.5px] text-accent-900 py-1.5">
                <Icon name="checkc" size={13} className="text-accent-600 shrink-0" />
                {x}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
