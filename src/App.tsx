import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import Dashboard from './pages/Dashboard'
import Handzettel from './pages/Handzettel'
import Import from './pages/Import'
import Builder from './pages/Builder'
import Export from './pages/Export'
import Produkte from './pages/Produkte'
import ProduktDetail from './pages/ProduktDetail'
import Ranking from './pages/Ranking'
import Trends from './pages/Trends'
import Rezepte from './pages/Rezepte'
import Bundles from './pages/Bundles'
import Kampagnen from './pages/Kampagnen'
import Analytics from './pages/Analytics'
import Integrationen from './pages/Integrationen'
import Einstellungen from './pages/Einstellungen'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="handzettel" element={<Handzettel />} />
        <Route path="handzettel/import" element={<Import />} />
        <Route path="handzettel/builder" element={<Builder />} />
        <Route path="handzettel/export" element={<Export />} />
        <Route path="produkte" element={<Produkte />} />
        <Route path="produkte/:id" element={<ProduktDetail />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="trends" element={<Trends />} />
        <Route path="rezepte" element={<Rezepte />} />
        <Route path="bundles" element={<Bundles />} />
        <Route path="kampagnen" element={<Kampagnen />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="integrationen" element={<Integrationen />} />
        <Route path="einstellungen" element={<Einstellungen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
