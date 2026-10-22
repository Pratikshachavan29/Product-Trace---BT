import ActivityHistorySection from '../components/ActivityHistorySection.jsx'

export default function ActivityHistory({ onNavigate }) {
  return (
    <div className="page activity-page">
      <div className="page-header">
        <div className="page-header-badge">
          <span className="dot dot-teal" />
          <span>Immutable Ledger Events</span>
        </div>
        <h2>Product Activity History</h2>
        <p>
          Comprehensive chronological log of product origin registrations and supply-chain custody handovers.
        </p>
      </div>

      <ActivityHistorySection onNavigate={onNavigate} title="All Supply Chain Activities" />
    </div>
  )
}
