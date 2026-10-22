import { useState, useEffect, useMemo } from 'react'
import {
  getStoredProducts,
  SUPPLY_CHAIN_STAGES,
  loadDemoProducts,
  removeDemoProducts,
  DEMO_PRODUCT_IDS,
} from '../utils/storage.js'
import ActivityHistorySection from '../components/ActivityHistorySection.jsx'

const statusClass = {
  'In Transit': 'badge-blue',
  Delivered: 'badge-teal',
  Registered: 'badge-navy',
  Verified: 'badge-mint',
}

function matchStatus(product, category) {
  if (!product) return false
  const statusRaw = product.status != null ? String(product.status).trim().toLowerCase() : ''
  const statusClean = statusRaw.replace(/[-_]/g, ' ')
  const stageRaw = product.stage != null ? String(product.stage).trim().toLowerCase() : ''

  if (category === 'in transit') {
    if (statusClean.includes('transit')) return true
    if (!statusClean && (stageRaw === 'distributor' || stageRaw === 'retailer')) return true
    return false
  }

  if (category === 'delivered') {
    if (statusClean.includes('deliver')) return true
    if (!statusClean && stageRaw === 'customer') return true
    return false
  }

  if (category === 'verified') {
    return statusClean.includes('verif') || product.isVerified === true
  }

  if (category === 'registered') {
    if (statusClean.includes('verif') || product.isVerified === true) return false
    if (statusClean.includes('register')) return true
    if (!statusClean && stageRaw === 'manufacturer') return true
    return false
  }

  return false
}

export default function Dashboard({ onNavigate }) {
  const [products, setProducts] = useState(() => getStoredProducts())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [demoFeedback, setDemoFeedback] = useState(null)

  function handleLoadDemo() {
    const res = loadDemoProducts()
    if (res.success) {
      setDemoFeedback({ type: 'success', text: res.message })
      setProducts(getStoredProducts())
    } else if (res.alreadyLoaded) {
      setDemoFeedback({ type: 'info', text: res.message })
    } else {
      setDemoFeedback({ type: 'error', text: res.error || 'Failed to load demo products.' })
    }
  }

  function handleRemoveDemo() {
    const res = removeDemoProducts()
    if (res.success) {
      setDemoFeedback({ type: 'success', text: res.message })
      setProducts(getStoredProducts())
    } else {
      setDemoFeedback({ type: 'info', text: res.message || 'No demo products to remove.' })
    }
  }

  useEffect(() => {
    setProducts(getStoredProducts())

    function handleStorageChange(e) {
      if (!e.key || e.key === 'producttrace_products') {
        setProducts(getStoredProducts())
      }
    }

    function handleFocus() {
      setProducts(getStoredProducts())
    }

    function handleCustomUpdate() {
      setProducts(getStoredProducts())
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('producttrace_storage_update', handleCustomUpdate)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('producttrace_storage_update', handleCustomUpdate)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const safeProducts = useMemo(() => {
    return Array.isArray(products) ? products.filter(Boolean) : []
  }, [products])

  // Dynamic statistics calculated strictly from actual stored products
  const totalCount = safeProducts.length
  const inTransitCount = useMemo(() => safeProducts.filter((p) => matchStatus(p, 'in transit')).length, [safeProducts])
  const deliveredCount = useMemo(() => safeProducts.filter((p) => matchStatus(p, 'delivered')).length, [safeProducts])
  const verifiedCount = useMemo(() => safeProducts.filter((p) => matchStatus(p, 'verified')).length, [safeProducts])
  const registeredCount = useMemo(() => safeProducts.filter((p) => matchStatus(p, 'registered')).length, [safeProducts])

  // Count products by stage
  const stageCounts = useMemo(() => {
    const counts = { Manufacturer: 0, Distributor: 0, Retailer: 0, Customer: 0 }
    safeProducts.forEach((p) => {
      if (counts[p.stage] !== undefined) {
        counts[p.stage]++
      } else {
        counts.Manufacturer++
      }
    })
    return counts
  }, [safeProducts])

  // Filtered products based on search and status filter
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((product) => {
      // Status filter
      if (selectedStatus !== 'all') {
        if (!matchStatus(product, selectedStatus)) return false
      }

      // Search filter
      if (!searchQuery.trim()) return true
      const q = searchQuery.trim().toLowerCase()
      const matchId = (product.id || '').toLowerCase().includes(q)
      const matchName = (product.name || '').toLowerCase().includes(q)
      const matchMfg = (product.manufacturer || '').toLowerCase().includes(q)
      const matchLoc = (product.originLocation || '').toLowerCase().includes(q)
      const matchStage = (product.stage || '').toLowerCase().includes(q)

      return matchId || matchName || matchMfg || matchLoc || matchStage
    })
  }, [safeProducts, searchQuery, selectedStatus])

  const isDemoLoaded = useMemo(() => {
    const demoIds = new Set(DEMO_PRODUCT_IDS.map((id) => id.toLowerCase()))
    return safeProducts.some((p) => p.isDemo === true || (p?.id && demoIds.has(String(p.id).trim().toLowerCase())))
  }, [safeProducts])

  const dynamicStats = [
    {
      label: 'Total Products',
      value: totalCount,
      hint: totalCount === 0 ? 'No products registered' : `${totalCount} item${totalCount === 1 ? '' : 's'} on record`,
      tone: 'navy',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: 'In Transit',
      value: inTransitCount,
      hint: inTransitCount === 0 ? 'No active shipments' : `${inTransitCount} moving in network`,
      tone: 'blue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      label: 'Delivered',
      value: deliveredCount,
      hint: deliveredCount === 0 ? 'No delivered orders' : `${deliveredCount} reached customer`,
      tone: 'teal',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: 'Verified Records',
      value: verifiedCount,
      hint: verifiedCount === 0 ? 'No verified milestones' : `${verifiedCount} integrity confirmed`,
      tone: 'mint',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ]

  const stageIcons = {
    Manufacturer: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 20h20M6 20V10l6-4v14M18 20V4l-6 4" />
      </svg>
    ),
    Distributor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    Retailer: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    Customer: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    ),
  }

  return (
    <section className="page dashboard-page">
      {/* Top Banner / Actions */}
      <div className="page-header dashboard-header">
        <div>
          <h2>Supply Chain Dashboard</h2>
          <p>Real-time visibility from manufacturing source to end customer.</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary btn-demo-action"
            type="button"
            onClick={handleLoadDemo}
            title="Load 10 authentic sample products across supply-chain stages"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Load Demo Products
          </button>

          {isDemoLoaded && (
            <button
              className="btn btn-secondary btn-remove-demo"
              type="button"
              onClick={handleRemoveDemo}
              title="Remove sample demo products from the tracking ledger"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Remove Demo Products
            </button>
          )}

          <button className="btn btn-secondary" type="button" onClick={() => onNavigate('track')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Track by ID
          </button>
          <button className="btn" type="button" onClick={() => onNavigate('register')}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Register Product
          </button>
        </div>
      </div>

      {/* Demo Feedback Notification */}
      {demoFeedback && (
        <div
          className={`alert ${demoFeedback.type === 'error' ? 'alert-error' : demoFeedback.type === 'info' ? 'alert-info' : 'alert-success'} demo-feedback-alert`}
          role="status"
        >
          <div>
            <p className="alert-title">
              {demoFeedback.type === 'error' ? 'Demo Action Error' : demoFeedback.type === 'info' ? 'Demo Notice' : '✓ Demo Data Updated'}
            </p>
            <p className="alert-desc">{demoFeedback.text}</p>
          </div>
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={() => setDemoFeedback(null)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="stat-grid">
        {dynamicStats.map((stat) => (
          <article className={`stat-card stat-${stat.tone}`} key={stat.label}>
            <div className="stat-card-top">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-card-icon" aria-hidden="true">{stat.icon}</span>
            </div>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-hint">{stat.hint}</p>
          </article>
        ))}
      </div>

      {/* 4 Supply-Chain Stages Overview */}
      <section className="card pipeline-card" aria-label="Supply chain stages">
        <div className="section-heading">
          <div className="section-title-wrap">
            <h3>Supply Chain Progress</h3>
            <span className="section-tag">4 Connected Stages</span>
          </div>
          <p>Each registered product progresses sequentially through authenticated handover milestones.</p>
        </div>
        <ol className="pipeline">
          {SUPPLY_CHAIN_STAGES.map((stage, index) => {
            const count = stageCounts[stage.id] || 0
            return (
              <li className="pipeline-step" key={stage.id}>
                <div className="pipeline-node-wrap">
                  <div className="pipeline-node" aria-label={`Stage ${stage.stepNumber}: ${stage.label}`}>
                    {stageIcons[stage.id] || stage.stepNumber}
                  </div>
                  {index < SUPPLY_CHAIN_STAGES.length - 1 && (
                    <span className="pipeline-line" aria-hidden="true" />
                  )}
                </div>
                <div className="pipeline-step-content">
                  <div className="pipeline-title-row">
                    <h4>{stage.label}</h4>
                    <span className={`stage-counter-pill ${count > 0 ? 'has-items' : ''}`} title={`${count} products at this stage`}>
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <p className="pipeline-role">{stage.role}</p>
                  <p className="pipeline-copy">{stage.description}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Recent Products with Search and Filter Toolbar */}
      <section className="card table-card">
        <div className="table-header-bar">
          <div>
            <h3>Product Tracking Records</h3>
            <p>
              {safeProducts.length === 0
                ? 'Your tracking ledger is empty. Click "+ Register Product" to begin.'
                : `Showing ${filteredProducts.length} of ${safeProducts.length} tracked product${safeProducts.length === 1 ? '' : 's'}.`}
            </p>
          </div>

          {safeProducts.length > 0 && (
            <div className="table-search-box">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, name, manufacturer..."
                className="table-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filter Chips Bar */}
        {safeProducts.length > 0 && (
          <div className="filter-chips-bar" role="tablist" aria-label="Filter products by status">
            <button
              type="button"
              className={`filter-chip ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              All ({safeProducts.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedStatus === 'registered' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('registered')}
            >
              <span className="dot dot-navy" /> Registered ({registeredCount})
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedStatus === 'in transit' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('in transit')}
            >
              <span className="dot dot-blue" /> In Transit ({inTransitCount})
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedStatus === 'delivered' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('delivered')}
            >
              <span className="dot dot-teal" /> Delivered ({deliveredCount})
            </button>
            <button
              type="button"
              className={`filter-chip ${selectedStatus === 'verified' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('verified')}
            >
              <span className="dot dot-mint" /> Verified ({verifiedCount})
            </button>
          </div>
        )}

        {/* Product Table or Empty State */}
        {safeProducts.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h4>No products registered yet</h4>
            <p>
              Your supply chain tracking ledger has no records yet. Register a product at the Manufacturer stage to record its origin and follow its journey.
            </p>
            <button className="btn" type="button" onClick={() => onNavigate('register')}>
              + Register First Product
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state-card search-empty">
            <div className="empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h4>No matching products found</h4>
            <p>
              No product matched your search query &ldquo;<strong>{searchQuery}</strong>&rdquo;
              {selectedStatus !== 'all' ? ` with status filter &ldquo;${selectedStatus}&rdquo;` : ''}.
            </p>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedStatus('all')
              }}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tracking-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Origin & Facility</th>
                  <th>Manufacturer</th>
                  <th>Current Stage</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const displayId = product?.id || '—'
                  const displayName = product?.name || 'Unnamed Product'
                  const displayLoc = product?.originLocation || '—'
                  const displayMfg = product?.manufacturer || '—'
                  const displayStage = product?.stage || 'Manufacturer'
                  const displayUpdated = product?.updated || 'Recently'
                  const displayStatus = product?.status || 'Registered'

                  return (
                    <tr key={displayId} className="table-row-hover">
                      <td>
                        <span className="mono-pill">{displayId}</span>
                      </td>
                      <td>
                        <div className="product-name-cell">
                          <span className="product-primary-name">{displayName}</span>
                          {product?.isDemo && <span className="demo-data-badge">Demo Data</span>}
                        </div>
                      </td>
                      <td>
                        <span className="location-cell">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {displayLoc}
                        </span>
                      </td>
                      <td>{displayMfg}</td>
                      <td>
                        <span className="stage-pill">
                          <span className="stage-pill-dot" />
                          {displayStage}
                        </span>
                      </td>
                      <td className="updated-cell">{displayUpdated}</td>
                      <td>
                        <span className={`badge ${statusClass[displayStatus] || 'badge-navy'}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onNavigate('track', product.id)}
                          title="View timeline & track product journey"
                        >
                          Track &rarr;
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Real-Time Product Activity History Feed */}
      <ActivityHistorySection onNavigate={onNavigate} title="Real-Time Product Activity Feed" />
    </section>
  )
}
