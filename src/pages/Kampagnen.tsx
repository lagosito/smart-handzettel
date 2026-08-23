import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp, approvalChecklist, CAMPAIGN_LABEL } from '../state/AppState'
import { CAMPAIGNS } from '../data/mock'
import { AiTag, Badge, Btn, Card, DataTable, Modal, SectionHead, Tabs, cn, inputCls } from '../components/ui'
import { Icon } from '../lib/icons'
import { recipeById, bundleById } from '../data/mock'
import { pangvCheck, pangvCampaignCheck } from '../lib/ai'

export default function Kampagnen() {
  const { state, dispatch, notify } = useApp()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'freigabe' ? 'freigabe' : 'liste'
  const [changesOpen, setChangesOpen] = useState(false)
  const [note, setNote] = useState('')

  const checks = approvalChecklist(state)
  const allOk = checks.every((c) => c.state === 'ok')
  const approved = state.campaignStatus === 'freigegeben' || state.campaignStatus === 'veroeffentlicht'
  const camp = CAMPAIGN_LABEL[state.campaignStatus]

  // PAngV gate: check for kritisch items and unconfirmed offen items
  const pangvResults = state.products.map((p) => pangvCheck(p))
  const campaignCheck = pangvCampaignCheck()
  const allPangvItems = [...campaignCheck.items, ...pangvResults.flatMap((r) => r.items)]
  const hasKritisch = allPangvItems.some((i) => i.level === 'kritisch')
  const unconfirmedOffen = allPangvItems.filter((i) => i.level === 'offen' && i.requiresConfirmation && !state.pangvConfirmations[`${i.label}:${i.detail}`])
  const canFreigeben = allOk && !hasKritisch && unconfirmedOffen.length === 0

  const confirmRow = (key: string) => {
    if (key === 'recipe') {
      dispatch({ type: 'approval/patch', patch: { recipeOk: true } })
      notify('Rezept bestätigt.')
    }
    if (key === 'bundle') {
      dispatch({ type: 'approval/patch', patch: { bundleOk: true } })
      notify('Bundle bestätigt.')
    }
  }

  const approve = () => {
    dispatch({ type: 'campaign/approve' })
    notify(`Handzettel KW ${state.campaignWeek} freigegeben – Export ist jetzt entsperrt. 🎉`)
  }

  const requestChanges = () => {
    if (!note.trim()) return
    dispatch({ type: 'campaign/requestChanges', note: note.trim() })
    setChangesOpen(false)
    setNote('')
    notify('Änderungen angefordert – Kampagne zurück in Bearbeitung.', 'warn')
  }

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Kampagnen</h1>
            <Badge tone={camp.tone}>KW {state.campaignWeek}: {camp.label}</Badge>
          </div>
          <p className="text-[13px] text-zinc-500 mt-0.5">Wochenkampagnen planen, prüfen und freigeben</p>
        </div>
        <Tabs active={tab} onChange={(k) => setParams({ tab: k === 'liste' ? 'liste' : 'freigabe' })} tabs={[{ key: 'liste', label: 'Übersicht' }, { key: 'freigabe', label: `Freigabe KW ${state.campaignWeek}` }]} />
      </div>

      {tab === 'liste' && (
        <Card pad={false}>
          <div className="p-5">
            <DataTable
              keyOf={(r) => String(r.kw)}
              onRow={(r) => r.kw === 35 && setParams({ tab: 'freigabe' })}
              columns={[
                { key: 'name', title: 'Kampagne' },
                { key: 'period', title: 'Zeitraum' },
                { key: 'offers', title: 'Angebote', align: 'right' },
                { key: 'status', title: 'Status', align: 'center' },
                { key: 'note', title: 'Hinweis' },
                { key: 'go', title: '', align: 'right' },
              ]}
              rows={CAMPAIGNS.map((c) => {
                const isCurrent = c.kw === 35
                const label = isCurrent ? camp : CAMPAIGN_LABEL[c.status as keyof typeof CAMPAIGN_LABEL]
                return {
                  name: (
                    <span className={cn('font-semibold', isCurrent ? 'text-accent-800' : 'text-zinc-800')}>
                      {c.name}
                      {isCurrent && <Badge tone="accent" className="ml-2">aktiv</Badge>}
                    </span>
                  ),
                  period: <span className="tnum text-zinc-500">{c.period}</span>,
                  offers: <span className="tnum text-zinc-700">{c.offers || '–'}</span>,
                  status: <Badge tone={label.tone}>{label.label}</Badge>,
                  note: <span className="text-[12px] text-zinc-500">{c.note}</span>,
                  go: <Icon name="chevR" size={15} className="inline text-zinc-300" />,
                }
              })}
            />
          </div>
        </Card>
      )}

      {tab === 'freigabe' && (
        <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
          <Card>
            <SectionHead
              title={`Freigabe: Handzettel KW ${state.campaignWeek}`}
              sub="Schritt 4 von 5 · Alle Prüfpunkte – transparent und nachvollziehbar"
              right={<Badge tone={approved ? 'ok' : allOk ? 'accent' : 'info'}>{approved ? 'Freigegeben' : allOk ? 'Bereit zur Freigabe' : `${checks.filter((c) => c.state === 'ok').length}/${checks.length} bestätigt`}</Badge>}
            />
            <div className="divide-y divide-zinc-100">
              {checks.map((c) => (
                <div key={c.key} className="flex items-center gap-3.5 py-3.5">
                  <span
                    className={cn(
                      'size-8.5 rounded-full border flex items-center justify-center shrink-0',
                      c.state === 'ok' ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : c.state === 'error' ? 'bg-red-50 border-red-300 text-red-500' : 'bg-amber-50 border-amber-300 text-amber-500',
                    )}
                  >
                    <Icon name={c.state === 'ok' ? 'check' : c.state === 'error' ? 'xc' : 'clock'} size={15} strokeWidth={2.2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-zinc-900">{c.label}</div>
                    <div className="text-[11.5px] text-zinc-500 mt-0.5">{c.detail}</div>
                  </div>
                  {c.action && c.state !== 'ok' && !approved && (
                    <Btn size="sm" variant="soft" onClick={() => confirmRow(c.action!)}>
                      <Icon name="check" size={13} />
                      Bestätigen
                    </Btn>
                  )}
                  {c.key === 'personalisierung' && c.state !== 'ok' && (
                    <Btn size="sm" variant="soft" onClick={() => dispatch({ type: 'flyer/patch', patch: { personalization: true } })}>
                      Aktivieren
                    </Btn>
                  )}
                </div>
              ))}
            </div>

            {/* PAngV offene Punkte */}
            {unconfirmedOffen.length > 0 && !approved && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Offene PAngV-Punkte ({unconfirmedOffen.length})</div>
                <div className="space-y-1.5">
                  {[...new Map(unconfirmedOffen.map((i) => [`${i.label}:${i.detail}`, i])).values()].map((item) => {
                    const confKey = `${item.label}:${item.detail}`
                    const isConfirmed = !!state.pangvConfirmations[confKey]
                    return (
                      <label key={confKey} className="flex items-start gap-2 py-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isConfirmed}
                          onChange={() => dispatch({ type: 'pangv/confirm', key: confKey })}
                          className="mt-0.5 accent-accent-600 shrink-0"
                        />
                        <span className="text-[12px] text-zinc-600">
                          <span className="font-medium text-zinc-800">{item.label}:</span> {item.detail}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {approved ? (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-4 flex flex-wrap items-center gap-3">
                <Icon name="checkc" size={20} className="text-emerald-600" />
                <div className="flex-1 text-[13px] text-emerald-900">
                  <span className="font-bold">Kampagne freigegeben{state.approvedAt ? ` am ${state.approvedAt}` : ''}.</span> Der Omnichannel-Export ist entsperrt.
                </div>
                <Btn onClick={() => nav('/handzettel/export')}>
                  Zum Export
                  <Icon name="arrowR" size={15} />
                </Btn>
              </div>
            ) : (
              <>
              <div className="flex flex-wrap gap-2.5 mt-5 pt-4 border-t border-zinc-100">
                <Btn onClick={approve} disabled={!canFreigeben} size="lg">
                  <Icon name="shield" size={16} />
                  Freigeben
                </Btn>
                <Btn variant="danger" size="lg" onClick={() => setChangesOpen(true)}>
                  <Icon name="edit" size={15} />
                  Änderungen anfordern
                </Btn>
                {!canFreigeben && (
                  <span className="self-center text-[11.5px] text-zinc-400">
                    {hasKritisch ? 'Kritische PAngV-Punkte müssen behoben werden.' :
                     unconfirmedOffen.length > 0 ? `${unconfirmedOffen.length} offene Punkt(e) müssen manuell bestätigt werden.` :
                     'Freigabe erst möglich, wenn alle Prüfpunkte bestätigt sind.'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 mt-3">Automatische Vorprüfung. Ersetzt keine rechtliche Beratung.</p>
              </>
            )}
            {state.approval.note && !approved && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-300 px-3.5 py-3 text-[12px] text-amber-900">
                <span className="font-bold">Angeforderte Änderung ({'M. Clausen'}):</span> {state.approval.note}
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <SectionHead title={`Zusammenfassung KW ${state.campaignWeek}`} sub="Was genau freigegeben wird" />
              <div className="space-y-2.5 text-[12.5px]">
                <div className="flex justify-between"><span className="text-zinc-500">Angebote</span><span className="font-bold tnum">{state.flyer.included.length}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Rezept</span><span className="font-semibold truncate ml-4 text-zinc-800">{recipeById(state.flyer.recipeId)?.title ?? '–'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Bundle</span><span className="font-semibold truncate ml-4 text-zinc-800">{bundleById(state.flyer.bundleId)?.title ?? '–'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Layout</span><span className="font-semibold capitalize text-zinc-800">{state.flyer.layout}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Personalisierung</span><span className="font-semibold text-accent-700">{state.flyer.personalization ? '6 Segmente' : 'Aus'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Gültigkeit</span><span className="font-semibold tnum text-zinc-800">24.08.–29.08.</span></div>
              </div>
              <Btn variant="secondary" size="sm" className="w-full mt-4" onClick={() => nav('/handzettel/builder')}>
                <Icon name="eye" size={14} />
                Flyer-Vorschau öffnen
              </Btn>
            </Card>

            <Card className="border-accent-200 bg-accent-50/40">
              <div className="flex items-start gap-2.5">
                <AiTag className="mt-0.5" />
                <div className="text-[12px] text-accent-900 leading-relaxed">
                  <span className="font-bold">KI-Qualitätsgutachten:</span> Der Entwurf erreicht 96 % des erwarteten Umsatzpotenzials. Die Hitzewelle ab Dienstag stützt die Getränke-Platzierung auf Seite 1. Keine PAngV-Risiken erkannt.
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Modal open={changesOpen} onClose={() => setChangesOpen(false)} title="Änderungen anfordern" sub="Die Kampagne geht zurück in die Bearbeitung – mit klarem Feedback ans Team">
        <div className="p-6 space-y-4">
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="z. B. Bitte Lagerbestand Eisbergsalat prüfen und Hero gegen Rumpsteak tauschen …"
            className={cn(inputCls, 'h-auto py-2.5 resize-none')}
          />
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setChangesOpen(false)}>Abbrechen</Btn>
            <Btn disabled={!note.trim()} onClick={requestChanges}>
              <Icon name="send" size={14} />
              Änderungen senden
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  )
}
