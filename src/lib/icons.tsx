import React from 'react'

const P: Record<string, React.ReactElement> = {
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  flyer: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6M9 9h1.5" />
    </>
  ),
  box: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3.3 8.3 12 13l8.7-4.7" />
      <path d="M12 13v8" />
    </>
  ),
  bars: <path d="M5 20v-7M10 20V5M15 20v-4M20 20v-9" strokeWidth="2.2" />,
  trend: (
    <>
      <path d="M3 17l5.5-5.5 3.5 3.5L21 6" />
      <path d="M15 6h6v6" />
    </>
  ),
  chef: (
    <>
      <rect x="6" y="4.5" width="12" height="16" rx="2" />
      <path d="M9 4.5a2.25 2.25 0 0 1 2.25-2.25h1.5A2.25 2.25 0 0 1 15 4.5" />
      <path d="M10 11h4M10 15h4" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5z" />
      <path d="M3.5 13.5 12 18l8.5-4.5" />
    </>
  ),
  mega: (
    <>
      <path d="M3 10.5v3.5a1 1 0 0 0 1 1h2l9 4.5v-15L6 9H4a1 1 0 0 0-1 1z" />
      <path d="M18.5 9.5a4 4 0 0 1 0 5.5" />
      <path d="M8 15.5V19a1.5 1.5 0 0 0 3 0v-2.6" />
    </>
  ),
  pie: (
    <>
      <path d="M12 3v9h9" />
      <path d="M21 12a9 9 0 1 1-9-9" />
    </>
  ),
  plug: (
    <>
      <path d="M9 7V2.5M15 7V2.5" />
      <path d="M7 7h10v4a5 5 0 0 1-10 0z" />
      <path d="M12 16v5.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.2 2.2M16.8 16.8 19 19M19 5l-2.2 2.2M7.2 16.8 5 19" />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 4l1.6 4.4L17 10l-4.4 1.6L11 16l-1.6-4.4L5 10l4.4-1.6z" />
      <path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V4M6.5 9.5 12 4l5.5 5.5" />
      <path d="M4 20h16" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11M6.5 9.5 12 15l5.5-5.5" />
      <path d="M4 20h16" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
  checkc: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16.3 9.5" />
    </>
  ),
  xc: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <path d="M12 3.5 21.5 20h-19z" />
      <path d="M12 10v4.5M12 17.5v.01" />
    </>
  ),
  chevR: <path d="M9 5l7 7-7 7" />,
  chevL: <path d="M15 5l-7 7 7 7" />,
  chevD: <path d="M5 9l7 7 7-7" />,
  arrowR: <path d="M4 12h15M13 5.5 19.5 12 13 18.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20.5 20.5 16 16" />
    </>
  ),
  filter: <path d="M4 5h16l-6.5 8v6l-3 1.5v-7.5z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17z" />
      <path d="M14.5 7l3 3" />
    </>
  ),
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z" />,
  zap: <path d="M13 2.5 4.5 13.5H11L10 21.5l8.5-11H13z" />,
  db: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c-5.5 6-5.5 12 0 18M12 3c5.5 6 5.5 12 0 18" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.5h-15z" />
      <path d="M10 21a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.3 10.8 15.6 7M8.3 13.2l7.3 3.8" />
    </>
  ),
  board: (
    <>
      <rect x="4" y="3.5" width="16" height="11" rx="1.5" />
      <path d="M12 14.5V21M8.5 21h7" />
      <path d="M8 7.5h8M8 10.5h5" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.5 5.5 4h13L20 9.5" />
      <path d="M4 9.5h16V20H4z" />
      <path d="M9.5 20v-6h5v6" />
      <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5a3.5 3.5 0 0 1 0 6.8M17.5 14.2a6.5 6.5 0 0 1 4 5.8" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 5v5h-5" />
      <path d="M4 19v-5h5" />
      <path d="M5.5 9a7 7 0 0 1 12-2.4L20 10M4 14l2.5 3.5A7 7 0 0 0 18.5 15" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8V3.5h10V8" />
      <rect x="4" y="8" width="16" height="8" rx="2" />
      <path d="M7 13h10v7.5H7z" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />,
  send: <path d="M21 3 10.5 13.5M21 3l-7 18-3.5-7.5L3 10z" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 2.5V6M16 2.5V6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.5v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9v-6z" />
      <path d="M9 11.5l2.3 2.3 4.2-4.3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7" />
    </>
  ),
  basket: (
    <>
      <path d="M5 9.5h14l-1.5 10.5h-11z" />
      <path d="M8.5 9.5 12 3.5l3.5 6" />
      <path d="M9.5 13v3.5M14.5 13v3.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 10.5 13.5" />
      <path d="M20 14v5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V5.5A1.5 1.5 0 0 1 5.5 4H10" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </>
  ),
  sheet: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M4 9h16M4 14.5h16M10 9v11.5" />
    </>
  ),
  api: <path d="M8 4c-2 0-3 1-3 3v2.5c0 1.5-1 2-2 2 1 0 2 .5 2 2V17c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2.5c0 1.5 1 2 2 2-1 0-2 .5-2 2V17c0 2-1 3-3 3" />,
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5z" />
    </>
  ),
  drag: <path d="M9 5.5h.01M9 12h.01M9 18.5h.01M15 5.5h.01M15 12h.01M15 18.5h.01" strokeWidth="2.6" />,
  compare: (
    <>
      <path d="M12 3v18" />
      <rect x="3" y="6" width="6.5" height="12" rx="1.5" />
      <rect x="14.5" y="9" width="6.5" height="9" rx="1.5" />
    </>
  ),
  wand: (
    <>
      <path d="M6 21 21 6l-3-3L3 18z" />
      <path d="M14 5l3 3" />
    </>
  ),
  star_: <path d="M12 4l2 4.5 5 .6-3.7 3.4 1 4.9-4.3-2.5-4.3 2.5 1-4.9L5 9.1l5-.6z" />,
}

export type IconName = keyof typeof P

export function Icon({
  name,
  size = 18,
  className = '',
  strokeWidth = 1.8,
}: {
  name: string
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {P[name] ?? P.info}
    </svg>
  )
}

/** App-Logo: Markenzeichen */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#1e6f4b" />
      <path
        d="M8.5 22.5V9.5h3.1v5h5.4v-5h3.1v13H17v-5.2h-5.4v5.2H8.5z"
        fill="#fff"
      />
      <circle cx="24.6" cy="7.4" r="2.6" fill="#fbbf24" />
    </svg>
  )
}
