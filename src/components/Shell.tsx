import React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Badge, Btn, ToastHost, cn } from './ui'
import { Icon, Logo } from '../lib/icons'
import { CAMPAIGN_LABEL, useApp } from '../state/AppState'
import { RETAILER } from '../data/mock'

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/handzettel', label: 'Handzettel', icon: 'flyer' },
  { to: '/produkte', label: 'Produkte', icon: 'box' },
  { to: '/ranking', label: 'Smart Ranking', icon: 'bars' },
  { to: '/trends', label: 'Trends', icon: 'trend' },
  { to: '/rezepte', label: 'Rezepte', icon: 'chef' },
  { to: '/bundles', label: 'Bundles', icon: 'layers' },
  { to: '/kampagnen', label: 'Kampagnen', icon: 'mega' },
  { to: '/analytics', label: 'Analytics', icon: 'pie' },
  { to: '/integrationen', label: 'Integrationen', icon: 'plug' },
  { to: '/einstellungen', label: 'Einstellungen', icon: 'gear' },
]

const TITLE: Record<string, string> = {
  '/': 'Dashboard',
  '/handzettel': 'Handzettel',
  '/handzettel/import': 'Daten importieren',
  '/handzettel/builder': 'Flyer Builder',
  '/handzettel/export': 'Omnichannel-Export',
  '/produkte': 'Produkte',
  '/ranking': 'Smart Ranking',
  '/trends': 'Trend Engine',
  '/rezepte': 'Rezepte',
  '/bundles': 'Smart Bundles',
  '/kampagnen': 'Kampagnen & Freigabe',
  '/analytics': 'Analytics',
  '/integrationen': 'Integrationen',
  '/einstellungen': 'Einstellungen',
}

function NavItem({ to, label, icon, end }: { to: string; label: string; icon: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 h-9.5 px-3 rounded-lg text-[13.5px] font-medium transition-colors',
          isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5',
        )
      }
    >
      <Icon name={icon} size={17} />
      {label}
    </NavLink>
  )
}

export default function Shell() {
  const { state } = useApp()
  const loc = useLocation()
  const nav = useNavigate()
  const camp = CAMPAIGN_LABEL[state.campaignStatus]
  const title = TITLE[loc.pathname] ?? (loc.pathname.startsWith('/produkte/') ? 'Produktdetail' : 'Smart Handzettel')

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-accent-950 text-white z-40">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
          <Logo size={30} />
          <div className="leading-tight">
            <div className="text-[14.5px] font-bold tracking-tight">Smart Handzettel</div>
            <div className="text-[10px] text-accent-300/90 font-medium tracking-wide uppercase">Retail Automation</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>
        <div className="px-4 pb-5 space-y-3">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-accent-300">Aktive Kampagne</div>
            <div className="text-[13px] font-semibold mt-1">Handzettel KW {state.campaignWeek}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{RETAILER.campaign.period}</div>
            <Badge tone={camp.tone} className="mt-2">{camp.label}</Badge>
          </div>
          <div className="flex items-center gap-2.5 px-1">
            <div className="size-8.5 rounded-full bg-accent-700 flex items-center justify-center text-xs font-bold">LB</div>
            <div className="leading-tight min-w-0">
              <div className="text-[12.5px] font-semibold truncate">{RETAILER.user.name}</div>
              <div className="text-[10.5px] text-zinc-400 truncate">{RETAILER.user.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Kopf */}
      <div className="lg:hidden sticky top-0 z-40 bg-accent-950 text-white">
        <div className="flex items-center gap-2.5 px-4 h-14">
          <Logo size={26} />
          <div className="text-sm font-bold flex-1">Smart Handzettel</div>
          <Badge tone={camp.tone}>{camp.label}</Badge>
        </div>
        <div className="flex gap-1.5 px-3 pb-2.5 overflow-x-auto">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn('shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium', isActive ? 'bg-white/15 text-white' : 'text-zinc-400')
              }
            >
              <Icon name={n.icon} size={14} />
              {n.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Hauptbereich */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-[#f4f4f2]/90 backdrop-blur border-b border-zinc-200 hidden lg:flex items-center gap-4 px-7">
          <div className="text-[13px] text-zinc-500">
            {RETAILER.name} <span className="mx-1.5 text-zinc-300">/</span> <span className="text-zinc-800 font-semibold">{title}</span>
          </div>
          <div className="flex-1" />
          <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-500 border border-zinc-200 bg-white rounded-lg px-3 h-9">
            <Icon name="calendar" size={14} className="text-zinc-400" />
            <span className="font-medium text-zinc-700">KW {state.campaignWeek}</span>
            <span className="text-zinc-300">·</span>
            {RETAILER.campaign.period}
            <Badge tone={camp.tone} className="ml-1">{camp.label}</Badge>
          </div>
          <Btn size="sm" onClick={() => nav('/handzettel')}>
            <Icon name="zap" size={14} />
            Handzettel erstellen
          </Btn>
          <button className="size-9.5 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:text-zinc-800 cursor-pointer" aria-label="Benachrichtigungen">
            <Icon name="bell" size={16} />
          </button>
        </header>

        <main className="px-4 py-5 lg:px-7 lg:py-6 max-w-[1480px] mx-auto">
          <Outlet />
        </main>
      </div>
      <ToastHost />
    </div>
  )
}
