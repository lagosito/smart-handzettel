import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { INTEGRATIONS } from '../data/mock'
import { Badge, Btn, Card, Spinner, cn } from '../components/ui'
import { Icon } from '../lib/icons'
import { SectionHead } from '../components/ui'
import { useApp } from '../state/AppState'

export default function Integrationen() {
  const { notify } = useApp()
  const nav = useNavigate()
  const [syncs, setSyncs] = useState<Record<string, { status: string; lastSync: string | null; busy?: boolean }>>({})

  const get = (id: string, fallbackStatus: string, fallbackSync: string | null) => syncs[id] ?? { status: fallbackStatus, lastSync: fallbackSync }

  const sync = async (id: string) => {
    setSyncs((s) => ({ ...s, [id]: { ...get(id, INTEGRATIONS.find((i) => i.id === id)!.status, INTEGRATIONS.find((i) => i.id === id)!.lastSync), busy: true } }))
    await new Promise((r) => setTimeout(r, 1200))
    setSyncs((s) => ({ ...s, [id]: { status: 'verbunden', lastSync: '23.08.2026, ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) } }))
    notify(`„${INTEGRATIONS.find((i) => i.id === id)?.name}" synchronisiert.`)
  }

  const connect = async (id: string) => {
    setSyncs((s) => ({ ...s, [id]: { status: 'verbinde', lastSync: null, busy: true } as any }))
    await new Promise((r) => setTimeout(r, 1400))
    setSyncs((s) => ({ ...s, [id]: { status: 'verbunden', lastSync: '23.08.2026, ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) } }))
    notify(`„${INTEGRATIONS.find((i) => i.id === id)?.name}" verbunden.`)
  }

  const meta: Record<string, { tone: 'ok' | 'warn' | 'zinc'; label: string }> = {
    verbunden: { tone: 'ok', label: 'Verbunden' },
    fehler: { tone: 'warn', label: 'Aktion erforderlich' },
    getrennt: { tone: 'zinc', label: 'Nicht verbunden' },
    verbinde: { tone: 'warn', label: 'Verbinde …' },
  }

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Integrationen</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Datenquellen für den Handzettel-Workflow – verbinden, synchronisieren, vertrauen</p>
        </div>
        <Btn variant="secondary" onClick={() => nav('/handzettel/import')}>
          <Icon name="upload" size={15} />
          Zum Import-Assistenten
        </Btn>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {INTEGRATIONS.map((i) => {
          const cur = get(i.id, i.status, i.lastSync)
          const m = meta[cur.status] ?? meta.getrennt
          return (
            <Card key={i.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                  <Icon name={i.icon} size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14.5px] font-bold text-zinc-900">{i.name}</span>
                    <Badge tone={m.tone}>{m.label}</Badge>
                  </div>
                  <div className="text-[11.5px] text-zinc-500 mt-0.5">{i.desc}</div>
                </div>
              </div>
              <div className="mt-3.5 rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2.5 text-[11.5px] text-zinc-600">{cur.status === 'getrennt' ? 'Noch nicht konfiguriert – einmal einrichten, dann läuft der Import automatisch.' : i.detail}</div>
              <div className="flex items-center justify-between mt-3 text-[10.5px] text-zinc-400">
                <span>Letzte Synchronisation</span>
                <span className="tnum">{cur.lastSync ?? '–'}</span>
              </div>
              <div className="mt-auto pt-3.5">
                {cur.busy ? (
                  <Btn variant="secondary" size="sm" className="w-full" disabled>
                    <Spinner size={13} />
                    {cur.status === 'verbinde' ? 'Verbinde …' : 'Synchronisiere …'}
                  </Btn>
                ) : cur.status === 'verbunden' ? (
                  <Btn variant="secondary" size="sm" className="w-full" onClick={() => sync(i.id)}>
                    <Icon name="refresh" size={13} />
                    Jetzt synchronisieren
                  </Btn>
                ) : (
                  <Btn size="sm" className="w-full" onClick={() => connect(i.id)}>
                    <Icon name="plug" size={13} />
                    {cur.status === 'fehler' ? 'Zugang erneuern' : 'Verbinden'}
                  </Btn>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <SectionHead title="Datenfluss" sub="Vom Quellsystem bis zum veröffentlichten Handzettel" />
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {[
            ['Quellsysteme', 'db'],
            ['Import & Mapping', 'upload'],
            ['Validierung & PAngV', 'shield'],
            ['Smart Ranking', 'bars'],
            ['Handzettel', 'flyer'],
            ['Freigabe', 'checkc'],
            ['9 Kanäle', 'share'],
          ].map(([l, ic], idx, arr) => (
            <React.Fragment key={l}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="size-11 rounded-xl bg-accent-50 border border-accent-200 text-accent-700 flex items-center justify-center">
                  <Icon name={ic} size={18} />
                </div>
                <span className="text-[10.5px] font-semibold text-zinc-600 text-center whitespace-nowrap">{l}</span>
              </div>
              {idx < arr.length - 1 && <Icon name="chevR" size={15} className="text-zinc-300 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[11px] text-zinc-400 mt-2">Demo-Umgebung: Alle Integrationen arbeiten mit lokalen Beispieldaten. Sync- und Verbindungsaktionen sind simuliert, aber zustandsbehaftet.</p>
      </Card>
    </div>
  )
}
