import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppState'
import { pangvCheck, scoreProduct } from '../lib/ai'
import { Badge, Card, DataTable, Tabs, cn, inputCls } from '../components/ui'
import { Icon } from '../lib/icons'
import { discount, formatDE, kfmt } from '../lib/utils'

export default function Produkte() {
  const { state } = useApp()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('alle')
  const [checks, setChecks] = useState<'alle' | 'ok' | 'warnung' | 'fehler'>('alle')

  const cats = useMemo(() => {
    const m = new Map<string, number>()
    state.products.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1))
    return [...m.entries()]
  }, [state.products])

  const list = useMemo(() => {
    return state.products.filter((p) => {
      if (cat !== 'alle' && p.category !== cat) return false
      if (checks !== 'alle' && pangvCheck(p).status !== checks) return false
      if (q.trim()) {
        const t = q.toLowerCase()
        return p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t) || p.ean.includes(t)
      }
      return true
    })
  }, [state.products, cat, checks, q])

  return (
    <div className="space-y-4 anim-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-zinc-900">Produkte</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            {state.products.length} Aktionsartikel für KW {state.campaignWeek} · Quelle: {state.importSt.source ?? 'Stammsortiment (Demo)'}
            {state.importSt.at ? ` · Import: ${state.importSt.at}` : ''}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, Marke, EAN …" className={cn(inputCls, 'pl-9 w-56')} />
          </div>
          <select className={cn(inputCls, 'w-auto')} value={checks} onChange={(e) => setChecks(e.target.value as any)}>
            <option value="alle">PAngV: alle</option>
            <option value="ok">PAngV: ok</option>
            <option value="warnung">PAngV: Warnung</option>
            <option value="fehler">PAngV: Fehler</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Tabs
          active={cat}
          onChange={setCat}
          tabs={[{ key: 'alle', label: 'Alle Kategorien', count: state.products.length }, ...cats.map(([c, n]) => ({ key: c, label: c, count: n }))]}
        />
      </div>

      <Card pad={false}>
        <div className="p-5">
          <DataTable
            keyOf={(r) => r.ean}
            onRow={(r) => nav(`/produkte/${r.id}`)}
            columns={[
              { key: 'product', title: 'Produkt' },
              { key: 'category', title: 'Kategorie' },
              { key: 'ean', title: 'EAN' },
              { key: 'price', title: 'Normalpreis', align: 'right' },
              { key: 'promo', title: 'Aktionspreis', align: 'right' },
              { key: 'disc', title: 'Rabatt', align: 'center' },
              { key: 'margin', title: 'Marge', align: 'right' },
              { key: 'velocity', title: 'Abverkauf/Wo.', align: 'right' },
              { key: 'stock', title: 'Lager', align: 'right' },
              { key: 'score', title: 'KI-Score', align: 'center' },
              { key: 'pangv', title: 'PAngV', align: 'center' },
            ]}
            rows={list.map((p) => {
              const pv = pangvCheck(p)
              const sc = scoreProduct(p, state.weights).score
              return {
                id: p.id,
                ean: <span className="tnum text-zinc-500 text-xs">{p.ean}</span>,
                product: (
                  <div className="flex items-center gap-2.5 min-w-52">
                    <span className="text-xl">{p.emoji}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 text-[13px] truncate">{p.name}</div>
                      <div className="text-[10.5px] text-zinc-400">{p.brand} · {p.unit}</div>
                    </div>
                  </div>
                ),
                category: <Badge tone="zinc" dot={false}>{p.category}</Badge>,
                price: <span className="tnum text-zinc-500">{formatDE(p.price)} €</span>,
                promo: <span className="tnum font-bold text-red-600">{formatDE(p.promo)} €</span>,
                disc: <Badge tone="accent" dot={false}>−{discount(p.price, p.promo)} %</Badge>,
                margin: <span className="tnum text-zinc-700">{p.margin} %</span>,
                velocity: <span className="tnum text-zinc-700">{kfmt(p.velocity)}</span>,
                stock: <span className={cn('tnum font-medium', p.stock < 180 ? 'text-amber-600' : 'text-zinc-700')}>{p.stock}</span>,
                score: <span className={cn('tnum font-bold', sc >= 85 ? 'text-accent-700' : sc >= 70 ? 'text-amber-600' : 'text-zinc-400')}>{sc}</span>,
                pangv: (
                  <span title={pv.items.filter((i) => i.level !== 'ok').map((i) => i.detail).join(' ') || 'Konform'}>
                    {pv.status === 'ok' ? (
                      <Icon name="shield" size={16} className="inline text-emerald-600" />
                    ) : pv.status === 'warnung' ? (
                      <Icon name="alert" size={16} className="inline text-amber-500" />
                    ) : (
                      <Icon name="xc" size={16} className="inline text-red-500" />
                    )}
                  </span>
                ),
              }
            })}
          />
        </div>
        <div className="border-t border-zinc-100 px-5 py-3 text-[11.5px] text-zinc-400 flex justify-between flex-wrap gap-2">
          <span>{list.length} von {state.products.length} Artikeln</span>
          <span>Aktionszeitraum: 24.08.–29.08.2026 · Alle Preise inkl. MwSt.</span>
        </div>
      </Card>
    </div>
  )
}
