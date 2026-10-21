const pageMeta = {
  dashboard: {
    kicker: 'Overview',
    title: 'Supply Chain Dashboard',
    meta: 'Real-time traceability from source facility to end customer',
  },
  register: {
    kicker: 'Stage 1 Entry',
    title: 'Register Product',
    meta: 'Initialize origin records and generate product passport',
  },
  track: {
    kicker: 'End-to-End Tracking',
    title: 'Track Product Journey',
    meta: 'Inspect recorded milestones, handlers, and supply-chain stages',
  },
  verify: {
    kicker: 'Integrity Audit',
    title: 'Verify Authenticity',
    meta: 'Confirm product record existence and origin facility validation',
  },
}

export default function Header({ onMenuClick, currentPage = 'dashboard' }) {
  const current = pageMeta[currentPage] || pageMeta.dashboard

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="menu-toggle"
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <p className="header-kicker">{current.kicker}</p>
          <h1 className="header-title">{current.title}</h1>
        </div>
      </div>
      <div className="header-right">
        <p className="header-meta">{current.meta}</p>
        <div className="network-pill" title="Running in simulated local tracking ledger">
          <span className="live-dot" aria-hidden="true" />
          <span className="network-text">Local Ledger</span>
        </div>
      </div>
    </header>
  )
}
