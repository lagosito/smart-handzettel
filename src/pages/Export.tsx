import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp, CAMPAIGN_LABEL } from '../state/AppState'
import { CHANNELS } from '../data/mock'
import type { Channel, ChannelStatus } from '../data/types'
import { Badge, Btn, Card, SectionHead, Spinner, cn } from '../components/ui'
import { Icon } from '../lib/icons'
import { DigitalFlyerModal } from '../components/Assistant'

const STATUS_META: Record<ChannelStatus, { label: string; tone: 'ok' | 'warn' | 'err' | 'info' | 'zinc' }> = {
  bereit: { label: 'Bereit', tone: 'info' },
  veroeffentlicht: { label: 'Veröffentlicht', tone: 'ok' },
  aktualisierung: { label: 'Aktualisierung nötig', tone: 'warn' },
  fehler: { label: 'Fehler', tone: 'err' },
  gesperrt: { label: 'Wartet auf Freigabe', tone: 'zinc' },
}

// Kleine Kanal-Vorschau (Mock)
function ChannelPreview({ channel }: { channel: Channel }) {
  const base = 'rounded-lg border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white h-24 relative overflow-hidden'
  switch (channel.id) {
    case 'print':
      return (
        <div className={base}>
          <div className="absolute inset-3 bg-white border border-zinc-200 rounded-sm shadow-sm p-2">
            <div className="h-1.5 w-2/3 bg-accent-600 rounded-full mb-1.5" />
            <div className="h-1 w-1/2 bg-zinc-200 rounded-full mb-2" />
            <div className="grid grid-cols-3 gap-1">
              <div className="h-4 bg-amber-200 rounded-sm" />
              <div className="h-4 bg-red-100 rounded-sm" />
              <div className="h-4 bg-emerald-100 rounded-sm" />
            </div>
            <div className="h-2.5 w-1/3 bg-red-500 rounded-sm mt-1.5" />
          </div>
        </div>
      )
    case 'web':
      return (
        <div className={base}>
          <div className="h-4 bg-zinc-200 rounded-t-lg flex items-center gap-1 px-2">
            <span className="size-1.5 rounded-full bg-red-400" />
            <span className="size-1.5 rounded-full bg-amber-400" />
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="ml-1 h-1.5 w-24 bg-white rounded-full" />
          </div>
          <div className="p-2 grid grid-cols-4 gap-1">
            <div className="col-span-4 h-3 bg-accent-200 rounded-sm" />
            <div className="h-6 bg-white border border-zinc-200 rounded-sm" />
            <div className="h-6 bg-white border border-zinc-200 rounded-sm" />
            <div className="h-6 bg-white border border-zinc-200 rounded-sm" />
            <div className="h-6 bg-white border border-zinc-200 rounded-sm" />
          </div>
        </div>
      )
    case 'app':
    case 'push':
      return (
        <div className={cn(base, 'flex justify-center')}>
          <div className="w-16 h-full bg-white border-x border-zinc-200 p-1">
            <div className="h-2 w-full bg-accent-600 rounded-sm mb-1" />
            <div className="h-1 w-3/4 bg-zinc-200 rounded-full mb-1.5" />
            {channel.id === 'push' ? (
              <div className="rounded-sm border border-zinc-200 bg-white shadow-sm p-1 mt-1">
                <div className="h-1 w-1/2 bg-zinc-300 rounded-full mb-0.5" />
                <div className="h-1 w-full bg-zinc-200 rounded-full" />
                <div className="h-1 w-2/3 bg-zinc-200 rounded-full mt-0.5" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-0.5">
                <div className="h-5 bg-red-100 rounded-sm" />
                <div className="h-5 bg-amber-100 rounded-sm" />
                <div className="h-5 bg-emerald-100 rounded-sm" />
                <div className="h-5 bg-sky-100 rounded-sm" />
              </div>
            )}
          </div>
        </div>
      )
    case 'instore':
      return (
        <div className={cn(base, 'flex items-end justify-center gap-2 pb-2')}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-8 h-10 bg-white border border-zinc-300 rounded-sm p-0.5">
              <div className="h-3.5 bg-zinc-200 rounded-[2px] mb-0.5" />
              <div className="h-1 w-2/3 bg-red-500 rounded-full" />
              <div className="h-0.5 w-1/2 bg-zinc-300 rounded-full mt-0.5" />
            </div>
          ))}
        </div>
      )
    default:
      return (
        <div className={cn(base, 'flex items-center justify-center')}>
          <Icon name={channel.icon} size={26} className="text-zinc-300" />
        </div>
      )
  }
}

export default function Export() {
  const { state, dispatch, notify } = useApp()
  const nav = useNavigate()
  const camp = CAMPAIGN_LABEL[state.campaignStatus]
  const approved = state.campaignStatus === 'freigegeben' || state.campaignStatus === 'veroeffentlicht'
  const [busy, setBusy] = useState<string | null>(null)
  const [busyAll, setBusyAll] = useState(false)
  const [digital, setDigital] = useState(false)

  const publishedCount = Object.values(state.channels).filter((c) => c.status === 'veroeffentlicht').length

  const publishOne = async (id: string) => {
    if (!approved || busy || busyAll) return
    setBusy(id)
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500))
    dispatch({ type: 'channel/publish', id })
    setBusy(null)
    notify(`Kanal „${CHANNELS.find((c) => c.id === id)?.name}" veröffentlicht.`)
  }

  const publishAll = async () => {
    if (!approved || busyAll) return
    setBusyAll(true)
    for (const c of CHANNELS) {
      if (state.channels[c.id]?.status !== 'veroeffentlicht') {
        setBusy(c.id)
        await new Promise((r) => setTimeout(r, 420))
        dispatch({ type: 'channel/publish', id: c.id })
      }
    }
    setBusy(null)
    setBusyAll(false)
    notify('Kampagne KW 35 auf allen 9 Kanälen veröffentlicht. 🎉')
  }

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Omnichannel-Export</h1>
            <Badge tone={camp.tone}>{camp.label}</Badge>
          </div>
          <p className="text-[13px] text-zinc-500 mt-0.5">Schritt 5 von 5 · Eine Kampagne, ein Freigabestand – neun Ausspielwege</p>
        </div>
        <div className="flex gap-2">
          {publishedCount > 0 && (
            <Btn variant="secondary" onClick={() => { dispatch({ type: 'channel/revert' }); notify('Alle Kanäle auf „Bereit" zurückgesetzt.', 'info') }}>
              <Icon name="refresh" size={15} />
              Zurücksetzen
            </Btn>
          )}
          <Btn onClick={publishAll} disabled={!approved || busyAll}>
            {busyAll ? <Spinner size={15} /> : <Icon name="zap" size={15} />}
            Kampagne veröffentlichen
          </Btn>
        </div>
      </div>

      {!approved && (
        <div className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3.5 flex flex-wrap items-center gap-3">
          <Icon name="lock" size={17} className="text-sky-600" />
          <div className="flex-1 text-[13px] text-sky-900 leading-snug">
            <span className="font-bold">Die Veröffentlichung ist gesperrt.</span> Alle Kanäle sind vorbereitet und warten auf die Freigabe der Kampagne KW 35 (Schritt 4).
          </div>
          <Btn size="sm" onClick={() => nav('/kampagnen?tab=freigabe')}>
            <Icon name="shield" size={14} />
            Zur Freigabe
          </Btn>
        </div>
      )}

      {state.campaignStatus === 'veroeffentlicht' && (
        <div className="rounded-xl bg-accent-950 text-white px-5 py-4 flex flex-wrap items-center gap-4">
          <div className="size-10 rounded-full bg-accent-600 flex items-center justify-center shrink-0">
            <Icon name="checkc" size={20} />
          </div>
          <div className="flex-1 min-w-56">
            <div className="font-bold">Kampagne KW 35 ist live</div>
            <div className="text-[12px] text-zinc-400">Veröffentlicht am {state.publishedAt} · {publishedCount}/9 Kanäle aktiv</div>
          </div>
          <Btn variant="soft" className="!bg-white !text-accent-900 !border-white" onClick={() => nav('/analytics')}>
            <Icon name="pie" size={15} />
            Performance ansehen
          </Btn>
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {CHANNELS.map((c) => {
          const ch = state.channels[c.id]
          const st = !approved ? 'gesperrt' : ch.status
          const meta = STATUS_META[st]
          const isBusy = busy === c.id
          return (
            <Card key={c.id} className="flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="size-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                  <Icon name={c.icon} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-zinc-900">{c.name}</span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{c.desc}</div>
                </div>
              </div>
              <ChannelPreview channel={c} />
              <div className="flex items-center justify-between mt-3 text-[10.5px] text-zinc-400">
                <span>{c.format}</span>
                <span className="tnum">{ch.last ? `Aktualisiert: ${ch.last}` : 'Noch nicht veröffentlicht'}</span>
              </div>
              <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-zinc-100">
                {c.id === 'web' && (
                  <Btn variant="secondary" size="sm" className="flex-1" onClick={() => setDigital(true)}>
                    <Icon name="eye" size={13} />
                    Vorschau
                  </Btn>
                )}
                <Btn
                  size="sm"
                  className="flex-1"
                  variant={st === 'veroeffentlicht' ? 'secondary' : 'primary'}
                  disabled={!approved || isBusy || st === 'veroeffentlicht'}
                  onClick={() => publishOne(c.id)}
                >
                  {isBusy ? <Spinner size={13} /> : <Icon name={st === 'veroeffentlicht' ? 'checkc' : 'upload'} size={13} />}
                  {isBusy ? 'Wird publiziert …' : st === 'veroeffentlicht' ? 'Live' : 'Veröffentlichen'}
                </Btn>
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <SectionHead title="Versionierung & Governance" sub="Nachvollziehbar für Handelsprüfung und Revision" />
        <div className="grid md:grid-cols-4 gap-4 text-[12px]">
          {[
            ['Version', 'KW 35 · v3 · Entwurf vom 22.08., 16:41'],
            ['Freigegeben von', state.approvedAt ? `${'M. Clausen (Leitung Handelsmarketing)'} · ${state.approvedAt}` : 'Ausstehend'],
            ['PAngV-Prüfstand', '100 % konform · Protokoll #2026-0835'],
            ['Änderungssperre', approved ? 'Aktiv – Änderungen nur per neuer Version' : 'Noch offen'],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">{l}</div>
              <div className="font-semibold text-zinc-800 mt-1 leading-snug">{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <DigitalFlyerModal open={digital} onClose={() => setDigital(false)} />
    </div>
  )
}
