import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, stepStates, STEP_META, CAMPAIGN_LABEL, approvalChecklist } from '../state/AppState'
import { Badge, Btn, Card, SectionHead, Stepper, cn } from '../components/ui'
import { Icon } from '../lib/icons'
import { pangvSummary, scoreProduct } from '../lib/ai'
import type { StepState } from '../data/types'
import { BUNDLES, recipeById } from '../data/mock'

const STEP_DESC = [
  'Aktionsdaten aus Excel, Google Sheets, Microsoft 365, SAP/ERP oder API übernehmen, Felder zuordnen und validieren.',
  'Die KI bewertet jeden Artikel nach Marge, Abverkauf, Nachfrage, Saison, Regionalität und Lagerbestand – transparent und anpassbar.',
  'Layout wählen, Hero-Produkt setzen, Rezept & Bundle ergänzen und die Personalisierung pro Kundensegment prüfen.',
  'Checkliste bestätigen: validierte Produkte und Preise, PAngV-Konformität, Bilder, Rezepte, Bundles, Personalisierung.',
  'Einmal produzieren, überall veröffentlichen: Print-PDF, Web, App, E-Mail, Push, Social, OOH, DooH und In-Store.',
]

export default function Handzettel() {
  const { state, notify } = useApp()
  const nav = useNavigate()
  const steps = stepStates(state)
  const camp = CAMPAIGN_LABEL[state.campaignStatus]
  const pangv = pangvSummary(state.products)
  const checks = approvalChecklist(state)
  const okCount = checks.filter((c) => c.state === 'ok').length
  const published = Object.values(state.channels).filter((c) => c.status === 'veroeffentlicht').length
  const topScore = Math.max(...state.products.map((p) => scoreProduct(p, state.weights).score))

  const details: string[] = [
    state.importSt.status === 'done'
      ? `${state.importSt.rows} Datensätze · ${state.importSt.errors} Fehler · ${state.importSt.warnings} Warnungen`
      : 'Noch kein Import in diesem Durchlauf',
    state.rankingConfirmed ? `Auswahl bestätigt · Top-Score ${topScore}/100` : `Bereit · Top-Score aktuell ${topScore}/100`,
    state.flyer.committed ? `${state.flyer.included.length} Angebote übernommen · Layout „${state.flyer.layout}“` : `${state.flyer.included.length} Angebote im Entwurf`,
    `${okCount}/${checks.length} Prüfpunkte bestätigt`,
    published > 0 ? `${published}/9 Kanäle veröffentlicht` : '9 Kanäle vorbereitet',
  ]

  const ctas = ['Import starten', 'Ranking prüfen', 'Flyer Builder öffnen', 'Freigabe öffnen', 'Export öffnen']

  return (
    <div className="space-y-5 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Handzettel KW 35</h1>
            <Badge tone={camp.tone}>{camp.label}</Badge>
          </div>
          <p className="text-[13px] text-zinc-500 mt-0.5">Gültig 24.08.–29.08.2026 · Region Nord · vom wöchentlichen Handzettel in Minuten statt Tagen</p>
        </div>
        <Btn variant="secondary" onClick={() => nav('/handzettel/export')} disabled={state.campaignStatus !== 'freigegeben' && state.campaignStatus !== 'veroeffentlicht'}>
          <Icon name="share" size={15} />
          {state.campaignStatus === 'veroeffentlicht' ? 'Export-Verwaltung' : 'Export (nach Freigabe)'}
        </Btn>
      </div>

      {/* Workflow-Stepper */}
      <Card className="overflow-x-auto">
        <Stepper
          steps={STEP_META.map((s, i) => ({
            label: s.label,
            state: steps[i],
            icon: s.icon,
            onClick: () => nav(s.to),
          }))}
        />
      </Card>

      {state.importSt.status !== 'done' && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5 flex flex-wrap items-center gap-3">
          <Icon name="alert" size={17} className="text-amber-600" />
          <div className="flex-1 text-[13px] text-amber-900 leading-snug">
            <span className="font-bold">Schritt 1 steht noch aus.</span> Starten Sie den Datenimport – für die Demo genügt ein Klick auf „Demo-Daten verwenden".
          </div>
          <Btn size="sm" onClick={() => nav('/handzettel/import')}>
            <Icon name="upload" size={14} />
            Zum Import
          </Btn>
        </div>
      )}

      {/* Schrittkarten */}
      <div className="space-y-3">
        {STEP_META.map((s, i) => {
          const st: StepState = steps[i]
          const locked = st === 'locked'
          const bt: Record<StepState, 'ok' | 'accent' | 'warn' | 'zinc'> = { done: 'ok', active: 'accent', attention: 'warn', locked: 'zinc' }
          const bl: Record<StepState, string> = { done: 'Abgeschlossen', active: 'In Arbeit', attention: 'Prüfen nötig', locked: 'Nicht gestartet' }
          return (
            <Card key={s.key} className={cn('flex flex-col md:flex-row md:items-center gap-4', locked && 'opacity-70')}>
              <div className="flex items-center gap-3.5 md:w-72 shrink-0">
                <div
                  className={cn(
                    'size-11 rounded-xl border flex items-center justify-center shrink-0',
                    st === 'done' ? 'bg-accent-600 border-accent-600 text-white' : st === 'attention' ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-zinc-50 border-zinc-200 text-zinc-500',
                  )}
                >
                  <Icon name={st === 'done' ? 'checkc' : s.icon} size={19} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Schritt {i + 1}</div>
                  <div className="text-[15px] font-bold text-zinc-900">{s.label}</div>
                  <Badge tone={bt[st]} className="mt-1">{bl[st]}</Badge>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-zinc-600 leading-relaxed">{STEP_DESC[i]}</p>
                <div className="text-[11.5px] font-medium text-zinc-400 mt-1.5 tnum">{details[i]}</div>
              </div>
              <div className="shrink-0">
                <Btn variant={st === 'done' ? 'secondary' : 'primary'} size="sm" disabled={locked && i > 0} onClick={() => nav(s.to)}>
                  {ctas[i]}
                  <Icon name="arrowR" size={14} />
                </Btn>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Vertrauens-Panel */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <SectionHead title="PAngV-Check" sub="Preisangabenverordnung – automatisch geprüft" />
          <div className="flex items-center gap-2 flex-wrap">
            <Badge tone="ok">{pangv.konform} konform</Badge>
            <Badge tone="warn">{pangv.warnung} Warnungen</Badge>
            <Badge tone={pangv.fehler > 0 ? 'err' : 'ok'}>{pangv.fehler} Fehler</Badge>
          </div>
          <p className="text-[11.5px] text-zinc-500 mt-3 leading-relaxed">
            Jede Preiszeile im Flyer trägt Grundpreis, Pfand-Vermerk und UVP-Kennzeichnung. Prüfregeln: § 1, § 2 und § 3 PAngV.
          </p>
        </Card>
        <Card>
          <SectionHead title="Inhalt der Kampagne" sub="Aktuell im Flyer vorgesehen" />
          <div className="space-y-2 text-[12.5px]">
            <div className="flex justify-between"><span className="text-zinc-500">Angebote</span><span className="font-bold tnum">{state.flyer.included.length}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Rezept der Woche</span><span className="font-semibold text-zinc-800 truncate ml-3">{recipeById(state.flyer.recipeId)?.title ?? '–'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Smart Bundle</span><span className="font-semibold text-zinc-800 truncate ml-3">{BUNDLES.find((b) => b.id === state.flyer.bundleId)?.title ?? '–'}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Personalisierung</span><span className="font-semibold text-accent-700">{state.flyer.personalization ? '6 Segmente aktiv' : 'Aus'}</span></div>
          </div>
        </Card>
        <Card>
          <SectionHead title="Qualität der Daten" sub="Datenqualität & Vertrauen" />
          <div className="space-y-2 text-[12.5px]">
            <div className="flex items-center gap-2"><Icon name="checkc" size={14} className="text-emerald-600" /> EAN-Vollständigkeit 100 %</div>
            <div className="flex items-center gap-2"><Icon name="checkc" size={14} className="text-emerald-600" /> Produktmotive 39/39 zugeordnet</div>
            <div className="flex items-center gap-2"><Icon name="alert" size={14} className="text-amber-500" /> 1 Artikel mit knappem Bestand (Eisbergsalat, 150 St.)</div>
            <div className="text-[11px] text-zinc-400 pt-1">Letzte Synchronisation: heute, 06:12 Uhr (Excel + Google Sheets)</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
