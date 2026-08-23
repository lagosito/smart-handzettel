import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { EMERGING, REGIONAL, SEASONAL, TREND_EVENTS, TREND_SOURCES } from '../data/mock'
import { Badge, Btn, Card, HBars, LineChart, SectionHead, Sparkline, cn } from '../components/ui'
import { Icon } from '../lib/icons'

export default function Trends() {
  const { notify, dispatch } = useApp()
  const nav = useNavigate()

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Trend Engine</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Nachfragesignale, bevor sie im Regal fehlen – vier Datenquellen, ein verwertbarer Stand</p>
        </div>
        <Badge tone="ok">Alle Quellen synchron · Stand: 23.08.2026, 06:00</Badge>
      </div>

      {/* Quellen */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {TREND_SOURCES.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="size-9 rounded-lg bg-accent-50 border border-accent-200 text-accent-700 flex items-center justify-center">
                <Icon name={s.icon} size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-zinc-900 truncate">{s.name}</div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 pulse-dot" />
                  Live
                </div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 leading-snug mb-2.5">{s.desc}</div>
            <Sparkline points={s.points} width={200} height={34} className="w-full" />
          </Card>
        ))}
      </div>

      {/* Events / Wetter */}
      <div className="grid md:grid-cols-3 gap-3">
        {TREND_EVENTS.map((e) => (
          <div key={e.title} className={cn('rounded-xl border p-4 flex gap-3', e.level === 'hoch' ? 'bg-amber-50 border-amber-300' : 'bg-white border-zinc-200')}>
            <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', e.level === 'hoch' ? 'bg-amber-200/70 text-amber-800' : 'bg-zinc-100 text-zinc-500')}>
              <Icon name={e.icon} size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-bold text-zinc-900">{e.title}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{e.span}</div>
              <div className="text-[11.5px] font-bold text-accent-700 mt-1">{e.impact}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Saisonale Nachfrage */}
        <Card>
          <SectionHead title="Saisonale Nachfrage" sub="Nachfrage-Index der letzten und nächsten Kalenderwochen · Region Nord" right={<Badge tone="accent">KW 35 markiert</Badge>} />
          <LineChart labels={SEASONAL.labels} series={SEASONAL.series} height={230} />
          <div className="mt-3 rounded-lg bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 text-[11.5px] text-zinc-600 leading-relaxed">
            <span className="font-bold text-zinc-900">Lesart der KI:</span> Die Grill-Saison läuft aus – letztes Hoch in KW 35 nutzen (Hitzewelle), ab KW 36 auf Backwaren & Obst priorisieren.
          </div>
        </Card>

        {/* Aufsteigende Zutaten */}
        <Card>
          <SectionHead title="Aufsteigende Zutaten & Themen" sub="Stärkste Signale der letzten 4 Wochen" />
          <div className="space-y-2.5">
            {EMERGING.map((e) => (
              <div key={e.name} className="flex items-center gap-3 rounded-lg border border-zinc-100 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-zinc-900">{e.name}</span>
                    <Badge tone="ok" dot={false}>+{e.delta} %</Badge>
                    <span className="text-[10px] text-zinc-400">{e.src}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{e.note}</div>
                </div>
                <Btn
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    dispatch({ type: 'trend/boost', id: e.name })
                    notify(`„${e.name}" für die KW-36-Planung vorgemerkt.`, 'info')
                  }}
                >
                  <Icon name="plus" size={13} />
                  Vormerken
                </Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Regional */}
      <Card>
        <SectionHead title="Regionale Präferenzen" sub="Wo wächst welche Ware – abgeleitet aus POS-Daten & Suchsignalen" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {REGIONAL.map((r) => (
            <div key={r.region} className="rounded-xl border border-zinc-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Icon name="pin" size={14} />
                  <span className="text-[12px] font-bold uppercase tracking-wide">{r.region}</span>
                </div>
                <Badge tone="accent" dot={false}>+{r.delta} %</Badge>
              </div>
              <div className="text-[13.5px] font-bold text-zinc-900 mt-2">{r.top}</div>
              <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">{r.signal}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-accent-200 bg-accent-50/40">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="flex items-center gap-2">
              <Icon name="sparkle" size={16} className="text-accent-700" />
              <span className="text-[14px] font-bold text-zinc-900">Diese Signale sind bereits im Smart Ranking verrechnet</span>
            </div>
            <p className="text-[12px] text-zinc-600 mt-1 leading-relaxed">
              Die Faktoren „Nachfrage" und „Saison" im Ranking speisen sich automatisch aus der Trend Engine. Anpassen können Sie die Gewichtung jederzeit im Ranking.
            </p>
          </div>
          <Btn onClick={() => nav('/ranking')}>
            <Icon name="bars" size={15} />
            Ranking öffnen
          </Btn>
        </div>
      </Card>
    </div>
  )
}
