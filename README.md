# Smart Handzettel — Prototyp

**KI-gestützte Handzettel-Automation für den Lebensmittelhandel.**
Vom wöchentlichen Handzettel in Minuten statt Tagen: **Daten → Smart Ranking → Handzettel → Freigabe → Export**.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4
- React Router 6
- Lokale Mock-Daten (39 realistische Supermarkt-Produkte), Zustand per LocalStorage persistiert

## Demo-Flow

1. **Dashboard** – KPI-Cockpit, aktuelle Wochenkampagne KW 35, CTA „Handzettel erstellen"
2. **Daten** – Import-Assistent (Excel, Google Sheets, M365, SAP/ERP, API, CSV-Upload mit Feld-Mapping & Validierung)
3. **Smart Ranking** – KI-Score pro Artikel mit Erklärung + anpassbarer Gewichtung (6 Faktoren)
4. **Handzettel** – Flyer Builder mit Live-Ausblick (Desktop + Mobil), Segment-Personalisierung (Familien, Singles, Preisbewusste, Vegetarisch, Grillfans, Stammkunden), KI-Rezepte & Smart Bundles
5. **Freigabe** – Prüfliste inkl. PAngV-Compliance, Freigeben / Änderungen anfordern
6. **Export** – Omnichannel: Print-PDF, Web, App, E-Mail, Push, Social, OOH, DooH, In-Store

Dazu: Trend Engine, Rezept- und Bundle-Generatoren, Einkaufsassistent (Chat im digitalen Handzettel), Analytics und Integrationen.

## Start

```bash
npm install
npm run dev
```

→ http://localhost:5173

Demo zurücksetzen: **Einstellungen → Demo zurücksetzen** (löscht den LocalStorage-Fortschritt).

## Struktur

- `src/data/mock.ts` – Produkte, Rezepte, Bundles, Kanäle, Trends, Analytics
- `src/lib/ai.ts` – KI-Scoring, Erklärungstexte, PAngV-Prüfung
- `src/state/AppState.tsx` – globaler Zustand + Workflow-Ableitung
- `src/components/FlyerPreview.tsx` – realistische Flyer-Darstellung (Desktop/Mobil)
- `src/components/Assistant.tsx` – Einkaufsassistent + digitaler Handzettel
- `src/pages/*` – 15 Seiten entlang des Workflows
