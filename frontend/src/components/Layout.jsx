import { useState } from 'react'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

export default function Layout({ currentPage, onNavigate, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleNavigate(page, params = null) {
    onNavigate(page, params)
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <div
        className={`overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        open={sidebarOpen}
      />
      <Header
        onMenuClick={() => setSidebarOpen((open) => !open)}
        currentPage={currentPage}
      />
      <main className="main">{children}</main>
    </div>
  )
}
