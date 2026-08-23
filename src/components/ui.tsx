import React, { useEffect, useMemo } from 'react'
import { cn } from '../lib/utils'
import { Icon } from '../lib/icons'
import { useApp } from '../state/AppState'
import { hashStr, mulberry32 } from '../lib/utils'
import type { StepState } from '../data/types'

export { cn }

// ── Button ───────────────────────────────────────────────────────
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
  size?: 'sm' | 'md' | 'lg'
}

export function Btn({ variant = 'primary', size = 'md', className, children, ...rest }: BtnProps) {
  const v = {
    primary: 'bg-accent-600 text-white hover:bg-accent-700 shadow-sm border border-accent-600',
    secondary: 'bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 border border-transparent',
    danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
    soft: 'bg-accent-50 text-accent-800 border border-accent-200 hover:bg-accent-100',
  }[variant]
  const s = {
    sm: 'text-xs h-8 px-3 gap-1.5 rounded-lg',
    md: 'text-sm h-9.5 px-4 gap-2 rounded-lg',
    lg: 'text-sm h-11 px-5 gap-2 rounded-lg font-semibold',
  }[size]
  return (
    <button
      className={cn('inline-flex items-center justify-center font-medium transition-colors select-none cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-none whitespace-nowrap', v, s, className)}
      {...rest}
    >
      {children}
    </button>
  )
}

// ── Card ─────────────────────────────────────────────────────────
export function Card({ className, children, pad = true }: { className?: string; children: React.ReactNode; pad?: boolean }) {
  return <div className={cn('bg-white rounded-xl border border-zinc-200 shadow-card', pad && 'p-5', className)}>{children}</div>
}

export function SectionHead({ title, sub, right, className }: { title: string; sub?: string; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="text-[15px] font-semibold text-zinc-900 leading-snug">{title}</h3>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

// ── Badge ────────────────────────────────────────────────────────
export type Tone = 'ok' | 'warn' | 'err' | 'info' | 'zinc' | 'accent'

const TONE_CLS: Record<Tone, string> = {
  ok: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  err: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  zinc: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  accent: 'bg-accent-50 text-accent-800 border-accent-200',
}

const TONE_DOT: Record<Tone, string> = {
  ok: 'bg-emerald-500',
  warn: 'bg-amber-500',
  err: 'bg-red-500',
  info: 'bg-sky-500',
  zinc: 'bg-zinc-400',
  accent: 'bg-accent-600',
}

export function Badge({ tone = 'zinc', children, dot = true, className }: { tone?: Tone; children: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap', TONE_CLS[tone], className)}>
      {dot && <span className={cn('size-1.5 rounded-full', TONE_DOT[tone])} />}
      {children}
    </span>
  )
}

export function AiTag({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase text-accent-700 bg-accent-50 border border-accent-200 rounded px-1.5 py-0.5', className)}>
      <Icon name="sparkle" size={11} strokeWidth={2} />
      KI
    </span>
  )
}

// ── KPI Card ─────────────────────────────────────────────────────
export function Kpi({ label, value, sub, delta, points, icon }: { label: string; value: string; sub?: string; delta?: number | null; points?: number[]; icon?: string }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            {icon && <Icon name={icon} size={13} className="text-zinc-400" />}
            {label}
          </div>
          <div className="text-[28px] leading-8 font-bold tnum mt-1.5 text-zinc-900">{value}</div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {delta != null && (
              <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-semibold', delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-zinc-400')}>
                <Icon name={delta > 0 ? 'trend' : delta < 0 ? 'trend' : 'minus'} size={12} className={delta < 0 ? 'rotate-180' : ''} />
                {delta > 0 ? '+' : ''}
                {String(delta).replace('.', ',')} %
              </span>
            )}
            {sub && <span className="text-[11px] text-zinc-500">{sub}</span>}
          </div>
        </div>
        {points && <Sparkline points={points} className="mt-2 shrink-0" />}
      </div>
    </Card>
  )
}

// ── Charts ───────────────────────────────────────────────────────
export function Sparkline({ points, className, stroke = '#1e6f4b', width = 96, height = 30 }: { points: number[]; className?: string; stroke?: string; width?: number; height?: number }) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const step = width / (points.length - 1)
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - 3 - ((p - min) / span) * (height - 6)).toFixed(1)}`).join(' ')
  const area = d + ` L${width},${height} L0,${height} Z`
  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <path d={area} fill={stroke} opacity="0.1" />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function VBars({ labels, values, height = 160, color = '#1e6f4b', format }: { labels: string[]; values: number[]; height?: number; color?: string; format?: (v: number) => string }) {
  const max = Math.max(...values) * 1.12
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group h-full">
            <div className="text-[10px] tnum font-semibold text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">{format ? format(v) : v}</div>
            <div className="w-full max-w-10 rounded-t-md transition-all group-hover:opacity-85" style={{ height: `${(v / max) * 100}%`, background: color }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1.5">
        {labels.map((l, i) => (
          <div key={i} className="flex-1 text-center text-[10px] font-medium text-zinc-500">{l}</div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ labels, series, height = 220 }: { labels: string[]; series: { name: string; color: string; points: number[] }[]; height?: number }) {
  const W = 720
  const H = height
  const padL = 34
  const padB = 22
  const padT = 10
  const all = series.flatMap((s) => s.points)
  const max = Math.max(...all) * 1.08
  const min = Math.min(...all) * 0.92
  const span = max - min || 1
  const x = (i: number, n: number) => padL + (i / (n - 1)) * (W - padL - 8)
  const y = (v: number) => padT + (1 - (v - min) / span) * (H - padT - padB)
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={padL} x2={W - 8} y1={padT + (1 - g) * (H - padT - padB)} y2={padT + (1 - g) * (H - padT - padB)} stroke="#e4e4e7" strokeDasharray="3 4" />
            <text x={padL - 6} y={padT + (1 - g) * (H - padT - padB) + 3} textAnchor="end" fontSize="9" fill="#a1a1aa" className="tnum">
              {Math.round(min + g * span)}
            </text>
          </g>
        ))}
        {series.map((s) => {
          const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i, s.points.length).toFixed(1)},${y(p).toFixed(1)}`).join(' ')
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              {s.points.map((p, i) => (
                <circle key={i} cx={x(i, s.points.length)} cy={y(p)} r="2.6" fill="#fff" stroke={s.color} strokeWidth="1.8" />
              ))}
            </g>
          )
        })}
        {labels.map((l, i) => (
          <text key={l} x={x(i, labels.length)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#71717a" fontWeight="500">
            {l}
          </text>
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600">
            <span className="size-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function HBars({ rows, format }: { rows: { label: string; value: number; color?: string; hint?: string }[]; format?: (v: number) => string }) {
  const max = Math.max(...rows.map((r) => r.value)) || 1
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-zinc-700">{r.label}</span>
            <span className="tnum font-semibold text-zinc-900">{format ? format(r.value) : r.value}</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: r.color ?? '#1e6f4b' }} />
          </div>
          {r.hint && <div className="text-[10px] text-zinc-400 mt-0.5">{r.hint}</div>}
        </div>
      ))}
    </div>
  )
}

export function Donut({ data, size = 168, centerLabel, centerValue }: { data: { label: string; value: number; color: string }[]; size?: number; centerLabel?: string; centerValue?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const R = size / 2 - 10
  const C = 2 * Math.PI * R
  let acc = 0
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="shrink-0">
        {data.map((d) => {
          const frac = d.value / total
          const el = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="16"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-acc * C}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          )
          acc += frac
          return el
        })}
        {centerValue && (
          <text x="50%" y="47%" textAnchor="middle" fontSize="20" fontWeight="700" fill="#18181b" className="tnum">
            {centerValue}
          </text>
        )}
        {centerLabel && (
          <text x="50%" y="58%" textAnchor="middle" fontSize="9" fill="#71717a">
            {centerLabel}
          </text>
        )}
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-zinc-600 flex-1">{d.label}</span>
            <span className="tnum font-semibold text-zinc-900">{d.value} %</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ScoreRing ────────────────────────────────────────────────────
export function ScoreRing({ score, size = 46, label = true }: { score: number; size?: number; label?: boolean }) {
  const R = (size - 8) / 2
  const C = 2 * Math.PI * R
  const color = score >= 85 ? '#1e6f4b' : score >= 70 ? '#d97706' : '#a1a1aa'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} title={`KI-Score ${score}/100`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#e4e4e7" strokeWidth="4" />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${(score / 100) * C} ${C}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      {label && <span className="absolute text-[12px] font-bold tnum" style={{ color }}>{score}</span>}
    </div>
  )
}

// ── QR-Code (deterministische Demo-Darstellung) ──────────────────
export function QRCode({ value, size = 84, className }: { value: string; size?: number; className?: string }) {
  const cells = useMemo(() => {
    const rnd = mulberry32(hashStr(value))
    const N = 21
    const dark: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false))
    const finder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++) {
          dark[oy + y][ox + x] = x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)
        }
    }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) dark[y][x] = rnd() < 0.44
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7)
    return dark
  }, [value])
  const N = 21
  const cell = size / (N + 2)
  let d = ''
  cells.forEach((row, y) => row.forEach((v, x) => { if (v) d += `M${(x + 1) * cell} ${(y + 1) * cell}h${cell}v${cell}h-${cell}z ` }))
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-label={`QR-Code: ${value}`}>
      <rect width={size} height={size} fill="#fff" />
      <path d={d} fill="#18181b" />
    </svg>
  )
}

// ── Formular-Grundlagen ──────────────────────────────────────────
export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-xs font-semibold text-zinc-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-zinc-400 mt-1">{hint}</span>}
    </label>
  )
}

export const inputCls = 'w-full h-9.5 px-3 rounded-lg border border-zinc-300 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent-600/25 focus:border-accent-600 transition-shadow'

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className={cn('inline-flex items-center gap-2.5 cursor-pointer select-none', label && 'group')}>
      <span className={cn('relative inline-flex h-5.5 w-10 rounded-full transition-colors', on ? 'bg-accent-600' : 'bg-zinc-300')}>
        <span className={cn('absolute top-0.5 size-4.5 rounded-full bg-white shadow transition-all', on ? 'left-5' : 'left-0.5')} />
      </span>
      {label && <span className="text-sm text-zinc-700 group-hover:text-zinc-900">{label}</span>}
    </button>
  )
}

// ── Stepper ──────────────────────────────────────────────────────
const STEP_TONE: Record<StepState, { ring: string; text: string; badge: string; label: string }> = {
  done: { ring: 'bg-accent-600 border-accent-600 text-white', text: 'text-zinc-900', badge: 'done', label: 'Abgeschlossen' },
  active: { ring: 'bg-white border-accent-600 text-accent-700', text: 'text-zinc-900', badge: 'active', label: 'In Arbeit' },
  attention: { ring: 'bg-amber-50 border-amber-500 text-amber-600', text: 'text-zinc-900', badge: 'attention', label: 'Prüfen nötig' },
  locked: { ring: 'bg-white border-zinc-300 text-zinc-400', text: 'text-zinc-400', badge: 'locked', label: 'Nicht gestartet' },
}

export function Stepper({ steps }: { steps: { label: string; state: StepState; hint?: string; icon?: string; onClick?: () => void }[] }) {
  const badgeTone: Record<StepState, Tone> = { done: 'ok', active: 'accent', attention: 'warn', locked: 'zinc' }
  const badgeLabel: Record<StepState, string> = { done: 'Abgeschlossen', active: 'In Arbeit', attention: 'Prüfen nötig', locked: 'Nicht gestartet' }
  return (
    <div className="flex items-stretch gap-0 overflow-x-auto">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <div className={cn('self-center h-px flex-1 min-w-6 mx-1', steps[i - 1].state === 'done' ? 'bg-accent-500' : 'bg-zinc-200')} />}
          <button onClick={s.onClick} className="group flex flex-col items-center text-center min-w-28 cursor-pointer">
            <span className={cn('size-11 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-105', STEP_TONE[s.state].ring)}>
              {s.state === 'done' ? (
                <Icon name="check" size={18} strokeWidth={2.4} />
              ) : s.state === 'attention' ? (
                <Icon name="alert" size={18} />
              ) : s.icon ? (
                <Icon name={s.icon} size={18} />
              ) : (
                <span className="text-sm font-bold tnum">{i + 1}</span>
              )}
            </span>
            <span className={cn('mt-2 text-xs font-semibold', STEP_TONE[s.state].text)}>{s.label}</span>
            <Badge tone={badgeTone[s.state]} className="mt-1.5" dot={s.state === 'active'}>
              {badgeLabel[s.state]}
            </Badge>
            {s.hint && <span className="text-[10px] text-zinc-400 mt-1 max-w-32">{s.hint}</span>}
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Modal & Drawer ───────────────────────────────────────────────
export function Modal({ open, onClose, title, sub, children, wide, full }: { open: boolean; onClose: () => void; title?: string; sub?: string; children: React.ReactNode; wide?: boolean; full?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-zinc-950/45" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-pop anim-pop max-h-[92vh] flex flex-col', full ? 'w-[96vw] h-[92vh]' : wide ? 'w-full max-w-3xl' : 'w-full max-w-lg')}>
        {title && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
              {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 cursor-pointer" aria-label="Schließen">
              <Icon name="xc" size={16} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, children, width = 440 }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-zinc-950/35" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 bg-white shadow-pop anim-slide flex flex-col" style={{ width, maxWidth: '94vw' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer" aria-label="Schließen">
            <Icon name="xc" size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  )
}

// ── Tabs ─────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            'h-8 px-3.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5',
            active === t.key ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-800 border border-transparent',
          )}
        >
          {t.label}
          {t.count != null && <span className={cn('text-[10px] font-semibold rounded-full px-1.5 py-px', active === t.key ? 'bg-accent-100 text-accent-800' : 'bg-zinc-200 text-zinc-500')}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

// ── Toast ────────────────────────────────────────────────────────
export function ToastHost() {
  const { state } = useApp()
  const toneIcon: Record<string, { icon: string; cls: string }> = {
    ok: { icon: 'checkc', cls: 'text-emerald-500' },
    info: { icon: 'info', cls: 'text-sky-500' },
    warn: { icon: 'alert', cls: 'text-amber-500' },
    error: { icon: 'alert', cls: 'text-red-500' },
  }
  return (
    <div className="fixed bottom-5 right-5 z-[60] space-y-2 w-[340px]">
      {state.toasts.map((t) => (
        <div key={t.id} className="anim-in flex items-start gap-2.5 bg-zinc-900 text-white rounded-xl px-4 py-3 shadow-pop">
          <Icon name={toneIcon[t.kind].icon} size={17} className={cn('mt-px shrink-0', toneIcon[t.kind].cls)} />
          <div className="text-[13px] leading-snug font-medium">{t.msg}</div>
        </div>
      ))}
    </div>
  )
}

// ── Kleinigkeiten ────────────────────────────────────────────────
export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cn('animate-spin', className)} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Progress({ value, className, tone = 'accent' }: { value: number; className?: string; tone?: 'accent' | 'amber' | 'red' }) {
  const colors = { accent: '#1e6f4b', amber: '#d97706', red: '#dc2626' }
  return (
    <div className={cn('h-2 rounded-full bg-zinc-100 overflow-hidden', className)}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: colors[tone] }} />
    </div>
  )
}

export function EmptyState({ icon = 'box', title, hint, action }: { icon?: string; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="size-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
        <Icon name={icon} size={22} />
      </div>
      <div className="text-sm font-semibold text-zinc-800">{title}</div>
      {hint && <div className="text-xs text-zinc-500 mt-1 max-w-sm">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function DataTable({ columns, rows, onRow, keyOf }: { columns: { key: string; title: React.ReactNode; align?: 'left' | 'right' | 'center'; width?: string }[]; rows: any[]; onRow?: (row: any) => void; keyOf: (row: any) => string }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-zinc-200">
            {columns.map((c) => (
              <th key={c.key} className={cn('text-[10.5px] uppercase tracking-wider font-semibold text-zinc-400 pb-2.5', c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left', c.width)} style={c.width ? { width: c.width } : undefined}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={keyOf(r)} onClick={onRow ? () => onRow(r) : undefined} className={cn('border-b border-zinc-100 last:border-0', onRow && 'cursor-pointer hover:bg-zinc-50/80 transition-colors')}>
              {columns.map((c) => (
                <td key={c.key} className={cn('py-2.5 pr-3 align-middle', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center')}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
