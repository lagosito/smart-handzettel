export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

const eurFmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
export function eur(n: number) {
  return eurFmt.format(n)
}

const numFmt = new Intl.NumberFormat('de-DE')
export function num(n: number) {
  return numFmt.format(Math.round(n))
}

export function kfmt(n: number) {
  if (n >= 1000) return (n / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + 'k'
  return num(n)
}

export function pct(n: number, dec = 1) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + ' %'
}

export function discount(price: number, promo: number) {
  return Math.round((1 - promo / price) * 100)
}

/** Parst deutsche Zahlen: "1.234,56" -> 1234.56 */
export function parseDE(s: string): number {
  if (s == null) return NaN
  const cleaned = String(s).trim().replace(/\s|€/g, '').replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned)
}

export function formatDE(n: number, dec = 2) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0
  return Math.abs(h)
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const KW35_PERIOD = '24.08.–29.08.2026'
export const KW35_PERIOD_LONG = 'Montag, 24.08. bis Samstag, 29.08.2026'
