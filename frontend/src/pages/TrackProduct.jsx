import { useState, useEffect, useMemo } from 'react'
import {
  getStoredProducts,
  getProductById,
  recordHandover,
  getNextStageInfo,
} from '../utils/storage.js'

const statusClass = {
  'In Transit': 'badge-blue',
  Delivered: 'badge-teal',
  Registered: 'badge-navy',
  Verified: 'badge-mint',
}

const STAGE_STEPS = [
  {
    id: 'Manufacturer',
    stepNumber: 1,
    label: 'Manufacturer Milestone',
    stageName: 'Manufacturer',
    role: 'Origin Facility',
    description: 'Product manufactured, batch assigned, and origin facility records initialized.',
    defaultHandler: 'Origin Manufacturing Plant',
  },
  {
    id: 'Distributor',
    stepNumber: 2,
    label: 'Distributor Milestone',
    stageName: 'Distributor',
    role: 'Logistics Partner',
    description: 'Regional freight hub records handover, warehouse storage, and dispatch.',
    defaultHandler: 'Freight & Distribution Logistics',
  },
  {
    id: 'Retailer',
    stepNumber: 3,
    label: 'Retailer Milestone',
    stageName: 'Retailer',
    role: 'Store Merchant',
    description: 'Retail facility receives shipment, logs shelf availability, and confirms inventory.',
    defaultHandler: 'Retail Store Operations',
  },
  {
    id: 'Customer',
    stepNumber: 4,
    label: 'Customer Milestone',
    stageName: 'Customer',
    role: 'End Consumer',
    description: 'Final delivery receipt confirmed by customer, closing the product journey.',
    defaultHandler: 'End Consumer Handover',
  },
]

function resolveMilestoneData(product, stageId) {
  if (!product) return null

  // 1. Check history entry if recorded
  if (Array.isArray(product.history)) {
    const entry = product.history.find((h) => h?.stage === stageId)
    if (entry) {
      return {
        isRecorded: true,
        timestamp: entry.timestamp || product.updated,
        location: entry.location || product.originLocation,
        handler: entry.handler || (stageId === 'Manufacturer' ? product.manufacturer : `${stageId} Logistics Operations`),
        note: entry.note || `${stageId} milestone verified on ledger.`,
        status: entry.status || (stageId === 'Manufacturer' ? 'Registered' : 'In Transit'),
      }
    }
  }

  // 2. Stage 1 (Manufacturer) is always recorded at product registration
  if (stageId === 'Manufacturer') {
    return {
      isRecorded: true,
      timestamp: product.manufacturingDate || product.updated,
      location: product.originLocation || 'Origin Facility',
      handler: product.manufacturer || 'Manufacturing Facility',
      note: 'Product created and registered in tracking ledger.',
      status: product.status || 'Registered',
    }
  }

  // 3. For stages 2-4: determine if this milestone was recorded or remains pending
  const stageOrder = ['Manufacturer', 'Distributor', 'Retailer', 'Customer']
  const currentIdx = stageOrder.indexOf(product.stage)
  const targetIdx = stageOrder.indexOf(stageId)

  // If the target stage is strictly ahead of current stage, it has NOT been recorded
  if (targetIdx > currentIdx) {
    return {
      isRecorded: false,
      timestamp: null,
      location: null,
      handler: null,
      note: 'Awaiting handover and physical arrival verification.',
      status: 'Pending',
    }
  }

  // Target stage matches current stage or earlier stage
  return {
    isRecorded: true,
    timestamp: product.updated,
    location: product.originLocation || 'Regional Distribution Facility',
    handler: `${stageId} Operations`,
    note: `${stageId} milestone handover completed.`,
    status: product.status || (stageId === 'Customer' ? 'Delivered' : 'In Transit'),
  }
}

export default function TrackProduct({ onNavigate, navParams }) {
  const [searchId, setSearchId] = useState(navParams ? String(navParams) : '')
  const [activeProduct, setActiveProduct] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [allProducts, setAllProducts] = useState([])
  
  // Handover form state
  const [receivingParty, setReceivingParty] = useState('')
  const [handoverLocation, setHandoverLocation] = useState('')
  const [handoverNotes, setHandoverNotes] = useState('')
  const [handoverErrors, setHandoverErrors] = useState({})
  const [handoverConfirmation, setHandoverConfirmation] = useState(null)

  function resetHandoverForm() {
    setReceivingParty('')
    setHandoverLocation('')
    setHandoverNotes('')
    setHandoverErrors({})
  }

  // Load available products from storage
  useEffect(() => {
    const list = getStoredProducts()
    setAllProducts(list)

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

  // Real-time synchronization with localStorage changes
  useEffect(() => {
    function handleStorageSync() {
      const list = getStoredProducts()
      setAllProducts(list)
      if (activeProduct?.id) {
        const match = getProductById(activeProduct.id)
        if (match) setActiveProduct(match)
      }
    }

    window.addEventListener('storage', handleStorageSync)
    window.addEventListener('producttrace_storage_update', handleStorageSync)
    return () => {
      window.removeEventListener('storage', handleStorageSync)
      window.removeEventListener('producttrace_storage_update', handleStorageSync)
    }
  }, [activeProduct?.id])

  function handleSearch(e) {
    if (e) e.preventDefault()
    setHandoverConfirmation(null)
    resetHandoverForm()

    const trimmed = searchId.trim()
    if (!trimmed) {
      setSearchError('Please enter a Product ID to track.')
      setActiveProduct(null)
      return
    }

    const match = getProductById(trimmed)
    if (!match) {
      setSearchError(`No product found with ID "${trimmed}". Check the identifier or register this product first.`)
      setActiveProduct(null)
      return
    }

    setActiveProduct(match)
    setSearchError('')
  }

  function handleQuickSelect(id) {
    if (!id) return
    setSearchId(id)
    setHandoverConfirmation(null)
    resetHandoverForm()
    const match = getProductById(id)
    if (match) {
      setActiveProduct(match)
      setSearchError('')
    }
  }

  function handleSubmitHandover(e) {
    if (e) e.preventDefault()
    setHandoverConfirmation(null)

    const errors = {}
    if (!receivingParty.trim()) {
      errors.receivingParty = 'Receiving party / organization name is required.'
    }
    if (!handoverLocation.trim()) {
      errors.location = 'Handover location & facility is required.'
    }

    if (Object.keys(errors).length > 0) {
      setHandoverErrors(errors)
      return
    }

    setHandoverErrors({})

    const res = recordHandover({
      productId: activeProduct.id,
      receivingParty: receivingParty.trim(),
      location: handoverLocation.trim(),
      notes: handoverNotes.trim(),
    })

    if (!res.success) {
      setHandoverErrors({ form: res.error || 'Could not record handover.' })
      return
    }

    setActiveProduct(res.product)
    setAllProducts(getStoredProducts())
    setHandoverConfirmation({
      stage: res.product.stage,
      status: res.product.status,
      timestamp: res.product.updated,
      handler: receivingParty.trim(),
      location: handoverLocation.trim(),
      notes: handoverNotes.trim(),
    })
    resetHandoverForm()
  }

  const stageOrder = ['Manufacturer', 'Distributor', 'Retailer', 'Customer']
  const currentStageIndex = useMemo(() => {
    if (!activeProduct) return -1
    return stageOrder.indexOf(activeProduct.stage)
  }, [activeProduct])

  // Progress percentage
  const progressPercent = useMemo(() => {
    if (!activeProduct) return 0
    if (activeProduct.stage === 'Customer' && activeProduct.status === 'Delivered') return 100
    return Math.min(100, Math.round(((currentStageIndex + 1) / 4) * 100))
  }, [activeProduct, currentStageIndex])

  const nextStageInfo = useMemo(() => {
    if (!activeProduct) return null
    return getNextStageInfo(activeProduct.stage)
  }, [activeProduct])

  const isJourneyComplete = useMemo(() => {
    if (!activeProduct) return false
    return activeProduct.stage === 'Customer' && activeProduct.status === 'Delivered'
  }, [activeProduct])

  return (
    <section className="page track-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-badge">
          <span className="dot dot-teal" />
          <span>Auditable Supply-Chain Milestones</span>
        </div>
        <h2>Track Product Journey</h2>
        <p>
          Search by Product ID or select a registered product below to view verified milestone records, locations, and handover timestamps.
        </p>
      </div>

      {/* Search & Selection Card */}
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
              placeholder="Search by Product ID (e.g. PT-10490)..."
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
                  setUpdateFeedback('')
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

        {/* Registered Products Dropdown Selector */}
        {allProducts.length > 0 && (
          <div className="track-select-wrap">
            <label htmlFor="product-select" className="track-select-label">
              Or select an existing registered product:
            </label>
            <select
              id="product-select"
              className="track-select-dropdown"
              value={activeProduct?.id || ''}
              onChange={(e) => handleQuickSelect(e.target.value)}
            >
              <option value="">-- Choose from {allProducts.length} registered product{allProducts.length === 1 ? '' : 's'} --</option>
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} &bull; {p.name} ({p.stage} — {p.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Select Chips */}
        {allProducts.length > 0 && (
          <div className="quick-select-row">
            <span className="quick-select-label">Quick Select:</span>
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

      {/* Error Banner */}
      {searchError && (
        <div className="alert alert-error" role="alert">
          <div>
            <p className="alert-title">Product ID Not Found</p>
            <p className="alert-desc">{searchError}</p>
          </div>
          {onNavigate && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onNavigate('register')}
              style={{ marginLeft: 14, flexShrink: 0 }}
            >
              + Register Product &rarr;
            </button>
          )}
        </div>
      )}

      {/* Handover Confirmation Notification */}
      {handoverConfirmation && (
        <div className="alert alert-success handover-confirm-banner" role="status">
          <div className="confirm-icon-badge" aria-hidden="true">✓</div>
          <div className="confirm-body">
            <p className="alert-title">Supply-Chain Handover Confirmed & Stored</p>
            <p className="alert-desc">
              Advanced to <strong>{handoverConfirmation.stage}</strong> stage (Status: <strong>{handoverConfirmation.status}</strong>).
              Logged at <strong>{handoverConfirmation.timestamp}</strong> at <em>{handoverConfirmation.location}</em> by <em>{handoverConfirmation.handler}</em>.
              {handoverConfirmation.notes ? ` Remarks: "${handoverConfirmation.notes}"` : ''} Stored permanently in local ledger and reflected on dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {activeProduct ? (
        <div className="track-results-wrap">
          {/* Product Specifications Card */}
          <div className="card product-summary-card">
            <div className="product-summary-header">
              <div>
                <div className="product-id-tag mono-pill">{activeProduct.id}</div>
                <h3 className="product-headline">{activeProduct.name}</h3>
                <p className="product-subline">
                  Manufacturer: <strong>{activeProduct.manufacturer}</strong> &bull; Origin: {activeProduct.originLocation}
                </p>
              </div>
              <div className="product-summary-right">
                <span className={`badge badge-lg ${statusClass[activeProduct.status] || 'badge-navy'}`}>
                  {activeProduct.status}
                </span>
                <span className="last-sync-tag">Last Record Update: {activeProduct.updated}</span>
              </div>
            </div>

            {/* Actual Product Details Grid */}
            <div className="product-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Product ID</span>
                <span className="meta-val mono">{activeProduct.id}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Product Name</span>
                <span className="meta-val">{activeProduct.name}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Manufacturer Name</span>
                <span className="meta-val">{activeProduct.manufacturer}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Manufacturing Date</span>
                <span className="meta-val">{activeProduct.manufacturingDate}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Origin Facility Location</span>
                <span className="meta-val">{activeProduct.originLocation}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Current Active Stage</span>
                <span className="meta-val stage-highlight">{activeProduct.stage}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Tracking Status</span>
                <span className="meta-val">{activeProduct.status}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Authenticity Audit</span>
                <span
                  className="meta-val verify-link"
                  onClick={() => onNavigate && onNavigate('verify', activeProduct.id)}
                  title="Verify authenticity of this record"
                >
                  Verify Record &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Progress Indicator Card */}
          <div className="card journey-progress-card">
            <div className="journey-progress-header">
              <div>
                <span className="journey-progress-kicker">Supply-Chain Completion</span>
                <h4 className="journey-progress-title">
                  Stage {currentStageIndex + 1} of 4 &bull; {activeProduct.stage} ({progressPercent}%)
                </h4>
              </div>
              <span className="journey-progress-status-badge">
                {progressPercent === 100 ? 'End-to-End Complete' : `${4 - (currentStageIndex + 1)} stage${4 - (currentStageIndex + 1) === 1 ? '' : 's'} pending`}
              </span>
            </div>
            <div className="journey-progress-bar-bg" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
              <div className="journey-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* 4-Stage Supply-Chain Timeline */}
          <div className="card timeline-card">
            <div className="card-header-bar">
              <div>
                <h3>Supply Chain Journey Timeline</h3>
                <p>Auditable progression across the 4 stages. Unrecorded stages remain pending.</p>
              </div>
              <span className="section-tag">
                Active Stage: {activeProduct.stage}
              </span>
            </div>

            <div className="timeline-container">
              {STAGE_STEPS.map((stage, idx) => {
                const milestone = resolveMilestoneData(activeProduct, stage.stageName)
                const isCompleted = idx < currentStageIndex || (activeProduct.stage === 'Customer' && activeProduct.status === 'Delivered')
                const isCurrent = idx === currentStageIndex && !(activeProduct.stage === 'Customer' && activeProduct.status === 'Delivered')
                const isPending = idx > currentStageIndex

                let stepState = 'pending'
                if (isCompleted) stepState = 'completed'
                else if (isCurrent) stepState = 'current'

                return (
                  <div className={`timeline-row ${stepState}`} key={stage.id}>
                    {/* Left Gutter: Bullet Node & Vertical Connector */}
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
                      {idx < STAGE_STEPS.length - 1 && (
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
                              {isCompleted ? '✓ Completed' : isCurrent ? '● Active Stage' : '○ Pending'}
                            </span>
                          </div>
                          <p className="milestone-role">{stage.role}</p>
                        </div>
                        <div className="milestone-time">
                          {milestone?.isRecorded && milestone.timestamp ? (
                            <span className="timestamp-recorded">{milestone.timestamp}</span>
                          ) : (
                            <span className="timestamp-pending">Pending handover</span>
                          )}
                        </div>
                      </div>

                      <p className="milestone-desc">{stage.description}</p>

                      {/* Actual Recorded Details vs Unrecorded Pending */}
                      <div className="milestone-footer-row">
                        {milestone?.isRecorded ? (
                          <>
                            <span className="milestone-meta-pill recorded">
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              Location: {milestone.location}
                            </span>
                            <span className="milestone-meta-pill recorded">
                              Handler: {milestone.handler}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="milestone-meta-pill pending">
                              Location: <em>Unrecorded</em>
                            </span>
                            <span className="milestone-meta-pill pending">
                              Handler: <em>Awaiting stage assignment</em>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* End-to-End Completed State */}
            {isJourneyComplete && (
              <div className="card journey-complete-card">
                <div className="journey-complete-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <div className="complete-status-badge">✓ End-to-End Complete</div>
                  <h4 className="complete-title">Full Supply-Chain Journey Completed</h4>
                  <p className="complete-desc">
                    This product has reached the end consumer and is confirmed as Delivered. All 4 supply-chain milestones have been verified and permanently recorded. Duplicate handovers are locked.
                  </p>
                </div>
              </div>
            )}

            {/* Functional Supply-Chain Handover Form */}
            {!isJourneyComplete && nextStageInfo && (
              <div className="card handover-card">
                <div className="handover-header">
                  <div>
                    <span className="handover-kicker">Sequential Custody Handover</span>
                    <h4 className="handover-title">Record Next Supply-Chain Handover</h4>
                    <p className="handover-subtitle">
                      Transfer product custody to the next sequential supply-chain partner. Stages cannot be skipped.
                    </p>
                  </div>
                </div>

                {/* Stage Progression Banner */}
                <div className="handover-progression-bar">
                  <div className="progression-pill current">
                    <span className="prog-label">Current Stage</span>
                    <span className="prog-value">{activeProduct.stage}</span>
                  </div>
                  <div className="progression-arrow" aria-hidden="true">&rarr;</div>
                  <div className="progression-pill target">
                    <span className="prog-label">Next Required Stage</span>
                    <span className="prog-value">{nextStageInfo.nextStage}</span>
                  </div>
                  <div className="progression-status-target">
                    New Status: <span className="mono">{nextStageInfo.nextStatus}</span>
                  </div>
                </div>

                {handoverErrors.form && (
                  <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>
                    <div>
                      <p className="alert-title">Handover Validation Error</p>
                      <p className="alert-desc">{handoverErrors.form}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmitHandover} className="handover-form">
                  <div className="handover-form-grid">
                    <div className="handover-input-group">
                      <label htmlFor="receivingParty" className="handover-label">
                        Receiving Party / Organization <span className="req">*</span>
                      </label>
                      <input
                        id="receivingParty"
                        type="text"
                        value={receivingParty}
                        onChange={(e) => {
                          setReceivingParty(e.target.value)
                          if (handoverErrors.receivingParty) setHandoverErrors((prev) => ({ ...prev, receivingParty: null }))
                        }}
                        placeholder={nextStageInfo.defaultHandlerHint}
                        className={`handover-input ${handoverErrors.receivingParty ? 'input-error' : ''}`}
                      />
                      {handoverErrors.receivingParty ? (
                        <span className="handover-error-text">{handoverErrors.receivingParty}</span>
                      ) : (
                        <span className="handover-help-text">Authorized company, handler, or recipient name.</span>
                      )}
                    </div>

                    <div className="handover-input-group">
                      <label htmlFor="handoverLocation" className="handover-label">
                        Handover Facility & Location <span className="req">*</span>
                      </label>
                      <input
                        id="handoverLocation"
                        type="text"
                        value={handoverLocation}
                        onChange={(e) => {
                          setHandoverLocation(e.target.value)
                          if (handoverErrors.location) setHandoverErrors((prev) => ({ ...prev, location: null }))
                        }}
                        placeholder={nextStageInfo.defaultLocationHint}
                        className={`handover-input ${handoverErrors.location ? 'input-error' : ''}`}
                      />
                      {handoverErrors.location ? (
                        <span className="handover-error-text">{handoverErrors.location}</span>
                      ) : (
                        <span className="handover-help-text">City, regional hub, distribution center, or destination.</span>
                      )}
                    </div>

                    <div className="handover-input-group full-span">
                      <label htmlFor="handoverNotes" className="handover-label">
                        Handover Notes / Verification Remarks <span className="opt">(Optional)</span>
                      </label>
                      <input
                        id="handoverNotes"
                        type="text"
                        value={handoverNotes}
                        onChange={(e) => setHandoverNotes(e.target.value)}
                        placeholder="e.g. Temperature checks passed, freight seal intact, quantity verified."
                        className="handover-input"
                      />
                      <span className="handover-help-text">Condition notes, inspection timestamps, or seal numbers.</span>
                    </div>
                  </div>

                  <div className="handover-footer-bar">
                    <button type="submit" className="btn btn-handover">
                      {nextStageInfo.actionLabel} &rarr;
                    </button>
                    <span className="handover-audit-tag">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Actual timestamp will be captured upon submission
                    </span>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State Prompt When No Product is Selected */
        !searchError && (
          <div className="card track-empty-prompt">
            <div className="empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="12" r="8" />
                <polyline points="12 7 12 12 15 15" />
              </svg>
            </div>
            <h3>Select or Search for a Product to Track</h3>
            <p>
              Enter a Product ID in the search input above or select an existing registered product from the dropdown to view its live supply-chain milestone history.
            </p>
            {allProducts.length === 0 && onNavigate && (
              <button
                type="button"
                className="btn"
                onClick={() => onNavigate('register')}
                style={{ marginTop: 10 }}
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
