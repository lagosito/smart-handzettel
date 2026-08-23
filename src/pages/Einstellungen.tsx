import React, { useState } from 'react'
import { useApp } from '../state/AppState'
import { FACTORS } from '../lib/ai'
import { Badge, Btn, Card, Field, SectionHead, Toggle, cn, inputCls } from '../components/ui'
import { Icon } from '../lib/icons'

export default function Einstellungen() {
  const { state, dispatch, notify } = useApp()
  const [rules, setRules] = useState({ grundpreis: true, pfand: true, uvp: true, mwst: true })
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    notify('Einstellungen gespeichert.')
    window.setTimeout(() => setSaved(false), 2000)
  }

  const resetDemo = () => {
    if (!window.confirm('Demo wirklich zurücksetzen? Alle Fortschritte (Workflow, Freigabe, Exporte) werden gelöscht.')) return
    dispatch({ type: 'reset' })
    notify('Demo zurückgesetzt – willkommen zurück bei Schritt 1.', 'info')
  }

  return (
    <div className="space-y-5 anim-in max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Einstellungen</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Workspace „FrischeMarkt · Region Nord"</p>
        </div>
        <Btn onClick={save}>{saved ? <Icon name="checkc" size={15} /> : null}Speichern</Btn>
      </div>

      <Card>
        <SectionHead title="Unternehmen & Markt" sub="Stammdaten für Flyer-Kopf und Export" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Händlermarke">
            <input className={inputCls} defaultValue="FrischeMarkt" />
          </Field>
          <Field label="Claim">
            <input className={inputCls} defaultValue="Frisch. Nah. Günstig." />
          </Field>
          <Field label="Region / Vertriebsgebiet">
            <select className={inputCls} defaultValue="nord">
              <option value="nord">Region Nord · 214 Märkte</option>
              <option value="sued">Region Süd · 186 Märkte</option>
              <option value="west">Region West · 241 Märkte</option>
              <option value="ost">Region Ost · 128 Märkte</option>
            </select>
          </Field>
          <Field label="Standard-Kalenderwoche">
            <select className={inputCls} defaultValue="35">
              <option value="34">KW 34 (18.08.–23.08.)</option>
              <option value="35">KW 35 (24.08.–29.08.)</option>
              <option value="36">KW 36 (31.08.–05.09.)</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        <SectionHead title="KI-Standardgewichtung" sub="Startwerte für das Smart Ranking – pro Woche im Ranking anpassbar" right={<button className="text-[11px] font-semibold text-accent-700 hover:underline cursor-pointer" onClick={() => dispatch({ type: 'weights/reset' })}>Auf Standard zurücksetzen</button>} />
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
          {FACTORS.map((f) => (
            <div key={f.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-800">{f.label}</span>
                <span className="tnum font-bold text-accent-700">{state.weights[f.key]} %</span>
              </div>
              <input type="range" min={0} max={40} value={state.weights[f.key]} onChange={(e) => dispatch({ type: 'weights/set', key: f.key, value: Number(e.target.value) })} className="w-full accent-accent-600 cursor-pointer" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <SectionHead title="PAngV-Prüfregeln" sub="Rechtssicherheit der Preisangaben" />
          <div className="space-y-3.5">
            {(
              [
                ['grundpreis', 'Grundpreisangabe erforderlich (§ 2 PAngV)'],
                ['pfand', 'Pfandkennzeichnung bei Getränken prüfen'],
                ['uvp', 'UVP-Streichpreise nur mit zulässiger Kennzeichnung'],
                ['mwst', 'MwSt.-Hinweis im Footer erzwingen'],
              ] as const
            ).map(([k, l]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-zinc-700">{l}</span>
                <Toggle on={rules[k]} onChange={(v) => setRules({ ...rules, [k]: v })} />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-[11.5px] text-emerald-800 flex items-center gap-2">
            <Icon name="shield" size={14} />
            Alle Regeln aktiv – 100 % PAngV-Abdeckung.
          </div>
        </Card>

        <Card>
          <SectionHead title="Personalisierung & Kundenansprache" sub="Standardwerte für neue Kampagnen" />
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-zinc-700">KI-Personalisierung standardmäßig aktiv</span>
              <Toggle on={state.flyer.personalization} onChange={(v) => dispatch({ type: 'flyer/patch', patch: { personalization: v } })} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-zinc-700">Rezept der Woche vorschlagen</span>
              <Toggle on={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-zinc-700">Smart Bundle automatisch platzieren</span>
              <Toggle on={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-zinc-700">Einkaufsassistent im digitalen Flyer</span>
              <Toggle on={true} onChange={() => {}} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHead title="Team & Rollen" sub="Wer darf freigeben, wer erstellt?" />
        <div className="space-y-2.5">
          {[
            ['LB', 'Lena Berger', 'Campaign Managerin · Erstellung', 'Erstellerin'],
            ['MC', 'Marc Clausen', 'Leitung Handelsmarketing', 'Freigabe'],
            ['SH', 'Sven Hartwig', 'CRM & Digital', 'Kanalverwaltung'],
          ].map(([ini, name, role, tag]) => (
            <div key={name} className="flex items-center gap-3.5 rounded-xl border border-zinc-150 border-zinc-200 px-3.5 py-2.5">
              <span className="size-9 rounded-full bg-accent-700 text-white flex items-center justify-center text-xs font-bold">{ini}</span>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold text-zinc-900">{name}</div>
                <div className="text-[11px] text-zinc-500">{role}</div>
              </div>
              <Badge tone={tag === 'Freigabe' ? 'accent' : 'zinc'}>{tag}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-red-200">
        <SectionHead title="Demo-Umgebung" sub="Dieser Prototyp speichert den Fortschritt lokal in Ihrem Browser" />
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[12px] text-zinc-500 flex-1 min-w-56">
            Workflow-Fortschritt, Freigaben, Exporte und Einstellungen liegen im LocalStorage. Zurücksetzen stellt den Ausgangszustand wieder her.
          </p>
          <Btn variant="danger" onClick={resetDemo}>
            <Icon name="refresh" size={15} />
            Demo zurücksetzen
          </Btn>
        </div>
      </Card>
    </div>
  )
}
