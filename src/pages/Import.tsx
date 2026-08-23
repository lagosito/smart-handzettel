import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { CATEGORY_EMOJI, CSV_DEMO, IMPORT_SOURCES } from '../data/mock'
import { CANONICAL_FIELDS } from '../lib/ai'
import type { Category, Product, Region, ImportIssue } from '../data/types'
import { Badge, Btn, Card, DataTable, SectionHead, Spinner, cn, inputCls } from '../components/ui'
import { Icon } from '../lib/icons'
import { hashStr, parseDE } from '../lib/utils'

const WIZ = ['Quelle wählen', 'Vorschau', 'Felder zuordnen', 'Validierung', 'Verarbeitung']

const REGIONS: Region[] = ['Nord', 'Süd', 'West', 'Ost', 'Bundesweit']
const CATS: Category[] = ['Obst & Gemüse', 'Fleisch', 'Molkerei', 'Getränke', 'Tiefkühl', 'Backwaren', 'Snacks', 'Feinkost', 'Haushalt']

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (!lines.length) return { headers: [], rows: [] }
  const first = lines[0]
  const delim = (first.match(/;/g)?.length ?? 0) >= (first.match(/,/g)?.length ?? 0) ? ';' : ','
  const split = (l: string) => l.split(delim).map((c) => c.trim().replace(/^"|"$/g, ''))
  return { headers: split(first), rows: lines.slice(1).map(split) }
}

function autoMap(headers: string[]): Record<string, string> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-zäöüß]/g, '')
  const map: Record<string, string> = {}
  CANONICAL_FIELDS.forEach((f) => {
    const hit = headers.find((h) => {
      const n = norm(h)
      return n === norm(f.key) || n === norm(f.label) || n.includes(norm(f.key)) || n.includes(norm(f.label))
    })
    map[f.key] = hit ?? ''
  })
  return map
}

function rowsToProducts(headers: string[], rows: string[][], mapping: Record<string, string>): Product[] {
  const col = (key: string) => headers.indexOf(mapping[key])
  return rows
    .map((r, i) => {
      const get = (k: string) => r[col(k)] ?? ''
      const catRaw = get('kategorie')
      const category = (CATS.find((c) => c.toLowerCase() === catRaw.toLowerCase()) ?? 'Feinkost') as Category
      const region = (REGIONS.find((x) => x.toLowerCase() === get('region').toLowerCase()) ?? 'Bundesweit') as Region
      const name = get('produktname') || `Artikel ${i + 1}`
      const h = hashStr(name)
      const price = parseDE(get('normalpreis')) || 1
      const promo = parseDE(get('aktionspreis')) || price * 0.85
      return {
        id: 'imp-' + (get('ean') || i),
        name,
        brand: 'Import',
        category,
        ean: get('ean') || '-',
        unit: '1 Stück',
        price,
        promo,
        base: get('grundpreis') || '',
        deposit: parseDE(get('pfand')) || undefined,
        uvp: parseDE(get('uvp')) || undefined,
        margin: parseDE(get('marge')) || 25,
        velocity: parseDE(get('abverkauf')) || 500,
        stock: parseDE(get('lagerbestand')) || 300,
        demand: 40 + (h % 50),
        season: 35 + (h % 55),
        regionality: 20 + (h % 75),
        region,
        emoji: CATEGORY_EMOJI[category] ?? '🛒',
        segments: category === 'Fleisch' ? ['grill'] : category === 'Obst & Gemüse' ? ['veggie', 'familien'] : ['familien'],
        period: get('aktionszeitraum') || '24.08.–29.08.',
      } as Product
    })
    .filter((p) => p.name)
}

function validate(products: Product[]): ImportIssue[] {
  const issues: ImportIssue[] = []
  products.forEach((p, i) => {
    const row = i + 2
    if (!/^\d{8,14}$/.test(p.ean.replace(/\D/g, ''))) issues.push({ row, field: 'EAN', severity: 'warnung', message: `EAN „${p.ean}“ weicht vom GS1-Format ab (8–14 Ziffern).` })
    if (p.promo >= p.price) issues.push({ row, field: 'Aktionspreis', severity: 'fehler', message: `Aktionspreis (${p.promo}) liegt nicht unter Normalpreis (${p.price}).` })
    if (!p.base) issues.push({ row, field: 'Grundpreis', severity: 'fehler', message: 'Grundpreis fehlt – Pflichtangabe gemäß § 2 PAngV.' })
    if (p.category === 'Getränke' && p.deposit == null) issues.push({ row, field: 'Pfand', severity: 'warnung', message: 'Getränkeartikel ohne Pfandangabe – bitte prüfen.' })
    if (p.margin < 0) issues.push({ row, field: 'Marge', severity: 'warnung', message: 'Negative Marge – deckt sich das mit dem Einkauf?' })
  })
  return issues
}

export default function Import() {
  const { state, dispatch, notify } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [source, setSource] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const products = useMemo(() => rowsToProducts(headers, rows, mapping), [headers, rows, mapping])
  const issues = useMemo(() => (step >= 3 ? validate(products) : []), [step, products])
  const errCount = issues.filter((i) => i.severity === 'fehler').length
  const warnCount = issues.filter((i) => i.severity === 'warnung').length

  const loadText = (text: string, name: string, src: string) => {
    const parsed = parseCSV(text)
    if (!parsed.headers.length) {
      notify('Datei konnte nicht gelesen werden.', 'error')
      return
    }
    setHeaders(parsed.headers)
    setRows(parsed.rows)
    setMapping(autoMap(parsed.headers))
    setFileName(name)
    setSource(src)
    setStep(1)
    notify(`${parsed.rows.length} Zeilen aus „${name}“ geladen.`, 'info')
  }

  const onFile = (f: File) => {
    const reader = new FileReader()
    reader.onload = () => loadText(String(reader.result), f.name, 'Datei-Upload')
    reader.readAsText(f, 'utf-8')
  }

  const startProcessing = () => {
    setProcessing(true)
    setProgress(0)
    const stages = [
      'Verbindung zu Artikelstamm wird aufgebaut …',
      `Preise & Konditionen für ${products.length} Artikel werden übernommen …`,
      'PAngV-Regeln werden angewendet (§ 1, § 2, § 3) …',
      'Lagerbestände der Region Nord werden synchronisiert …',
      'KI-Scoring wird vorbereitet …',
    ]
    let i = 0
    setStage(stages[0])
    const tick = window.setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 4 + Math.random() * 7)
        const idx = Math.min(stages.length - 1, Math.floor((next / 100) * stages.length))
        if (idx !== i) {
          i = idx
          setStage(stages[idx])
        }
        if (next >= 100) {
          window.clearInterval(tick)
          window.setTimeout(() => {
            dispatch({
              type: 'import/done',
              source: source ?? 'Unbekannt',
              rows: products.length,
              errors: errCount,
              warnings: warnCount,
              products: products.length >= 5 ? products : undefined,
            })
            setProcessing(false)
            setStep(4)
            notify('Import abgeschlossen – Daten validiert und verarbeitet.')
          }, 500)
        }
        return next
      })
    }, 160)
  }

  const canStart = errCount === 0

  return (
    <div className="space-y-5 anim-in max-w-5xl">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Daten importieren</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">Schritt 1 von 5 im Handzettel-Workflow · Aktionsdaten übernehmen, zuordnen, validieren</p>
      </div>

      {/* Mini-Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {WIZ.map((w, i) => (
          <React.Fragment key={w}>
            {i > 0 && <div className={cn('h-px w-6 shrink-0', i <= step ? 'bg-accent-500' : 'bg-zinc-200')} />}
            <div className={cn('flex items-center gap-1.5 shrink-0 text-xs font-semibold', i === step ? 'text-accent-700' : i < step ? 'text-zinc-700' : 'text-zinc-400')}>
              <span className={cn('size-5.5 rounded-full flex items-center justify-center text-[10px] border', i < step ? 'bg-accent-600 border-accent-600 text-white' : i === step ? 'border-accent-600 text-accent-700' : 'border-zinc-300')}>
                {i < step ? <Icon name="check" size={11} strokeWidth={2.5} /> : i + 1}
              </span>
              {w}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Schritt 1: Quelle */}
      {step === 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <SectionHead title="Datei hochladen" sub="CSV oder XLSX mit Aktionsdaten der Kalenderwoche" />
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files?.[0]
                if (f) onFile(f)
              }}
              className="rounded-xl border-2 border-dashed border-zinc-300 hover:border-accent-500 hover:bg-accent-50/40 transition-colors px-6 py-10 text-center cursor-pointer"
            >
              <Icon name="upload" size={26} className="mx-auto text-zinc-400" />
              <div className="text-sm font-semibold text-zinc-800 mt-2.5">CSV/XLSX hierher ziehen oder Datei wählen</div>
              <div className="text-xs text-zinc-400 mt-1">Deutsche Zahlenformate (1,99) und ;-Trennung werden unterstützt</div>
              <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="h-px flex-1 bg-zinc-200" />
              <span className="text-[11px] text-zinc-400 font-medium">ODER</span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>
            <Btn className="w-full mt-4" onClick={() => loadText(CSV_DEMO, 'Sortiment_KW35.xlsx (Demo)', 'Excel-Demo')}>
              <Icon name="zap" size={15} />
              Demo-Daten verwenden
            </Btn>
            <button
              className="w-full mt-2 text-[11.5px] text-accent-700 font-semibold hover:underline cursor-pointer"
              onClick={() => {
                const blob = new Blob([CSV_DEMO], { type: 'text/csv' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = 'handzettel_demo_kw35.csv'
                a.click()
              }}
            >
              Beispiel-CSV herunterladen, um das Format zu sehen
            </button>
          </Card>

          <Card>
            <SectionHead title="Über Integrationen holen" sub="Verbundene Systeme – Import mit einem Klick" />
            <div className="grid sm:grid-cols-2 gap-2.5">
              {IMPORT_SOURCES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => s.id !== 'upload' && loadText(CSV_DEMO, s.desc.replace(/[„“"]/g, ''), s.name)}
                  className={cn('flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer', s.id === 'upload' ? 'border-zinc-100 bg-zinc-50 opacity-60' : 'border-zinc-200 hover:border-accent-400 hover:bg-accent-50/40')}
                >
                  <div className="size-9.5 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                    <Icon name={s.icon} size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-zinc-900 flex items-center gap-1.5">
                      {s.name}
                      {s.id !== 'upload' && <Badge tone="ok" className="!px-1.5">verbunden</Badge>}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 leading-tight">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400 mt-3.5">Die Demo lädt bei allen Quellen denselben Beispieldatensatz. Integrationen verwalten Sie unter <button className="underline font-medium cursor-pointer" onClick={() => nav('/integrationen')}>Integrationen</button>.</p>
          </Card>
        </div>
      )}

      {/* Schritt 2: Vorschau */}
      {step === 1 && (
        <Card pad={false}>
          <div className="p-5 pb-0">
            <SectionHead
              title={`Vorschau: ${fileName}`}
              sub={`${rows.length} Zeilen · ${headers.length} Spalten erkannt (Quelle: ${source})`}
              right={
                <div className="flex gap-2">
                  <Btn variant="secondary" size="sm" onClick={() => setStep(0)}>Zurück</Btn>
                  <Btn size="sm" onClick={() => setStep(2)}>Weiter zur Zuordnung<Icon name="arrowR" size={14} /></Btn>
                </div>
              }
            />
          </div>
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-200">
                  {headers.map((h) => (
                    <th key={h} className="text-left text-[10.5px] uppercase tracking-wider font-semibold text-zinc-400 py-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 8).map((r, i) => (
                  <tr key={i} className="border-b border-zinc-100 last:border-0">
                    {headers.map((h, j) => (
                      <td key={h} className="py-2 pr-4 whitespace-nowrap tnum text-zinc-700">{r[j] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 8 && <div className="text-[11px] text-zinc-400 py-2">… und {rows.length - 8} weitere Zeilen</div>}
          </div>
        </Card>
      )}

      {/* Schritt 3: Zuordnung */}
      {step === 2 && (
        <Card>
          <SectionHead
            title="Felder zuordnen"
            sub="Die KI hat die Spalten automatisch erkannt – bitte prüfen und ggf. korrigieren"
            right={
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm" onClick={() => setStep(1)}>Zurück</Btn>
                <Btn size="sm" onClick={() => setStep(3)}>Validierung starten<Icon name="arrowR" size={14} /></Btn>
              </div>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {CANONICAL_FIELDS.map((f) => {
              const ok = !!mapping[f.key]
              return (
                <div key={f.key} className="rounded-xl border border-zinc-200 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12.5px] font-semibold text-zinc-800">{f.label}</span>
                    {ok ? <Badge tone="ok" className="!px-1.5">erkannt</Badge> : <Badge tone="warn" className="!px-1.5">fehlt</Badge>}
                  </div>
                  <select
                    className={cn(inputCls, 'h-9 text-[13px]')}
                    value={mapping[f.key]}
                    onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}
                  >
                    <option value="">– nicht zuordnen –</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Schritt 4: Validierung */}
      {step === 3 && !processing && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Card className="text-center">
              <div className="text-3xl font-bold tnum text-zinc-900">{products.length}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Artikel erkannt</div>
            </Card>
            <Card className="text-center">
              <div className={cn('text-3xl font-bold tnum', errCount ? 'text-red-600' : 'text-emerald-600')}>{errCount}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Fehler (blockieren)</div>
            </Card>
            <Card className="text-center">
              <div className={cn('text-3xl font-bold tnum', warnCount ? 'text-amber-600' : 'text-emerald-600')}>{warnCount}</div>
              <div className="text-xs text-zinc-500 mt-0.5">Warnungen (prüfbar)</div>
            </Card>
          </div>

          {issues.length > 0 && (
            <Card>
              <SectionHead title="Befunde im Detail" sub="Jeder Befund ist einer Zeile und einem Feld zugeordnet – nichts bleibt eine Blackbox" />
              <DataTable
                keyOf={(r) => r.row + r.field}
                columns={[
                  { key: 'sev', title: 'Status', width: '90px' },
                  { key: 'row', title: 'Zeile', width: '60px' },
                  { key: 'field', title: 'Feld', width: '130px' },
                  { key: 'message', title: 'Befund' },
                ]}
                rows={issues.map((i) => ({
                  sev: <Badge tone={i.severity === 'fehler' ? 'err' : 'warn'}>{i.severity === 'fehler' ? 'Fehler' : 'Warnung'}</Badge>,
                  row: <span className="tnum text-zinc-500">{i.row}</span>,
                  field: <span className="font-semibold text-zinc-800">{i.field}</span>,
                  message: <span className="text-zinc-600">{i.message}</span>,
                }))}
              />
            </Card>
          )}

          <Card className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-60">
              <div className="text-sm font-bold text-zinc-900">{canStart ? 'Datensatz ist verarbeitungsbereit.' : 'Bitte Fehler beheben, um fortzufahren.'}</div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {canStart
                  ? 'Bei der Verarbeitung werden Preise final geprüft, PAngV-Angaben vervollständigt und das KI-Ranking vorbereitet.'
                  : 'Fehlerhafte Zeilen (z. B. fehlende Grundpreise) verstoßen gegen die PAngV und dürfen nicht in den Flyer.'}
              </p>
            </div>
            <Btn variant="secondary" onClick={() => setStep(2)}>Zurück</Btn>
            <Btn disabled={!canStart} onClick={startProcessing}>
              <Icon name="zap" size={15} />
              Verarbeitung starten
            </Btn>
          </Card>
        </div>
      )}

      {/* Verarbeitung läuft */}
      {step === 3 && processing && (
        <Card className="py-12 text-center max-w-xl mx-auto">
          <Spinner size={30} className="mx-auto text-accent-600" />
          <div className="text-[15px] font-bold text-zinc-900 mt-5">Verarbeitung läuft …</div>
          <div className="text-xs text-zinc-500 mt-1.5 h-4">{stage}</div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden mt-5 mx-8">
            <div className="h-full bg-accent-600 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-[11px] tnum text-zinc-400 mt-2">{Math.round(progress)} %</div>
        </Card>
      )}

      {/* Fertig */}
      {step === 4 && (
        <Card className="py-10 text-center max-w-xl mx-auto">
          <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Icon name="checkc" size={28} />
          </div>
          <div className="text-lg font-bold text-zinc-900 mt-4">Import abgeschlossen</div>
          <p className="text-[13px] text-zinc-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            {products.length} Artikel wurden übernommen, validiert und für das KI-Ranking vorbereitet.
            {warnCount > 0 ? ` ${warnCount} Warnung(en) wurden dokumentiert und sind im Ranking sichtbar.` : ''}
          </p>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            <Badge tone="ok">Schritt 1 „Daten“ abgeschlossen</Badge>
            <Badge tone="accent">Schritt 2 „Smart Ranking“ bereit</Badge>
          </div>
          <div className="flex justify-center gap-2.5 mt-6">
            <Btn onClick={() => nav('/ranking')}>
              Weiter zu Smart Ranking
              <Icon name="arrowR" size={15} />
            </Btn>
            <Btn variant="secondary" onClick={() => nav('/handzettel')}>Workflow-Übersicht</Btn>
          </div>
        </Card>
      )}
    </div>
  )
}
