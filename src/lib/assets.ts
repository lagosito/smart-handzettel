import type { Product, ProductAsset, AssetSource, Category } from '../data/types'

// ── KI-Erlaubte Kategorien ───────────────────────────────────────
export const KI_ALLOWED_CATEGORIES: Category[] = ['Obst & Gemüse', 'Fleisch', 'Backwaren']

/**
 * Prüft ob ein KI-Bild für dieses Produkt erzeugt werden darf.
 * Markenartikel (markenartikel=true) sind gesperrt: Urheberrecht + irreführende Werbung (UWG).
 */
export function canGenerateImage(p: Product): { allowed: boolean; reason?: string } {
  if (p.markenartikel) {
    return { allowed: false, reason: 'KI-Bild nicht zulässig: Markenartikel.' }
  }
  if (!KI_ALLOWED_CATEGORIES.includes(p.category)) {
    return { allowed: false, reason: `KI-Bild nicht zulässig: Kategorie „${p.category}" nicht freigegeben.` }
  }
  return { allowed: true }
}

/**
 * Stub: erzeugt ein KI-Asset. In Produktion hier den echten Generator aufrufen.
 * Symbolbild immer true bei KI-Generierung (enforced, nicht per Convention).
 */
export async function generateAsset(p: Product): Promise<ProductAsset> {
  await new Promise((r) => setTimeout(r, 100))
  return {
    productId: p.id,
    src: undefined,
    source: 'ki',
    symbolbild: true,
    note: 'KI-generiertes Symbolbild',
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Zusammenfassung der Asset-Quellen für die Freigabe-Anzeige.
 */
export function assetSummary(assets: ProductAsset[]): {
  lieferant: number
  optimiert: number
  ki: number
  total: number
} {
  let lieferant = 0, optimiert = 0, ki = 0
  for (const a of assets) {
    if (a.source === 'lieferant') lieferant++
    else if (a.source === 'optimiert') optimiert++
    else if (a.source === 'ki') ki++
  }
  return { lieferant, optimiert, ki, total: assets.length }
}
