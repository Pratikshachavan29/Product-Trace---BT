export default function Header({ onMenuClick }) {
  return (
    <header className="header">
      <button className="menu-toggle" type="button" onClick={onMenuClick} aria-label="Open navigation">
        ☰
      </button>
      <h1 className="header-title">ProductTrace</h1>
      <p className="header-meta">Manufacturer to customer traceability</p>
    </header>
  )
}
