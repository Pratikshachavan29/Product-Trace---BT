import { useState, useEffect } from 'react'
import { getStoredProducts } from '../utils/storage.js'

const stages = [
  { title: 'Manufacturer', copy: 'Origin recorded at the source facility.' },
  { title: 'Distributor', copy: 'Handover logged during distribution.' },
  { title: 'Retailer', copy: 'Arrival captured at the selling location.' },
  { title: 'Customer', copy: 'Journey closed with the buyer.' },
]

const statusClass = {
  'In Transit': 'badge-blue',
  Delivered: 'badge-teal',
  Registered: 'badge-navy',
  Verified: 'badge-mint',
}

export default function Dashboard({ onNavigate }) {
  const [products, setProducts] = useState(getStoredProducts)

  useEffect(() => {
    // Refresh products on mount and whenever window gets focus
    setProducts(getStoredProducts())

    function handleStorageChange(e) {
      if (!e.key || e.key === 'producttrace_products') {
        setProducts(getStoredProducts())
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const totalCount = products.length
  const inTransitCount = products.filter((p) => p.status === 'In Transit').length
  const deliveredCount = products.filter((p) => p.status === 'Delivered').length
  const verifiedCount = products.filter((p) => p.status === 'Verified').length

  const dynamicStats = [
    { label: 'Total Products', value: String(totalCount), hint: 'Registered in tracking system', tone: 'navy' },
    { label: 'In Transit', value: String(inTransitCount), hint: 'Moving between stages', tone: 'blue' },
    { label: 'Delivered', value: String(deliveredCount), hint: 'Reached the customer', tone: 'teal' },
    { label: 'Verified', value: String(verifiedCount), hint: 'History confirmed intact', tone: 'mint' },
  ]

  return (
    <section className="page dashboard-page">
      <div className="page-header dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p>Monitor product movement from manufacturer to customer in one place.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" type="button" onClick={() => onNavigate('track')}>
            Track product
          </button>
          <button className="btn" type="button" onClick={() => onNavigate('register')}>
            Register product
          </button>
        </div>
      </div>

      <div className="stat-grid">
        {dynamicStats.map((stat) => (
          <article className={`stat-card stat-${stat.tone}`} key={stat.label}>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-hint">{stat.hint}</p>
          </article>
        ))}
      </div>

      <section className="card pipeline-card" aria-label="Supply chain progress">
        <div className="section-heading">
          <h3>Supply chain progress</h3>
          <p>Each product moves through four recorded stages.</p>
        </div>
        <ol className="pipeline">
          {stages.map((stage, index) => (
            <li className="pipeline-step" key={stage.title}>
              <div className="pipeline-node">{index + 1}</div>
              {index < stages.length - 1 ? <span className="pipeline-line" aria-hidden="true" /> : null}
              <h4>{stage.title}</h4>
              <p>{stage.copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card table-card">
        <div className="section-heading">
          <h3>Recent product tracking</h3>
          <p>Live tracking records from local storage. New registrations appear at the top.</p>
        </div>
        <div className="table-wrap">
          <table className="tracking-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Current Stage</th>
                <th>Last Updated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                    No products registered yet. Click &quot;Register product&quot; above to add your first product.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="mono">{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.stage}</td>
                    <td>{product.updated}</td>
                    <td>
                      <span className={`badge ${statusClass[product.status] || 'badge-navy'}`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
