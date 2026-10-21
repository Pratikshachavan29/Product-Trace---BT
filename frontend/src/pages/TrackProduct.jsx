import { useState, useEffect } from 'react'
import { getStoredProducts, getProductById, updateProductStage, SUPPLY_CHAIN_STAGES } from '../utils/storage.js'

const statusClass = {
  'In Transit': 'badge-blue',
  Delivered: 'badge-teal',
  Registered: 'badge-navy',
  Verified: 'badge-mint',
}

const NEXT_STAGE_MAP = {
  Manufacturer: { nextStage: 'Distributor', nextStatus: 'In Transit', label: 'Dispatch to Distributor (In Transit)' },
  Distributor: { nextStage: 'Retailer', nextStatus: 'In Transit', label: 'Deliver to Retailer Store (In Transit)' },
  Retailer: { nextStage: 'Customer', nextStatus: 'Delivered', label: 'Complete Customer Handover (Delivered)' },
}

export default function TrackProduct({ onNavigate, navParams }) {
  const [searchId, setSearchId] = useState(navParams ? String(navParams) : '')
  const [activeProduct, setActiveProduct] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [allProducts, setAllProducts] = useState([])
  const [updateFeedback, setUpdateFeedback] = useState('')

  // Load available products for quick-select chips
  useEffect(() => {
    const list = getStoredProducts()
    setAllProducts(list)

    // Auto-search if navParams was passed
    if (navParams) {
      const match = getProductById(navParams)
      if (match) {
        setActiveProduct(match)
        setSearchError('')
      } else {
        setSearchError(`Product ID "${navParams}" not found in tracking records.`)
      }
    }
  }, [navParams])

  function handleSearch(e) {
    if (e) e.preventDefault()
    setUpdateFeedback('')

    const trimmed = searchId.trim()
    if (!trimmed) {
      setSearchError('Please enter a Product ID to track.')
      setActiveProduct(null)
      return
    }

    const match = getProductById(trimmed)
    if (!match) {
      setSearchError(`No product found with ID "${trimmed}". Check the identifier or register it first.`)
      setActiveProduct(null)
      return
    }

    setActiveProduct(match)
    setSearchError('')
  }

  function handleQuickSelect(id) {
    setSearchId(id)
    setUpdateFeedback('')
    const match = getProductById(id)
    if (match) {
      setActiveProduct(match)
      setSearchError('')
    }
  }

  function handleAdvanceStage() {
    if (!activeProduct) return
    const transition = NEXT_STAGE_MAP[activeProduct.stage]
    if (!transition) return

    const res = updateProductStage(
      activeProduct.id,
      transition.nextStage,
      transition.nextStatus,
      activeProduct.originLocation || 'Regional Distribution Facility',
      `${transition.nextStage} Operations`
    )

    if (res.success) {
      setActiveProduct(res.product)
      setAllProducts(getStoredProducts())
      setUpdateFeedback(`Successfully advanced product to ${transition.nextStage} stage!`)
    }
  }

  // Determine stage progression
  const stageOrder = ['Manufacturer', 'Distributor', 'Retailer', 'Customer']
  const currentStageIndex = activeProduct ? stageOrder.indexOf(activeProduct.stage) : -1

  return (
    <section className="page track-page">
      <div className="page-header">
        <div className="page-header-badge">
          <span className="dot dot-teal" />
          <span>Milestone Traceability</span>
        </div>
        <h2>Track Product Journey</h2>
        <p>
          Follow each authenticated milestone across the supply chain from raw origin to final consumer handover.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="card search-card">
        <form className="track-search-form" onSubmit={handleSearch}>
          <div className="track-search-input-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="track-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter unique Product ID (e.g. PT-10490)..."
              className="track-search-input"
            />
            {searchId && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchId('')
                  setActiveProduct(null)
                  setSearchError('')
                }}
                aria-label="Clear input"
              >
                ✕
              </button>
            )}
          </div>
          <button className="btn" type="submit">
            Track Journey
          </button>
        </form>

        {/* Quick Select Chips */}
        {allProducts.length > 0 && (
          <div className="quick-select-row">
            <span className="quick-select-label">Registered in Ledger:</span>
            <div className="quick-chips-list">
              {allProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`quick-chip ${activeProduct?.id === p.id ? 'active' : ''}`}
                  onClick={() => handleQuickSelect(p.id)}
                >
                  <span className="mono">{p.id}</span>
                  <span className="quick-chip-name">&bull; {p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {searchError && (
        <div className="alert alert-error" role="alert">
          <div>
            <p className="alert-title">Product Lookup Notice</p>
            <p className="alert-desc">{searchError}</p>
          </div>
          {onNavigate && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onNavigate('register')}
              style={{ marginLeft: 12, flexShrink: 0 }}
            >
              Register Product &rarr;
            </button>
          )}
        </div>
      )}

      {/* Update Feedback Alert */}
      {updateFeedback && (
        <div className="alert alert-success" role="status">
          <p className="alert-title">✓ Milestone Updated</p>
          <p className="alert-desc">{updateFeedback} Recorded in local ledger and reflected on dashboard.</p>
        </div>
      )}

      {/* Product Details & Timeline (When Found) */}
      {activeProduct ? (
        <div className="track-results-wrap">
          {/* Top Product Summary Banner */}
          <div className="card product-summary-card">
            <div className="product-summary-header">
              <div>
                <div className="product-id-tag mono-pill">{activeProduct.id}</div>
                <h3 className="product-headline">{activeProduct.name}</h3>
                <p className="product-subline">
                  Manufactured by <strong>{activeProduct.manufacturer}</strong> &bull; Origin: {activeProduct.originLocation}
                </p>
              </div>
              <div className="product-summary-right">
                <span className={`badge badge-lg ${statusClass[activeProduct.status] || 'badge-navy'}`}>
                  {activeProduct.status}
                </span>
                <span className="last-sync-tag">Last Sync: {activeProduct.updated}</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="product-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Origin Facility</span>
                <span className="meta-val">{activeProduct.originLocation}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Production Date</span>
                <span className="meta-val">{activeProduct.manufacturingDate}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Current Active Stage</span>
                <span className="meta-val stage-highlight">{activeProduct.stage}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Record Verification</span>
                <span className="meta-val verify-link" onClick={() => onNavigate && onNavigate('verify', activeProduct.id)}>
                  Verify Authenticity &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Visual Supply-Chain Journey Timeline */}
          <div className="card timeline-card">
            <div className="card-header-bar">
              <div>
                <h3>Supply Chain Journey Timeline</h3>
                <p>Auditable progression across the 4 stages from facility origin to consumer delivery.</p>
              </div>
              <span className="section-tag">
                Stage {currentStageIndex + 1} of 4: {activeProduct.stage}
              </span>
            </div>

            <div className="timeline-container">
              {SUPPLY_CHAIN_STAGES.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex || (activeProduct.stage === 'Customer' && activeProduct.status === 'Delivered')
                const isCurrent = idx === currentStageIndex && !(activeProduct.stage === 'Customer' && activeProduct.status === 'Delivered')
                const isPending = idx > currentStageIndex

                let stepState = 'pending'
                if (isCompleted) stepState = 'completed'
                else if (isCurrent) stepState = 'current'

                return (
                  <div className={`timeline-row ${stepState}`} key={stage.id}>
                    {/* Left Node & Connector */}
                    <div className="timeline-gutter">
                      <div className={`timeline-bullet ${stepState}`}>
                        {isCompleted ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : isCurrent ? (
                          <span className="current-dot" />
                        ) : (
                          <span className="step-num">{stage.stepNumber}</span>
                        )}
                      </div>
                      {idx < SUPPLY_CHAIN_STAGES.length - 1 && (
                        <div className={`timeline-connector ${isCompleted ? 'connector-done' : ''}`} />
                      )}
                    </div>

                    {/* Right Milestone Content */}
                    <div className="timeline-content-card">
                      <div className="milestone-header">
                        <div>
                          <div className="milestone-title-row">
                            <h4 className="milestone-title">{stage.label}</h4>
                            <span className={`milestone-badge badge-${stepState}`}>
                              {stepState === 'completed' ? 'Milestone Completed' : stepState === 'current' ? 'Current Active Stage' : 'Pending Handover'}
                            </span>
                          </div>
                          <p className="milestone-role">{stage.role}</p>
                        </div>
                        <div className="milestone-time">
                          {isCompleted || isCurrent ? activeProduct.updated : 'Awaiting arrival'}
                        </div>
                      </div>

                      <p className="milestone-desc">{stage.description}</p>

                      <div className="milestone-footer-row">
                        <span className="milestone-meta-pill">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {idx === 0 ? activeProduct.originLocation : isCompleted || isCurrent ? 'Regional Distribution Hub' : 'Pending location'}
                        </span>
                        <span className="milestone-meta-pill">
                          Handler: {idx === 0 ? activeProduct.manufacturer : `${stage.label} Operations`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Advance Stage Simulation Action */}
            {NEXT_STAGE_MAP[activeProduct.stage] && (
              <div className="stage-advance-bar">
                <div>
                  <h4 className="advance-title">Simulate Supply-Chain Progression</h4>
                  <p className="advance-desc">
                    Record handover to the next milestone. This updates the product status in local storage and reflects in the dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={handleAdvanceStage}
                >
                  {NEXT_STAGE_MAP[activeProduct.stage].label} &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty Search Prompt */
        !searchError && (
          <div className="card track-empty-prompt">
            <div className="empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="8" />
                <polyline points="12 7 12 12 15 15" />
              </svg>
            </div>
            <h3>Track Any Product Across the Supply Chain</h3>
            <p>
              Enter a Product ID in the search bar above or click one of the registered items to inspect its full milestone history, locations, and timestamps.
            </p>
            {allProducts.length === 0 && onNavigate && (
              <button
                type="button"
                className="btn"
                onClick={() => onNavigate('register')}
                style={{ marginTop: 8 }}
              >
                + Register First Product
              </button>
            )}
          </div>
        )
      )}
    </section>
  )
}
