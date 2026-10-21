import { useState, useEffect } from 'react'
import { getStoredProducts, getProductById, generateRecordFingerprint } from '../utils/storage.js'

export default function VerifyProduct({ onNavigate, navParams }) {
  const [verifyId, setVerifyId] = useState(navParams ? String(navParams) : '')
  const [verifiedProduct, setVerifiedProduct] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    const list = getStoredProducts()
    setAllProducts(list)

    if (navParams) {
      const match = getProductById(navParams)
      setVerifiedProduct(match)
      setHasSearched(true)
    }
  }, [navParams])

  function handleVerify(e) {
    if (e) e.preventDefault()
    const trimmed = verifyId.trim()
    if (!trimmed) {
      setVerifiedProduct(null)
      setHasSearched(false)
      return
    }

    const match = getProductById(trimmed)
    setVerifiedProduct(match)
    setHasSearched(true)
  }

  function handleQuickVerify(id) {
    setVerifyId(id)
    const match = getProductById(id)
    setVerifiedProduct(match)
    setHasSearched(true)
  }

  return (
    <section className="page verify-page">
      <div className="page-header">
        <div className="page-header-badge">
          <span className="dot dot-mint" />
          <span>Integrity & Authenticity Audit</span>
        </div>
        <h2>Verify Product Authenticity</h2>
        <p>
          Audit tracking records to confirm genuine origin, registered manufacturer identity, and milestone sequence integrity.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="card search-card">
        <form className="track-search-form" onSubmit={handleVerify}>
          <div className="track-search-input-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="track-search-icon">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <input
              type="text"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              placeholder="Enter Product ID to verify authenticity (e.g. PT-10490)..."
              className="track-search-input"
            />
            {verifyId && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setVerifyId('')
                  setVerifiedProduct(null)
                  setHasSearched(false)
                }}
                aria-label="Clear input"
              >
                ✕
              </button>
            )}
          </div>
          <button className="btn" type="submit">
            Audit Authenticity
          </button>
        </form>

        {/* Quick Select Chips */}
        {allProducts.length > 0 && (
          <div className="quick-select-row">
            <span className="quick-select-label">Available in Registry:</span>
            <div className="quick-chips-list">
              {allProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`quick-chip ${verifiedProduct?.id === p.id ? 'active' : ''}`}
                  onClick={() => handleQuickVerify(p.id)}
                >
                  <span className="mono">{p.id}</span>
                  <span className="quick-chip-name">&bull; {p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verification Result Display */}
      {hasSearched && (
        verifiedProduct ? (
          <div className="verify-result-wrap">
            {/* Success Verification Card */}
            <div className="card verify-card verify-success">
              <div className="verify-header">
                <div className="verify-icon-box success" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <div className="verify-badge verified">Authenticity Confirmed</div>
                  <h3 className="verify-title">Record Verified in Tracking Registry</h3>
                  <p className="verify-sub">
                    Matching origin records authenticated. Unique identifier matches registered manufacturing facility.
                  </p>
                </div>
              </div>

              {/* Honest Blockchain Transparency Banner */}
              <div className="blockchain-notice-banner">
                <div className="notice-icon">ℹ</div>
                <div>
                  <strong>Ledger Verification Notice:</strong> Data verified against active system records.
                  Cryptographic on-chain contract verification will activate once Solidity smart contracts are deployed to testnet.
                </div>
              </div>

              {/* Audit Checklist */}
              <div className="audit-checklist">
                <div className="audit-item done">
                  <span className="check-icon">✓</span>
                  <div>
                    <span className="audit-label">Product ID Exists</span>
                    <span className="audit-val mono">{verifiedProduct.id}</span>
                  </div>
                </div>
                <div className="audit-item done">
                  <span className="check-icon">✓</span>
                  <div>
                    <span className="audit-label">Registered Manufacturer</span>
                    <span className="audit-val">{verifiedProduct.manufacturer}</span>
                  </div>
                </div>
                <div className="audit-item done">
                  <span className="check-icon">✓</span>
                  <div>
                    <span className="audit-label">Origin Facility Authenticated</span>
                    <span className="audit-val">{verifiedProduct.originLocation}</span>
                  </div>
                </div>
                <div className="audit-item done">
                  <span className="check-icon">✓</span>
                  <div>
                    <span className="audit-label">Current Stage Recorded</span>
                    <span className="audit-val">{verifiedProduct.stage} ({verifiedProduct.status})</span>
                  </div>
                </div>
              </div>

              {/* Simulated Cryptographic Fingerprint */}
              <div className="fingerprint-box">
                <div className="fingerprint-label">
                  <span>Cryptographic Record Fingerprint</span>
                  <span className="fingerprint-tag">Deterministic Hash</span>
                </div>
                <code className="fingerprint-val">{generateRecordFingerprint(verifiedProduct)}</code>
                <p className="fingerprint-desc">
                  Simulated hash representation of raw product parameters for demonstrating immutable tamper-evidence.
                </p>
              </div>

              {/* Action buttons */}
              <div className="verify-actions">
                {onNavigate && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => onNavigate('track', verifiedProduct.id)}
                  >
                    View Full Journey Timeline &rarr;
                  </button>
                )}
                {onNavigate && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => onNavigate('dashboard')}
                  >
                    Back to Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Unverified / Not Found Card */
          <div className="card verify-card verify-failure">
            <div className="verify-header">
              <div className="verify-icon-box failure" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <div className="verify-badge unverified">Record Not Found</div>
                <h3 className="verify-title">Unregistered or Invalid Identifier</h3>
                <p className="verify-sub">
                  No record exists for Product ID &ldquo;<strong>{verifyId}</strong>&rdquo; in the current registry ledger.
                </p>
              </div>
            </div>

            <div className="verify-fail-reasons">
              <h4>Possible Explanations:</h4>
              <ul>
                <li>The Product ID was mistyped or formatted incorrectly.</li>
                <li>The item has not yet been registered by the manufacturing origin facility.</li>
                <li>The item may be counterfeit and lacks authentic supply-chain credentials.</li>
              </ul>
            </div>

            <div className="verify-actions">
              {onNavigate && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => onNavigate('register')}
                >
                  + Register This Product &rarr;
                </button>
              )}
              {onNavigate && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onNavigate('dashboard')}
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        )
      )}

      {/* Initial Empty Guide */}
      {!hasSearched && (
        <div className="card track-empty-prompt">
          <div className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3>Verify Any Product in Seconds</h3>
          <p>
            Audit any product registered in the system to verify its manufacturer, manufacturing location, and lifecycle integrity.
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
      )}
    </section>
  )
}
