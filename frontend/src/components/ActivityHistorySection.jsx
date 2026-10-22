import { useState, useEffect, useMemo } from 'react'
import { getActivityHistory } from '../utils/storage.js'

const statusClass = {
  'In Transit': 'badge-blue',
  Delivered: 'badge-teal',
  Registered: 'badge-navy',
  Verified: 'badge-mint',
}

export default function ActivityHistorySection({ onNavigate, title = 'Product Activity History' }) {
  const [activities, setActivities] = useState(() => getActivityHistory())
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')

  useEffect(() => {
    function refreshActivities() {
      setActivities(getActivityHistory())
    }

    refreshActivities()

    window.addEventListener('storage', refreshActivities)
    window.addEventListener('producttrace_storage_update', refreshActivities)
    window.addEventListener('focus', refreshActivities)

    return () => {
      window.removeEventListener('storage', refreshActivities)
      window.removeEventListener('producttrace_storage_update', refreshActivities)
      window.removeEventListener('focus', refreshActivities)
    }
  }, [])

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Activity Type filter
      if (typeFilter !== 'all' && act.type !== typeFilter) {
        return false
      }

      // Stage filter
      if (stageFilter !== 'all' && act.stage !== stageFilter) {
        return false
      }

      // Search filter (ID, name, location, handler, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matchId = (act.productId || '').toLowerCase().includes(q)
        const matchName = (act.productName || '').toLowerCase().includes(q)
        const matchLoc = (act.location || '').toLowerCase().includes(q)
        const matchHandler = (act.handler || '').toLowerCase().includes(q)
        const matchNote = (act.notes || '').toLowerCase().includes(q)
        if (!matchId && !matchName && !matchLoc && !matchHandler && !matchNote) {
          return false
        }
      }

      return true
    })
  }, [activities, searchQuery, typeFilter, stageFilter])

  return (
    <section className="card activity-history-card">
      <div className="activity-card-header">
        <div>
          <div className="section-title-wrap">
            <span className="dot dot-teal" />
            <h3 className="activity-main-title">{title}</h3>
            <span className="section-tag">
              {activities.length} Event{activities.length === 1 ? '' : 's'} Logged
            </span>
          </div>
          <p className="activity-subline">
            Auditable trail of real registration and supply-chain custody handover events recorded in local storage.
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      {activities.length > 0 && (
        <div className="activity-toolbar">
          <div className="activity-search-wrap">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="activity-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="activity-search-input"
              placeholder="Filter by Product ID, name, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear filter search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="activity-filter-controls">
            {/* Filter by Activity Type */}
            <div className="filter-select-group">
              <label htmlFor="activity-type-filter" className="filter-label">
                Type:
              </label>
              <select
                id="activity-type-filter"
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="registration">Registrations Only</option>
                <option value="handover">Handovers Only</option>
              </select>
            </div>

            {/* Filter by Stage */}
            <div className="filter-select-group">
              <label htmlFor="activity-stage-filter" className="filter-label">
                Stage:
              </label>
              <select
                id="activity-stage-filter"
                className="filter-select"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="all">All Stages</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Retailer">Retailer</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Empty State: Zero activities in storage */}
      {activities.length === 0 ? (
        <div className="empty-state-card activity-empty">
          <div className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h4>No Activity Recorded Yet</h4>
          <p>
            Your supply-chain activity feed is clean. Real events will populate here automatically when products are registered or custody handovers are performed.
          </p>
          {onNavigate && (
            <button className="btn" type="button" onClick={() => onNavigate('register')}>
              + Register First Product
            </button>
          )}
        </div>
      ) : filteredActivities.length === 0 ? (
        /* Empty State: Search/filter yielded no results */
        <div className="empty-state-card search-empty">
          <div className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h4>No Matching Activities Found</h4>
          <p>
            No activity matches your search query &ldquo;<strong>{searchQuery}</strong>&rdquo;
            {typeFilter !== 'all' ? ` for type &ldquo;${typeFilter}&rdquo;` : ''}
            {stageFilter !== 'all' ? ` at stage &ldquo;${stageFilter}&rdquo;` : ''}.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={() => {
              setSearchQuery('')
              setTypeFilter('all')
              setStageFilter('all')
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Activity Feed List */
        <div className="activity-feed">
          {filteredActivities.map((act) => {
            const isReg = act.type === 'registration'
            const isDelivered = act.stage === 'Customer' && act.status === 'Delivered'

            return (
              <article key={act.id} className="activity-item">
                <div className={`activity-icon-node ${isReg ? 'node-reg' : isDelivered ? 'node-delivered' : 'node-handover'}`}>
                  {isReg ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  ) : isDelivered ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  )}
                </div>

                <div className="activity-content-box">
                  <div className="activity-header-line">
                    <div className="activity-primary-meta">
                      <span
                        className="mono-pill activity-pid-btn"
                        onClick={() => onNavigate && onNavigate('track', act.productId)}
                        title={`Track ${act.productId}`}
                      >
                        {act.productId}
                      </span>
                      <h4 className="activity-headline">{act.action}</h4>
                      <span className="activity-product-title">&bull; {act.productName}</span>
                    </div>

                    <div className="activity-time-meta">
                      <span className="activity-timestamp">{act.timestamp}</span>
                    </div>
                  </div>

                  <div className="activity-badges-line">
                    <span className="stage-pill">
                      <span className="stage-pill-dot" />
                      {act.stage}
                    </span>
                    <span className={`badge ${statusClass[act.status] || 'badge-navy'}`}>
                      {act.status}
                    </span>
                  </div>

                  <div className="activity-details-row">
                    {act.location && (
                      <span className="activity-meta-chip">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {act.location}
                      </span>
                    )}
                    {act.handler && (
                      <span className="activity-meta-chip">
                        Handler: <strong>{act.handler}</strong>
                      </span>
                    )}
                    {act.notes && (
                      <span className="activity-note-chip" title={act.notes}>
                        &ldquo;{act.notes}&rdquo;
                      </span>
                    )}
                  </div>
                </div>

                <div className="activity-action-box">
                  {onNavigate && (
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => onNavigate('track', act.productId)}
                      title={`Track journey for ${act.productId}`}
                    >
                      Track &rarr;
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
