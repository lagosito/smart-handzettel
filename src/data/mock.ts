import type {
  Bundle,
  Channel,
  Integration,
  Product,
  Recipe,
  SegmentKey,
  Category,
} from './types'

export const RETAILER = {
  name: 'FrischeMarkt',
  claim: 'Frisch. Nah. Günstig.',
  region: 'Region Nord · 214 Märkte',
  user: { name: 'Lena Berger', role: 'Campaign Managerin', team: 'Trade Marketing' },
  campaign: { kw: 35, name: 'Handzettel KW 35', period: '24.08.–29.08.2026', periodLong: 'Montag, 24.08. bis Samstag, 29.08.2026' },
}

const P = (p: Product): Product => p

export const PRODUCTS: Product[] = [
  // ── Obst & Gemüse ──────────────────────────────────────────────
  P({ id: 'banane', name: 'Bio-Bananen', brand: 'NaturWert', markenartikel: false, category: 'Obst & Gemüse', ean: '42101001', unit: '1 kg', price: 2.29, promo: 1.89, base: '1,89 €/kg', margin: 26, velocity: 2400, stock: 860, demand: 74, season: 55, regionality: 40, region: 'Bundesweit', emoji: '🍌', segments: ['familien', 'stamm'], period: '24.08.–29.08.', bio: true }),
  P({ id: 'cherrytomaten', name: 'Cherrytomaten', brand: 'Rosella', markenartikel: false, category: 'Obst & Gemüse', ean: '42101007', unit: '250-g-Schale', price: 1.49, promo: 0.99, base: '3,96 €/kg', margin: 31, velocity: 980, stock: 420, demand: 82, season: 88, regionality: 42, region: 'West', emoji: '🍅', segments: ['veggie'], period: '24.08.–29.08.' }),
  P({ id: 'apfel', name: 'Elstar Äpfel, regional', brand: 'LandObst Nord', markenartikel: false, category: 'Obst & Gemüse', ean: '42101011', unit: '1,5-kg-Beutel', price: 2.99, promo: 2.49, base: '1,66 €/kg', margin: 29, velocity: 1340, stock: 940, demand: 71, season: 62, regionality: 95, region: 'Nord', emoji: '🍎', segments: ['familien', 'stamm'], period: '24.08.–29.08.' }),
  P({ id: 'eisberg', name: 'Eisbergsalat', brand: 'GartenFrisch', markenartikel: false, category: 'Obst & Gemüse', ean: '42101015', unit: '1 Stück', price: 1.19, promo: 0.79, base: '0,79 €/Stück', margin: 24, velocity: 760, stock: 150, demand: 68, season: 90, regionality: 55, region: 'Süd', emoji: '🥬', segments: ['preis', 'veggie'], period: '24.08.–29.08.' }),
  P({ id: 'kartoffel', name: 'Kartoffeln, festkochend', brand: 'Feldfrisch', markenartikel: false, category: 'Obst & Gemüse', ean: '42101019', unit: '2,5-kg-Sack', price: 2.79, promo: 1.99, base: '0,80 €/kg', margin: 33, velocity: 1890, stock: 1200, demand: 66, season: 58, regionality: 80, region: 'Nord', emoji: '🥔', segments: ['familien', 'veggie'], period: '24.08.–29.08.' }),
  P({ id: 'zucchini', name: 'Zucchini', brand: 'Rosella', markenartikel: false, category: 'Obst & Gemüse', ean: '42101023', unit: '500 g', price: 1.49, promo: 1.19, base: '2,38 €/kg', margin: 30, velocity: 690, stock: 380, demand: 79, season: 86, regionality: 60, region: 'Süd', emoji: '🥒', segments: ['veggie'], period: '24.08.–29.08.' }),

  // ── Fleisch ────────────────────────────────────────────────────
  P({ id: 'hack', name: 'Rinderhackfleisch', brand: 'Landfleisch', markenartikel: false, category: 'Fleisch', ean: '42102004', unit: '500-g-Packung', price: 4.49, promo: 3.59, base: '7,18 €/kg', margin: 34, velocity: 1620, stock: 540, demand: 88, season: 71, regionality: 65, region: 'Bundesweit', emoji: '🥩', img: '/img/hero-hack.jpg', segments: ['familien', 'stamm'], period: '24.08.–29.08.' }),
  P({ id: 'filet', name: 'Grill-Schweinefilet, pfeffermariniert', brand: 'Landfleisch', markenartikel: false, category: 'Fleisch', ean: '42102009', unit: '400 g', price: 5.99, promo: 4.79, base: '11,98 €/kg', margin: 38, velocity: 640, stock: 210, demand: 91, season: 95, regionality: 50, region: 'West', emoji: '🍖', segments: ['grill'], period: '24.08.–29.08.' }),
  P({ id: 'haehnchen', name: 'Hähnchenbrustfilet', brand: 'Gut Geflügel', markenartikel: false, category: 'Fleisch', ean: '42102013', unit: '500 g', price: 5.49, promo: 4.29, base: '8,58 €/kg', margin: 36, velocity: 1210, stock: 460, demand: 85, season: 80, regionality: 45, region: 'Nord', emoji: '🍗', segments: ['grill', 'singles'], period: '24.08.–29.08.' }),
  P({ id: 'grillwurst', name: 'Thüringer Grillwurst', brand: 'Wurst König', markenartikel: false, category: 'Fleisch', ean: '42102017', unit: '400 g', price: 2.99, promo: 2.49, base: '6,23 €/kg', margin: 35, velocity: 1480, stock: 620, demand: 94, season: 97, regionality: 70, region: 'Ost', emoji: '🌭', segments: ['grill'], period: '24.08.–29.08.' }),
  P({ id: 'mettenden', name: 'Mettenden, 2 Stück', brand: 'Wurst König', markenartikel: false, category: 'Fleisch', ean: '42102021', unit: '2 × 90 g', price: 2.69, promo: 1.99, base: '11,06 €/kg', margin: 32, velocity: 840, stock: 260, demand: 86, season: 93, regionality: 60, region: 'Ost', emoji: '🥓', segments: ['grill'], period: '24.08.–29.08.' }),
  P({ id: 'steak', name: 'Rumpsteak', brand: 'Landfleisch Premium', markenartikel: false, category: 'Fleisch', ean: '42102025', unit: '500 g', price: 8.99, promo: 6.99, base: '13,98 €/kg', margin: 41, velocity: 410, stock: 140, demand: 89, season: 91, regionality: 40, region: 'West', emoji: '🥩', segments: ['grill'], period: '24.08.–29.08.' }),

  // ── Molkerei ───────────────────────────────────────────────────
  P({ id: 'milch', name: 'Frische Vollmilch 3,5 %', brand: 'Molkerei Ammerland', markenartikel: false, category: 'Molkerei', ean: '42103002', unit: '1-l-Flasche', price: 1.29, promo: 0.99, base: '0,99 €/l', margin: 18, velocity: 3200, stock: 2100, demand: 70, season: 55, regionality: 85, region: 'Nord', emoji: '🥛', segments: ['familien', 'stamm'], period: '24.08.–29.08.' }),
  P({ id: 'butter', name: 'Deutsche Markenbutter', brand: 'Molkerei Ammerland', markenartikel: false, category: 'Molkerei', ean: '42103006', unit: '250-g-Stück', price: 2.19, promo: 1.79, base: '7,16 €/kg', margin: 27, velocity: 1560, stock: 890, demand: 64, season: 50, regionality: 55, region: 'Bundesweit', emoji: '🧈', segments: ['familien'], period: '24.08.–29.08.' }),
  P({ id: 'gouda', name: 'Gouda jung, am Stück', brand: 'Käsehof', markenartikel: false, category: 'Molkerei', ean: '42103010', unit: '400 g', price: 3.49, promo: 2.79, base: '6,98 €/kg', margin: 33, velocity: 1290, stock: 700, demand: 69, season: 54, regionality: 45, region: 'Bundesweit', emoji: '🧀', segments: ['familien', 'veggie'], period: '24.08.–29.08.' }),
  P({ id: 'skyr', name: 'Skyr Natur, Protein', brand: 'NordMilch', markenartikel: false, category: 'Molkerei', ean: '42103014', unit: '500-g-Becher', price: 1.69, promo: 1.29, base: '2,58 €/kg', margin: 38, velocity: 1150, stock: 480, demand: 92, season: 66, regionality: 35, region: 'West', emoji: '🥣', segments: ['singles'], period: '24.08.–29.08.', bio: true }),
  P({ id: 'schmand', name: 'Schmand', brand: 'Molkerei Ammerland', markenartikel: false, category: 'Molkerei', ean: '42103018', unit: '200-g-Becher', price: 0.85, promo: 0.69, base: '3,45 €/kg', margin: 35, velocity: 640, stock: 330, demand: 58, season: 48, regionality: 40, region: 'Bundesweit', emoji: '🫙', segments: ['familien'], period: '24.08.–29.08.' }),
  P({ id: 'feta', name: 'Hirtenkäse 45 % i. Tr.', brand: 'Hellasa', markenartikel: false, category: 'Molkerei', ean: '42103022', unit: '200-g-Packung', price: 1.99, promo: 1.49, base: '7,45 €/kg', margin: 36, velocity: 880, stock: 410, demand: 83, season: 84, regionality: 30, region: 'Süd', emoji: '🐑', segments: ['veggie', 'singles'], period: '24.08.–29.08.' }),

  // ── Getränke ───────────────────────────────────────────────────
  P({ id: 'cola', name: 'Cola', brand: 'FritzBräu', markenartikel: false, category: 'Getränke', ean: '42104001', unit: '1,5-l-PET-Flasche', price: 1.49, promo: 0.99, base: '0,66 €/l', deposit: 0.25, margin: 22, velocity: 2600, stock: 1500, demand: 87, season: 84, regionality: 30, region: 'Bundesweit', emoji: '🥤', segments: ['familien'], period: '24.08.–29.08.' }),
  P({ id: 'osaft', name: 'Orangensaft, direkt', brand: 'SunValley', markenartikel: false, category: 'Getränke', ean: '42104005', unit: '1-l-Flasche', price: 1.99, promo: 1.49, base: '1,49 €/l', margin: 28, velocity: 1420, stock: 810, demand: 72, season: 62, regionality: 25, region: 'Bundesweit', emoji: '🧃', segments: ['familien'], period: '24.08.–29.08.' }),
  P({ id: 'pils', name: 'Pils, Kasten', brand: 'Nordbräu', markenartikel: false, category: 'Getränke', ean: '42104009', unit: '20 × 0,5 l', price: 12.99, promo: 9.99, base: '1,00 €/l', deposit: 3.1, uvp: 13.99, margin: 30, velocity: 540, stock: 300, demand: 90, season: 92, regionality: 75, region: 'Nord', emoji: '🍺', segments: ['grill', 'stamm'], period: '24.08.–29.08.' }),
  P({ id: 'wasser', name: 'Mineralwasser, medium', brand: 'QuellRein', markenartikel: false, category: 'Getränke', ean: '42104013', unit: '6 × 1,5 l', price: 3.99, promo: 2.99, base: '0,33 €/l', deposit: 0.9, margin: 24, velocity: 1750, stock: 980, demand: 89, season: 87, regionality: 30, region: 'Bundesweit', emoji: '💧', segments: ['familien', 'preis'], period: '24.08.–29.08.' }),
  P({ id: 'apfelsaft', name: 'Bio-Apfelsaft, regional', brand: 'LandObst Nord', markenartikel: false, category: 'Getränke', ean: '42104017', unit: '1-l-Flasche', price: 2.29, promo: 1.89, base: '1,89 €/l', margin: 31, velocity: 620, stock: 340, demand: 67, season: 60, regionality: 90, region: 'Nord', emoji: '🍏', segments: ['stamm', 'veggie'], period: '24.08.–29.08.', bio: true }),

  // ── Tiefkühl ───────────────────────────────────────────────────
  P({ id: 'pizza', name: 'Pizza Salami', brand: 'Ristorante Casa', markenartikel: false, category: 'Tiefkühl', ean: '42105003', unit: '335-g-Packung', price: 1.99, promo: 1.49, base: '4,45 €/kg', margin: 30, velocity: 1980, stock: 1150, demand: 81, season: 57, regionality: 20, region: 'Bundesweit', emoji: '🍕', segments: ['familien', 'singles'], period: '24.08.–29.08.' }),
  P({ id: 'spinat', name: 'Rahmspinat', brand: 'FrostaGreen', markenartikel: false, category: 'Tiefkühl', ean: '42105007', unit: '450-g-Packung', price: 1.19, promo: 0.89, base: '1,98 €/kg', margin: 29, velocity: 540, stock: 290, demand: 55, season: 44, regionality: 20, region: 'Bundesweit', emoji: '🍃', segments: ['veggie'], period: '24.08.–29.08.' }),
  P({ id: 'pommes', name: 'Pommes frites', brand: 'FrostaGreen', markenartikel: false, category: 'Tiefkühl', ean: '42105011', unit: '1-kg-Beutel', price: 1.89, promo: 1.39, base: '1,39 €/kg', margin: 27, velocity: 1640, stock: 920, demand: 77, season: 74, regionality: 20, region: 'Bundesweit', emoji: '🍟', segments: ['familien'], period: '24.08.–29.08.' }),
  P({ id: 'eis', name: 'Vanilleeis', brand: 'Eisglück', markenartikel: false, category: 'Tiefkühl', ean: '42105015', unit: '1-l-Becher', price: 1.99, promo: 1.49, base: '1,49 €/l', margin: 28, velocity: 890, stock: 470, demand: 88, season: 96, regionality: 25, region: 'Bundesweit', emoji: '🍦', segments: ['familien'], period: '24.08.–29.08.' }),

  // ── Backwaren ──────────────────────────────────────────────────
  P({ id: 'brot', name: 'Mehrkornbrot, Ofenfrisch', brand: 'Bäckerei Hansen', markenartikel: false, category: 'Backwaren', ean: '42106002', unit: '750-g-Laib', price: 1.99, promo: 1.59, base: '2,12 €/kg', margin: 25, velocity: 1730, stock: 780, demand: 73, season: 52, regionality: 88, region: 'Nord', emoji: '🍞', segments: ['familien', 'stamm'], period: '24.08.–29.08.' }),
  P({ id: 'croissant', name: 'Butter-Croissants', brand: 'Bäckerei Hansen', markenartikel: false, category: 'Backwaren', ean: '42106006', unit: '4er-Packung', price: 1.49, promo: 0.99, base: '0,99 €/Packung', margin: 30, velocity: 1240, stock: 560, demand: 75, season: 58, regionality: 50, region: 'West', emoji: '🥐', segments: ['singles', 'familien'], period: '24.08.–29.08.' }),
  P({ id: 'toast', name: 'Vollkorn-Toast', brand: 'GoldenCrust', markenartikel: false, category: 'Backwaren', ean: '42106010', unit: '500-g-Packung', price: 0.99, promo: 0.79, base: '1,58 €/kg', margin: 20, velocity: 1510, stock: 840, demand: 62, season: 49, regionality: 25, region: 'Bundesweit', emoji: '🥪', segments: ['preis', 'singles'], period: '24.08.–29.08.' }),
  P({ id: 'baguette', name: 'Baguette, 2 Stück', brand: 'Bäckerei Hansen', markenartikel: false, category: 'Backwaren', ean: '42106014', unit: '2 × 150 g', price: 1.29, promo: 0.99, base: '3,30 €/kg', margin: 28, velocity: 1110, stock: 620, demand: 84, season: 85, regionality: 60, region: 'Nord', emoji: '🥖', segments: ['grill', 'familien'], period: '24.08.–29.08.' }),

  // ── Feinkost ───────────────────────────────────────────────────
  P({ id: 'penne', name: 'Penne Rigate, Hartweizen', brand: 'Pastaria', markenartikel: false, category: 'Feinkost', ean: '42107004', unit: '500-g-Packung', price: 0.99, promo: 0.79, base: '1,58 €/kg', margin: 34, velocity: 1380, stock: 760, demand: 70, season: 53, regionality: 20, region: 'Bundesweit', emoji: '🍝', segments: ['familien', 'singles', 'preis'], period: '24.08.–29.08.' }),
  P({ id: 'bbq', name: 'BBQ-Sauce, rauchig', brand: 'SmokyJoe', markenartikel: false, category: 'Feinkost', ean: '42107008', unit: '300-ml-Flasche', price: 1.89, promo: 1.49, base: '4,97 €/l', margin: 39, velocity: 520, stock: 240, demand: 93, season: 94, regionality: 25, region: 'Bundesweit', emoji: '🥫', segments: ['grill'], period: '24.08.–29.08.' }),
  P({ id: 'kartoffelsalat', name: 'Kartoffelsalat, klassisch', brand: 'Feinkost Meyer', markenartikel: false, category: 'Feinkost', ean: '42107012', unit: '500-g-Becher', price: 1.79, promo: 1.49, base: '2,98 €/kg', margin: 31, velocity: 610, stock: 280, demand: 87, season: 89, regionality: 45, region: 'Nord', emoji: '🥗', segments: ['grill', 'familien'], period: '24.08.–29.08.' }),

  // ── Snacks ─────────────────────────────────────────────────────
  P({ id: 'chips', name: 'Kartoffelchips Paprika', brand: 'Crunchy', markenartikel: false, category: 'Snacks', ean: '42108101', unit: '200-g-Tüte', price: 1.59, promo: 1.19, base: '5,95 €/kg', margin: 42, velocity: 1500, stock: 820, demand: 85, season: 76, regionality: 20, region: 'Bundesweit', emoji: '🌶️', segments: ['preis', 'singles'], period: '24.08.–29.08.' }),
  P({ id: 'schoko', name: 'Vollmilch-Schokolade', brand: 'AlpenGold', markenartikel: false, category: 'Snacks', ean: '42108105', unit: '100-g-Tafel', price: 0.99, promo: 0.69, base: '6,90 €/kg', margin: 35, velocity: 1350, stock: 740, demand: 66, season: 51, regionality: 15, region: 'Bundesweit', emoji: '🍫', segments: ['singles', 'preis'], period: '24.08.–29.08.' }),
  P({ id: 'nuesse', name: 'Studentenfutter', brand: 'NussWerk', markenartikel: false, category: 'Snacks', ean: '42108109', unit: '200-g-Beutel', price: 1.99, promo: 1.59, base: '7,95 €/kg', margin: 37, velocity: 460, stock: 210, demand: 61, season: 46, regionality: 15, region: 'West', emoji: '🥜', segments: ['veggie', 'singles'], period: '24.08.–29.08.' }),

  // ── Haushalt ───────────────────────────────────────────────────
  P({ id: 'spueli', name: 'Spülmittel, Zitrone', brand: 'ReinKlar', markenartikel: false, category: 'Haushalt', ean: '42109103', unit: '500-ml-Flasche', price: 1.79, promo: 1.29, base: '2,58 €/l', margin: 44, velocity: 780, stock: 560, demand: 52, season: 40, regionality: 10, region: 'Bundesweit', emoji: '🧴', segments: ['familien', 'preis'], period: '24.08.–29.08.' }),
  P({ id: 'kuechenrolle', name: 'Küchenrolle, 3-lagig', brand: 'PapierWerk', markenartikel: false, category: 'Haushalt', ean: '42109107', unit: '2er-Packung', price: 2.49, promo: 1.99, base: '1,00 €/Rolle', margin: 40, velocity: 690, stock: 430, demand: 50, season: 38, regionality: 10, region: 'Bundesweit', emoji: '🧻', segments: ['familien'], period: '24.08.–29.08.' }),
]

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!

// ── Segmente ─────────────────────────────────────────────────────
export interface SegmentDef {
  key: SegmentKey
  label: string
  desc: string
  icon: string
  hero: string[]
  recipeId: string
  bundleId: string
}

export const SEGMENTS: SegmentDef[] = [
  { key: 'familien', label: 'Familien', desc: 'Großpackungen, Wochenplanung, kinderfreundlich', icon: 'users', hero: ['pizza', 'hack', 'kartoffel', 'milch'], recipeId: 'pizza-night', bundleId: 'fruehstueck' },
  { key: 'singles', label: 'Singles', desc: 'Kleine Portionen, schnelle Küche, Protein', icon: 'star', hero: ['skyr', 'croissant', 'pizza', 'haehnchen'], recipeId: 'pasta', bundleId: 'pasta-bundle' },
  { key: 'preis', label: 'Preisbewusste', desc: 'Höchste Rabatte, Grundpreis-Champions', icon: 'zap', hero: ['toast', 'eisberg', 'chips', 'wasser'], recipeId: 'ofengemuese', bundleId: 'movie' },
  { key: 'veggie', label: 'Vegetarisch', desc: 'Pflanzlich frisch, Käse & Gemüse', icon: 'sun', hero: ['zucchini', 'feta', 'cherrytomaten', 'eisberg'], recipeId: 'ofengemuese', bundleId: 'pasta-bundle' },
  { key: 'grill', label: 'Grillfans', desc: 'BBQ-Saison, Fleisch & Bier', icon: 'zap', hero: ['grillwurst', 'filet', 'pils', 'steak'], recipeId: 'spiesse', bundleId: 'grill-bundle' },
  { key: 'stamm', label: 'Stammkunden', desc: 'Regionale Lieblinge, bewährte Qualität', icon: 'star', hero: ['hack', 'apfel', 'brot', 'apfelsaft'], recipeId: 'pasta', bundleId: 'fruehstueck' },
]

// ── Rezepte ──────────────────────────────────────────────────────
export const RECIPES: Recipe[] = [
  {
    id: 'pasta',
    title: 'Mediterrane Gemüse-Pasta',
    desc: 'Frische Zucchini und Cherrytomaten aus dem Wochenangebot – in 25 Minuten auf dem Tisch.',
    time: '25 Min.',
    difficulty: 'Einfach',
    servings: 4,
    kcal: '540 kcal',
    img: '/img/recipe-pasta.jpg',
    emoji: '🍝',
    ingredients: [
      { productId: 'penne', name: 'Penne Rigate', amount: '500 g' },
      { productId: 'zucchini', name: 'Zucchini', amount: '2 Stück' },
      { productId: 'cherrytomaten', name: 'Cherrytomaten', amount: '250 g' },
      { productId: 'feta', name: 'Hirtenkäse', amount: '200 g' },
      { productId: 'schmand', name: 'Schmand', amount: '100 g' },
      { name: 'Olivenöl, Knoblauch, Basilikum', amount: 'nach Belieben' },
    ],
    steps: ['Penne in Salzwasser bissfest kochen.', 'Zucchini würfeln, Tomaten halbieren, mit Knoblauch anbraten.', 'Schmand unterrühren, mit Pasta mischen.', 'Mit Hirtenkäse und Basilikum servieren.'],
    tags: ['Vegetarisch', 'Familie', 'Schnell'],
    segments: ['familien', 'veggie', 'singles', 'stamm'],
  },
  {
    id: 'ofengemuese',
    title: 'Ofengemüse mit Hirtenkäse',
    desc: 'Ein Blech, wenig Aufwand: Kartoffeln, Zucchini und Tomaten goldbraun überbacken.',
    time: '40 Min.',
    difficulty: 'Einfach',
    servings: 4,
    kcal: '460 kcal',
    emoji: '🥘',
    ingredients: [
      { productId: 'kartoffel', name: 'Festkochende Kartoffeln', amount: '1 kg' },
      { productId: 'zucchini', name: 'Zucchini', amount: '2 Stück' },
      { productId: 'cherrytomaten', name: 'Cherrytomaten', amount: '250 g' },
      { productId: 'feta', name: 'Hirtenkäse', amount: '200 g' },
      { name: 'Olivenöl, Rosmarin, Salz', amount: 'nach Belieben' },
    ],
    steps: ['Kartoffeln vierteln, in Öl und Rosmarin wenden.', '25 Min. bei 200 °C vorbacken.', 'Gemüse zugeben, weitere 15 Min. garen.', 'Hirtenkäse darüberbröseln und überbacken.'],
    tags: ['Vegetarisch', 'Ofengericht'],
    segments: ['veggie', 'preis', 'familien'],
  },
  {
    id: 'spiesse',
    title: 'Hähnchen-Spieße mit Kartoffelsalat',
    desc: 'Marinierte Hähnchen-Spieße vom Grill – dazu Baguette und klassischer Kartoffelsalat.',
    time: '35 Min.',
    difficulty: 'Mittel',
    servings: 4,
    kcal: '620 kcal',
    img: '/img/recipe-spiesse.jpg',
    emoji: '🍢',
    ingredients: [
      { productId: 'haehnchen', name: 'Hähnchenbrustfilet', amount: '500 g' },
      { productId: 'bbq', name: 'BBQ-Sauce', amount: '150 ml' },
      { productId: 'baguette', name: 'Baguette', amount: '2 Stück' },
      { productId: 'kartoffelsalat', name: 'Kartoffelsalat', amount: '500 g' },
      { name: 'Paprikapulver, Öl', amount: 'nach Belieben' },
    ],
    steps: ['Hähnchen würfeln und in BBQ-Sauce marinieren.', 'Auf Spieße stecken, 12–14 Min. grillen.', 'Baguette mitgrillen.', 'Mit Kartoffelsalat und restlicher Sauce servieren.'],
    tags: ['Grillen', 'Sommer'],
    segments: ['grill', 'familien'],
  },
  {
    id: 'pizza-night',
    title: 'Familien-Pizzaabend Deluxe',
    desc: 'Der Freitags-Klassiker: Pizza, Pommes und Vanilleeis – alles diese Woche im Angebot.',
    time: '20 Min.',
    difficulty: 'Einfach',
    servings: 4,
    kcal: '780 kcal',
    emoji: '🍕',
    ingredients: [
      { productId: 'pizza', name: 'Pizza Salami', amount: '2 Stück' },
      { productId: 'pommes', name: 'Pommes frites', amount: '500 g' },
      { productId: 'cola', name: 'Cola', amount: '1,5 l' },
      { productId: 'eis', name: 'Vanilleeis', amount: '1 l' },
    ],
    steps: ['Ofen auf 220 °C vorheizen.', 'Pizza und Pommes parallel backen.', 'Gemeinsam servieren – Eis zum Nachtisch.'],
    tags: ['Familie', 'Kinder'],
    segments: ['familien'],
  },
]

export const recipeById = (id: string | null | undefined) => RECIPES.find((r) => r.id === id)

// ── Bundles ──────────────────────────────────────────────────────
export const BUNDLES: Bundle[] = [
  { id: 'grill-bundle', title: 'Grillabend für 4 Personen', desc: 'Alles für den Spätsommer-Grillabend – aufeinander abgestimmt.', productIds: ['grillwurst', 'baguette', 'bbq', 'kartoffelsalat', 'pils'], bundlePrice: 14.99, basketEffect: 21, segments: ['grill'], badge: 'Top-Bundle KW 35' },
  { id: 'pasta-bundle', title: 'Pasta-Night', desc: 'Mediterran kochen für unter 5 Euro.', productIds: ['penne', 'cherrytomaten', 'feta', 'osaft'], bundlePrice: 4.29, basketEffect: 12, segments: ['singles', 'veggie', 'familien'] },
  { id: 'fruehstueck', title: 'Familien-Frühstück', desc: 'Der perfekte Sonntagmorgen für die ganze Familie.', productIds: ['brot', 'croissant', 'osaft', 'butter'], bundlePrice: 4.99, basketEffect: 14, segments: ['familien', 'stamm'] },
  { id: 'movie', title: 'Movie-Night', desc: 'Snacks & Süßes für den Serienabend.', productIds: ['chips', 'cola', 'eis', 'schoko'], bundlePrice: 3.79, basketEffect: 9, segments: ['singles', 'preis', 'familien'], ki: false },
]

export const bundleById = (id: string | null | undefined) => BUNDLES.find((b) => b.id === id)
export const bundleSingleSum = (b: Bundle) => b.productIds.reduce((s, id) => s + (byId(id)?.promo ?? 0), 0)

// ── Kanäle ───────────────────────────────────────────────────────
export const CHANNELS: Channel[] = [
  { id: 'print', name: 'Print PDF', icon: 'printer', desc: 'Druckfertiger Handzettel, 8 Seiten, DIN A4', format: 'PDF/X-4 · 300 dpi' },
  { id: 'web', name: 'Interaktives Web', icon: 'globe', desc: 'Blätterbarer Web-Handzettel mit Warenkorb', format: 'Responsive HTML' },
  { id: 'app', name: 'App', icon: 'phone', desc: 'FrischeMarkt App – Angebote & Merkliste', format: 'iOS / Android' },
  { id: 'email', name: 'E-Mail', icon: 'mail', desc: 'Newsletter an 182.400 Abonnenten', format: 'HTML-Template' },
  { id: 'push', name: 'Push', icon: 'bell', desc: 'Push-Kampagne „Neue Angebote ab Montag“', format: 'App-Push' },
  { id: 'social', name: 'Social', icon: 'share', desc: 'Instagram & Facebook – Top-Angebote', format: '9:16 + 1:1' },
  { id: 'ooh', name: 'OOH / Plakat', icon: 'board', desc: 'Großflächen an 38 Standorten', format: '18/1 Bogen' },
  { id: 'dooh', name: 'DooH', icon: 'tv', desc: 'Digitale City-Light-Boards, Region Nord', format: '1080×1920' },
  { id: 'instore', name: 'In-Store', icon: 'store', desc: 'ESL-Preisschilder & Screens in 214 Märkten', format: 'ESL API v3' },
]

// ── Integrationen ────────────────────────────────────────────────
export const INTEGRATIONS: Integration[] = [
  { id: 'excel', name: 'Excel', icon: 'sheet', desc: 'Arbeitsmappen (.xlsx) aus dem Einkauf', status: 'verbunden', lastSync: '23.08.2026, 06:12', detail: '142 Spalten gemappt · Auto-Import Mo/Do' },
  { id: 'gsheets', name: 'Google Sheets', icon: 'sheet', desc: 'Geteilte Aktionslisten der Region', status: 'verbunden', lastSync: '23.08.2026, 06:12', detail: 'Sheet „AKTIONSPLAN_KW35“ · Live-Sync' },
  { id: 'm365', name: 'Microsoft 365', icon: 'grid', desc: 'SharePoint-Bibliothek & Teams-Freigaben', status: 'verbunden', lastSync: '22.08.2026, 18:40', detail: 'SSO aktiv · Dokumente „Handzettel“' },
  { id: 'sap', name: 'SAP S/4HANA', icon: 'db', desc: 'Artikelstamm, Preise & Bestände', status: 'fehler', lastSync: '21.08.2026, 03:02', detail: 'Authentifizierung abgelaufen – Zugang erneuern' },
  { id: 'erp', name: 'ERP (proALPHA)', icon: 'db', desc: 'Warenwirtschaft Region Nord', status: 'getrennt', lastSync: null, detail: 'Noch nicht konfiguriert' },
  { id: 'api', name: 'REST API', icon: 'api', desc: 'Direktanbindung PIM / Warenwirtschaft', status: 'verbunden', lastSync: '23.08.2026, 06:00', detail: 'API-Key aktiv · 4.812 Datensätze' },
]

// ── Kampagnen ────────────────────────────────────────────────────
export const CAMPAIGNS = [
  { kw: 36, name: 'Handzettel KW 36', period: '31.08.–05.09.2026', status: 'entwurf' as const, offers: 0, note: 'Briefing offen' },
  { kw: 35, name: 'Handzettel KW 35', period: '24.08.–29.08.2026', status: 'in_pruefung' as const, offers: 32, note: 'Aktuelle Kampagne' },
  { kw: 34, name: 'Handzettel KW 34', period: '18.08.–23.08.2026', status: 'archiv' as const, offers: 39, note: 'Veröffentlicht · 84.200 Öffnungen' },
  { kw: 33, name: 'Handzettel KW 33', period: '11.08.–16.08.2026', status: 'archiv' as const, offers: 36, note: 'Veröffentlicht · 79.600 Öffnungen' },
]

// ── Analytics ────────────────────────────────────────────────────
export const ANALYTICS = {
  kpis: {
    opens: { value: 84200, delta: 18.2, label: 'Flyer-Öffnungen' },
    clicks: { value: 212480, delta: 11.4, label: 'Produktklicks' },
    conversion: { value: 6.8, delta: 0.9, label: 'Conversion' },
    revenue: { value: 1240000, delta: 12.7, label: 'Umsatz (attribuiert)' },
    basket: { value: 47.3, delta: 5.6, label: 'Ø Warenkorb' },
  },
  opensByDay: {
    labels: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    series: [14200, 12800, 10100, 9600, 11800, 15600, 10100],
  },
  channelShare: [
    { label: 'App', value: 34, color: '#1e6f4b' },
    { label: 'Web', value: 28, color: '#519f77' },
    { label: 'E-Mail', value: 18, color: '#84bf9f' },
    { label: 'Push', value: 12, color: '#f59e0b' },
    { label: 'Print / QR', value: 8, color: '#a1a1aa' },
  ],
  topOffers: [
    { id: 'eis', clicks: 21400, ctr: 8.4, revenue: 9.1 },
    { id: 'hack', clicks: 19800, ctr: 7.9, revenue: 12.4 },
    { id: 'pils', clicks: 18200, ctr: 7.6, revenue: 15.8 },
    { id: 'pizza', clicks: 16900, ctr: 7.1, revenue: 7.2 },
    { id: 'milch', clicks: 14100, ctr: 6.2, revenue: 5.1 },
    { id: 'skyr', clicks: 12800, ctr: 5.9, revenue: 4.4 },
  ],
  recipeEngagement: { views: 31400, addToList: 8600, rate: 27.4, top: 'Mediterrane Gemüse-Pasta' },
  bundleEngagement: { views: 18900, purchases: 8240, rate: 43.6, top: 'Grillabend für 4 Personen', uplift: 21 },
}

// ── Trends ───────────────────────────────────────────────────────
export const TREND_SOURCES = [
  { id: 'gtrends', name: 'Google Trends', desc: 'Suchinteresse Lebensmittel, 12 Wochen', icon: 'trend', points: [42, 44, 47, 46, 52, 55, 58, 62, 66, 71, 79, 84], status: 'live' as const },
  { id: 'off', name: 'Open Food Facts', desc: 'Produktdaten, Labels & Inhaltsstoffe', icon: 'db', points: [30, 32, 31, 34, 36, 35, 38, 40, 42, 41, 44, 47], status: 'live' as const },
  { id: 'social', name: 'Social & Rezept-Signale', desc: 'Instagram, TikTok, Chefkoch-Suchvolumen', icon: 'share', points: [50, 48, 55, 61, 58, 66, 71, 69, 76, 82, 88, 91], status: 'live' as const },
  { id: 'pos', name: 'Eigene Verkaufsdaten', desc: 'POS-Daten 214 Märkte, Region Nord', icon: 'store', points: [60, 62, 59, 63, 65, 64, 68, 70, 72, 73, 76, 78], status: 'live' as const },
]

export const SEASONAL = {
  labels: ['KW 29', 'KW 30', 'KW 31', 'KW 32', 'KW 33', 'KW 34', 'KW 35', 'KW 36'],
  series: [
    { name: 'Grillen & BBQ', color: '#dc2626', points: [100, 96, 92, 90, 86, 84, 82, 74] },
    { name: 'Getränke & Eis', color: '#0284c7', points: [88, 90, 94, 81, 79, 86, 90, 72] },
    { name: 'Obst & Gemüse', color: '#1e6f4b', points: [72, 74, 75, 77, 80, 82, 84, 86] },
    { name: 'Backwaren', color: '#b45309', points: [58, 57, 56, 58, 60, 62, 64, 68] },
  ],
}

export const EMERGING = [
  { name: 'Kimchi & Fermentiertes', delta: 182, src: 'Social & Rezepte', note: 'Airfryer-Bowls treiben Nachfrage in KW 33–36' },
  { name: 'Pistaziencreme', delta: 96, src: 'Google Trends', note: 'Peak nach „Dubai-Chocolate“-Welle, hohes Margenfenster' },
  { name: 'Protein-Pudding', delta: 74, src: 'POS + Social', note: 'Direkt-Impact auf Skyr & Milch-Mischprodukte' },
  { name: 'Grillgemüse-Mischung', delta: 88, src: 'Google Trends', note: 'Saison-Peak KW 35, gut kombinierbar mit BBQ-Bundle' },
  { name: 'Yuzu & Asia-Citrus', delta: 61, src: 'Open Food Facts', note: 'Neue Listings +14 % in 4 Wochen' },
  { name: 'Brotdosen-Snacks', delta: 47, src: 'Eigene Verkaufsdaten', note: 'Schulbeginn SH am 25.08. – Snack-Obst & Studentenfutter' },
]

export const REGIONAL = [
  { region: 'Nord', top: 'Tiefkühl & Convenience', delta: 12, signal: 'Pommes + Eis überdurchschnittlich, Wetterkorrelation hoch' },
  { region: 'Süd', top: 'Backwaren & Käse', delta: 9, signal: 'Ofenfrische-Sortiment wächst, Hirtenkäse +18 %' },
  { region: 'West', top: 'Snacks & Softdrinks', delta: 15, signal: 'Spieltag-Effekt messbar, Chips-Nachfrage +22 %' },
  { region: 'Ost', top: 'Grillwurst & Fleisch', delta: 11, signal: 'Thüringer-Spezialitäten stabil, Preissensitivität steigend' },
]

export const TREND_EVENTS = [
  { icon: 'sun', title: 'Hitzewelle prognostiziert', span: 'KW 35, Di–Do · 29–31 °C', impact: 'Getränke +34 % · Eis +41 %', level: 'hoch' as const },
  { icon: 'calendar', title: 'Schulbeginn Schleswig-Holstein', span: '25.08.2026', impact: 'Brotdosen-Snacks +17 % · Obstbecher +12 %', level: 'mittel' as const },
  { icon: 'mega', title: '1. Bundesliga-Spieltag', span: '29.08.2026', impact: 'Snacks +22 % · Pils +15 %', level: 'mittel' as const },
]

// ── Demo-CSV für den Import ──────────────────────────────────────
export const CSV_DEMO = `produktname;kategorie;ean;normalpreis;aktionspreis;grundpreis;pfand;uvp;marge;abverkauf;lagerbestand;region;aktionszeitraum
Bio-Bananen;Obst & Gemüse;42101001;2,29;1,89;1,89 €/kg;;2,49;26;2400;860;Bundesweit;24.08.-29.08.
Cherrytomaten;Obst & Gemüse;42101007;1,49;0,99;3,96 €/kg;;;31;980;420;West;24.08.-29.08.
Rinderhackfleisch;Fleisch;42102004;4,49;3,59;7,18 €/kg;;4,99;34;1620;540;Bundesweit;24.08.-29.08.
Thüringer Grillwurst;Fleisch;42102017;2,99;2,49;6,23 €/kg;;;35;1480;620;Ost;24.08.-29.08.
Frische Vollmilch 3,5 %;Molkerei;42103002;1,29;0,99;0,99 €/l;;;18;3200;2100;Nord;24.08.-29.08.
Cola;Getränke;42104001;1,49;0,99;0,66 €/l;0,25;;22;2600;1500;Bundesweit;24.08.-29.08.
Pizza Salami;Tiefkühl;42105003;1,99;1,49;4,45 €/kg;;;30;1980;1150;Bundesweit;24.08.-29.08.
Mehrkornbrot Ofenfrisch;Backwaren;42106002;1,99;1,59;2,12 €/kg;;;25;1730;780;Nord;24.08.-29.08.
Kartoffelchips Paprika;Snacks;42108101;1,59;1,19;5,95 €/kg;;;42;1500;820;Bundesweit;24.08.-29.08.
Spülmittel Zitrone;Haushalt;42109103;1,79;1,29;2,58 €/l;;;44;780;560;Bundesweit;24.08.-29.08.
`

export const IMPORT_SOURCES = [
  { id: 'upload', name: 'CSV / XLSX hochladen', icon: 'upload', desc: 'Drag & Drop oder Datei wählen' },
  { id: 'excel', name: 'Excel', icon: 'sheet', desc: 'Arbeitsmappe „Sortiment_KW35.xlsx"' },
  { id: 'gsheets', name: 'Google Sheets', icon: 'sheet', desc: 'Sheet „AKTIONSPLAN_KW35"' },
  { id: 'm365', name: 'Microsoft 365', icon: 'grid', desc: 'SharePoint-Dokumentenbibliothek' },
  { id: 'sap', name: 'SAP / ERP', icon: 'db', desc: 'Artikelstamm & Aktionskonditionen' },
  { id: 'api', name: 'REST API', icon: 'api', desc: 'Webhook-Import aus dem PIM' },
]

export const CATEGORY_EMOJI: Record<string, string> = {
  'Obst & Gemüse': '🥬', Fleisch: '🥩', Molkerei: '🥛', Getränke: '🧃', Tiefkühl: '❄️', Backwaren: '🍞', Snacks: '🍿', Feinkost: '🍝', Haushalt: '🧴',
}

export const CATEGORY_STYLE: Record<Category, { soft: string; strong: string }> = {
  'Obst & Gemüse': { soft: '#ecfdf3', strong: '#15803d' },
  Fleisch: { soft: '#fef2f2', strong: '#b91c1c' },
  Molkerei: { soft: '#eff6ff', strong: '#1d4ed8' },
  Getränke: { soft: '#ecfeff', strong: '#0e7490' },
  Tiefkühl: { soft: '#f0f9ff', strong: '#0369a1' },
  Backwaren: { soft: '#fffbeb', strong: '#b45309' },
  Snacks: { soft: '#fff7ed', strong: '#c2410c' },
  Feinkost: { soft: '#fdf4ff', strong: '#a21caf' },
  Haushalt: { soft: '#f5f5f4', strong: '#57534e' },
}

export const DASH_KPIS = [
  { id: 'angebote', label: 'Aktive Angebote', value: '248', sub: 'über alle Regionen', delta: 6.1, points: [196, 202, 208, 215, 221, 232, 248] },
  { id: 'umsatz', label: 'Umsatzpotenzial', value: '+12,4 %', sub: 'gegenüber KW 34', delta: 12.4, points: [3.1, 4.4, 4.2, 6.8, 8.9, 10.2, 12.4] },
  { id: 'marge', label: 'Ø Marge', value: '31,8 %', sub: 'handelsgewichtet', delta: 1.2, points: [29.8, 30.2, 30.1, 30.8, 31.1, 31.5, 31.8] },
  { id: 'person', label: 'Personalisierungsrate', value: '74 %', sub: 'der Haushalte sehen individuelle Angebote', delta: 9.0, points: [51, 55, 58, 62, 66, 71, 74] },
  { id: 'pangv', label: 'PAngV-Checks', value: '100 %', sub: 'konform · 8/8 Regeln aktiv', delta: 0, points: [97, 98, 98, 99, 100, 100, 100] },
  { id: 'status', label: 'Kampagnenstatus', value: 'In Prüfung', sub: 'KW 35 · Freigabe bis Sa, 22.08.', delta: null, points: [1, 1, 2, 2, 3, 3, 3] },
]
