import { useState } from 'react'
import { isProductIdDuplicate, saveProduct, generateRecordFingerprint } from '../utils/storage.js'

function getTodayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function generateSuggestedId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000)
  return `PT-${randomNum}`
}

export default function RegisterProduct({ onNavigate }) {
  const [formData, setFormData] = useState({
    productName: '',
    productId: '',
    manufacturer: '',
    manufacturingDate: getTodayString(),
    originLocation: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [registeredRecord, setRegisteredRecord] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (submitError) {
      setSubmitError('')
    }
  }

  function handleAutoGenerateId() {
    let candidate = generateSuggestedId()
    let attempts = 0
    while (isProductIdDuplicate(candidate) && attempts < 10) {
      candidate = generateSuggestedId()
      attempts++
    }
    setFormData((prev) => ({ ...prev, productId: candidate }))
    if (errors.productId) {
      setErrors((prev) => ({ ...prev, productId: '' }))
    }
  }

  function validate() {
    const newErrors = {}

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required.'
    }

    const trimmedId = formData.productId.trim()
    if (!trimmedId) {
      newErrors.productId = 'Product ID is required.'
    } else if (isProductIdDuplicate(trimmedId)) {
      newErrors.productId = `Product ID "${trimmedId}" is already registered. Please choose a unique ID.`
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer name is required.'
    }

    if (!formData.manufacturingDate) {
      newErrors.manufacturingDate = 'Manufacturing date is required.'
    }

    if (!formData.originLocation.trim()) {
      newErrors.originLocation = 'Origin facility or location is required.'
    }

    return newErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const result = saveProduct(formData)
    if (!result.success) {
      setSubmitError(result.error || 'Failed to register product.')
      return
    }

    setRegisteredRecord(result.product)
    setErrors({})
  }

  function handleReset() {
    setFormData({
      productName: '',
      productId: '',
      manufacturer: '',
      manufacturingDate: getTodayString(),
      originLocation: '',
    })
    setErrors({})
    setSubmitError('')
    setRegisteredRecord(null)
  }

  return (
    <section className="page register-page">
      <div className="page-header">
        <div className="page-header-badge">
          <span className="dot dot-navy" />
          <span>Stage 1 of 4 &bull; Product Creation</span>
        </div>
        <h2>Register Product on Ledger</h2>
        <p>
          Capture manufacturer origin records to initialize immutable supply-chain tracking. Each product receives a unique ID recorded at the source.
        </p>
      </div>

      {/* Success Modal / Card */}
      {registeredRecord && (
        <div className="card success-passport-card" role="status">
          <div className="passport-header">
            <div className="passport-badge-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div>
              <div className="passport-status-pill">Record Initialized</div>
              <h3 className="passport-title">Product Successfully Registered</h3>
              <p className="passport-sub">Initial origin milestone recorded at the Manufacturer stage.</p>
            </div>
          </div>

          <div className="passport-details-grid">
            <div className="passport-field">
              <span className="passport-label">Product ID</span>
              <span className="passport-value mono-pill">{registeredRecord.id}</span>
            </div>
            <div className="passport-field">
              <span className="passport-label">Product Name</span>
              <span className="passport-value highlight">{registeredRecord.name}</span>
            </div>
            <div className="passport-field">
              <span className="passport-label">Manufacturer</span>
              <span className="passport-value">{registeredRecord.manufacturer}</span>
            </div>
            <div className="passport-field">
              <span className="passport-label">Production Date</span>
              <span className="passport-value">{registeredRecord.manufacturingDate}</span>
            </div>
            <div className="passport-field passport-full-width">
              <span className="passport-label">Origin Facility Location</span>
              <span className="passport-value">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {registeredRecord.originLocation}
              </span>
            </div>
            <div className="passport-field passport-full-width">
              <span className="passport-label">Simulated Record Fingerprint</span>
              <span className="passport-hash mono">{generateRecordFingerprint(registeredRecord)}</span>
            </div>
          </div>

          <div className="passport-actions">
            {onNavigate && (
              <button
                type="button"
                className="btn"
                onClick={() => onNavigate('track', registeredRecord.id)}
              >
                Track Journey Timeline &rarr;
              </button>
            )}
            {onNavigate && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('dashboard')}
              >
                Go to Dashboard
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              + Register Another Product
            </button>
          </div>
        </div>
      )}

      {/* Form Error Banner */}
      {submitError && (
        <div className="alert alert-error" role="alert">
          <div>
            <p className="alert-title">Registration Failed</p>
            <p className="alert-desc">{submitError}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      {!registeredRecord && (
        <div className="card form-card">
          <div className="card-header-bar">
            <div>
              <h3>Product Specifications</h3>
              <p>Enter the verifiable product details recorded at the manufacturing facility.</p>
            </div>
            <span className="card-step-badge">Stage 1: Manufacturer</span>
          </div>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2">
              <label className="field">
                <span className="field-label-row">
                  <span>Product Name <span className="required-star">*</span></span>
                  <span className="field-hint">e.g. Organic Green Tea</span>
                </span>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className={errors.productName ? 'input-error' : ''}
                  placeholder="Enter commercial product name"
                  autoFocus
                />
                {errors.productName && <p className="field-error">{errors.productName}</p>}
              </label>

              <label className="field">
                <span className="field-label-row">
                  <span>Product ID (Unique Key) <span className="required-star">*</span></span>
                  <button
                    type="button"
                    className="btn-inline-link"
                    onClick={handleAutoGenerateId}
                    title="Generate unique random Product ID"
                  >
                    ⚡ Auto-Generate
                  </button>
                </span>
                <div className="input-with-button">
                  <input
                    type="text"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className={errors.productId ? 'input-error mono-input' : 'mono-input'}
                    placeholder="e.g. PT-10490"
                  />
                </div>
                {errors.productId && <p className="field-error">{errors.productId}</p>}
              </label>
            </div>

            <div className="form-grid-2">
              <label className="field">
                <span className="field-label-row">
                  <span>Manufacturer Name <span className="required-star">*</span></span>
                  <span className="field-hint">Registered corporate entity</span>
                </span>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className={errors.manufacturer ? 'input-error' : ''}
                  placeholder="e.g. Kyoto Farms Co., Ltd."
                />
                {errors.manufacturer && <p className="field-error">{errors.manufacturer}</p>}
              </label>

              <label className="field">
                <span className="field-label-row">
                  <span>Manufacturing Date <span className="required-star">*</span></span>
                  <span className="field-hint">Date of origin packaging</span>
                </span>
                <input
                  type="date"
                  name="manufacturingDate"
                  value={formData.manufacturingDate}
                  onChange={handleChange}
                  className={errors.manufacturingDate ? 'input-error' : ''}
                />
                {errors.manufacturingDate && (
                  <p className="field-error">{errors.manufacturingDate}</p>
                )}
              </label>
            </div>

            <label className="field">
              <span className="field-label-row">
                <span>Origin Facility & Location <span className="required-star">*</span></span>
                <span className="field-hint">City, Country, and Facility Name</span>
              </span>
              <input
                type="text"
                name="originLocation"
                value={formData.originLocation}
                onChange={handleChange}
                className={errors.originLocation ? 'input-error' : ''}
                placeholder="e.g. Kyoto Facility #3, Uji Region, Japan"
              />
              {errors.originLocation && <p className="field-error">{errors.originLocation}</p>}
            </label>

            <div className="form-info-callout">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p>
                Once registered, initial status is marked as <strong>Registered</strong> at the <strong>Manufacturer</strong> stage. You can track handover progress on the Track Journey page.
              </p>
            </div>

            <div className="form-actions">
              <button className="btn" type="submit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Register Product on Ledger
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleReset}>
                Reset
              </button>
              {onNavigate && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  style={{ marginLeft: 'auto' }}
                >
                  Cancel & Return
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
