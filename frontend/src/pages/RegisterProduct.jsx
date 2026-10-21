import { useState } from 'react'
import { isProductIdDuplicate, saveProduct } from '../utils/storage.js'

const initialForm = {
  productName: '',
  productId: '',
  manufacturer: '',
  manufacturingDate: '',
  originLocation: '',
}

export default function RegisterProduct({ onNavigate }) {
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [duplicateError, setDuplicateError] = useState('')
  const [successProduct, setSuccessProduct] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (duplicateError) {
      setDuplicateError('')
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
      newErrors.productId = `Product ID "${trimmedId}" already exists. Please use a unique ID.`
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer name is required.'
    }

    if (!formData.manufacturingDate) {
      newErrors.manufacturingDate = 'Manufacturing date is required.'
    }

    if (!formData.originLocation.trim()) {
      newErrors.originLocation = 'Origin location is required.'
    }

    return newErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    setDuplicateError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const result = saveProduct(formData)
    if (!result.success) {
      setDuplicateError(result.error || 'Failed to register product.')
      return
    }

    setSuccessProduct(result.product)
    setFormData(initialForm)
    setErrors({})
  }

  function handleReset() {
    setFormData(initialForm)
    setErrors({})
    setDuplicateError('')
  }

  return (
    <section className="page">
      <div className="page-header">
        <h2>Register Product</h2>
        <p>
          Capture origin details to register a new product in the tracking system. Stored records are saved locally and update the dashboard.
        </p>
      </div>

      {successProduct && (
        <div className="alert alert-success" role="status">
          <div>
            <p className="alert-title">✓ Product registered successfully</p>
            <p className="alert-desc">
              <strong>{successProduct.name}</strong> (<code>{successProduct.id}</code>) was registered with manufacturer <em>{successProduct.manufacturer}</em> and saved to local storage.
            </p>
            <div className="alert-actions">
              {onNavigate && (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => onNavigate('dashboard')}
                >
                  View on Dashboard
                </button>
              )}
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setSuccessProduct(null)}
              >
                Register Another Product
              </button>
            </div>
          </div>
        </div>
      )}

      {duplicateError && (
        <div className="alert alert-error" role="alert">
          <div>
            <p className="alert-title">Cannot Register Product</p>
            <p className="alert-desc">{duplicateError}</p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header-bar">
          <h3>Product Information</h3>
          <p>All fields marked with an asterisk (<span className="required-star">*</span>) are mandatory.</p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid-2">
            <label className="field">
              <span>
                Product Name <span className="required-star">*</span>
              </span>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className={errors.productName ? 'input-error' : ''}
                placeholder="e.g. Organic Green Tea"
              />
              {errors.productName && <p className="field-error">{errors.productName}</p>}
            </label>

            <label className="field">
              <span>
                Product ID <span className="required-star">*</span>
              </span>
              <input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className={errors.productId ? 'input-error' : ''}
                placeholder="e.g. PT-10490"
              />
              {errors.productId && <p className="field-error">{errors.productId}</p>}
            </label>
          </div>

          <div className="form-grid-2">
            <label className="field">
              <span>
                Manufacturer Name <span className="required-star">*</span>
              </span>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className={errors.manufacturer ? 'input-error' : ''}
                placeholder="e.g. Kyoto Farms Co."
              />
              {errors.manufacturer && <p className="field-error">{errors.manufacturer}</p>}
            </label>

            <label className="field">
              <span>
                Manufacturing Date <span className="required-star">*</span>
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
            <span>
              Origin Location <span className="required-star">*</span>
            </span>
            <input
              type="text"
              name="originLocation"
              value={formData.originLocation}
              onChange={handleChange}
              className={errors.originLocation ? 'input-error' : ''}
              placeholder="e.g. Kyoto Facility #3, Japan"
            />
            {errors.originLocation && <p className="field-error">{errors.originLocation}</p>}
          </label>

          <div className="form-actions">
            <button className="btn" type="submit">
              Register product
            </button>
            <button className="btn btn-secondary" type="button" onClick={handleReset}>
              Clear
            </button>
            {onNavigate && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => onNavigate('dashboard')}
                style={{ marginLeft: 'auto' }}
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
