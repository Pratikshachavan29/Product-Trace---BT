const items = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    badge: null,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    id: 'register',
    label: 'Register Product',
    badge: 'Stage 1',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
        <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" />
      </svg>
    ),
  },
  {
    id: 'track',
    label: 'Track Journey',
    badge: null,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" />
        <polyline points="12 7 12 12 15 15" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'verify',
    label: 'Verify Authenticity',
    badge: null,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 5 6.5v5.2c0 4.4 3 7.6 7 8.8 4-1.2 7-4.4 7-8.8V6.5L12 3Z" fill="none" stroke="currentColor" />
        <path d="m9 12 2.1 2.1L15.5 10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'activity',
    label: 'Activity History',
    badge: null,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <polyline points="12 6 12 12 16 14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function Sidebar({ currentPage, onNavigate, open }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 7.5 12 4l7 3.5v6.2c0 4-2.8 6.9-7 8.3-4.2-1.4-7-4.3-7-8.3V7.5Z" strokeWidth="1.8" />
            <path d="m9 12 2.2 2.2L15.4 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="brand-text">
          <h1>ProductTrace</h1>
          <p>Supply Chain Ledger</p>
        </div>
      </div>

      <div className="sidebar-section-title">Navigation</div>

      <nav className="nav-list" aria-label="Main navigation">
        {items.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status-box">
          <div className="sidebar-status-header">
            <span className="live-dot" aria-hidden="true" />
            <span className="sidebar-status-title">System Status</span>
          </div>
          <p className="sidebar-status-desc">Local tracking ledger active & ready for blockchain contracts.</p>
        </div>
        <p className="sidebar-copy">© ProductTrace &bull; Blockchain Tech</p>
      </div>
    </aside>
  )
}
