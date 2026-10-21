const items = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'register', label: 'Register Product' },
  { id: 'track', label: 'Track Product' },
  { id: 'verify', label: 'Verify Product' },
]

export default function Sidebar({ currentPage, onNavigate, open }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">PT</div>
        <div>
          <h1>ProductTrace</h1>
          <p>Supply chain records</p>
        </div>
      </div>
      <nav className="nav-list" aria-label="Main">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            aria-current={currentPage === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <p className="sidebar-footnote">
        Record each product stage from manufacturer to customer. Tracking history stays verifiable and unchanged.
      </p>
    </aside>
  )
}
