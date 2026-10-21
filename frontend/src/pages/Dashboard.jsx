const stages = [
  { title: 'Manufacturer', copy: 'Register origin details when a product enters the chain.' },
  { title: 'Distributor', copy: 'Capture handover as goods move through distribution.' },
  { title: 'Retailer', copy: 'Record arrival at the selling location.' },
  { title: 'Customer', copy: 'Close the journey when the product reaches the buyer.' },
]

export default function Dashboard({ onNavigate }) {
  return (
    <section className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>
          Monitor the product journey from manufacturer to customer. Use the pages below to register, track, and verify records.
        </p>
      </div>

      <div className="journey" aria-label="Product journey stages">
        {stages.map((stage, index) => (
          <article className="stage" key={stage.title}>
            <div className="stage-index">{index + 1}</div>
            <h3>{stage.title}</h3>
            <p>{stage.copy}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <button className="card action-card" type="button" onClick={() => onNavigate('register')}>
          <h3>Register Product</h3>
          <p>Create a new on-chain product record at the manufacturer stage.</p>
        </button>
        <button className="card action-card" type="button" onClick={() => onNavigate('track')}>
          <h3>Track Product</h3>
          <p>Follow each recorded stage across the supply chain.</p>
        </button>
        <button className="card action-card" type="button" onClick={() => onNavigate('verify')}>
          <h3>Verify Product</h3>
          <p>Confirm that tracking history has not been altered.</p>
        </button>
        <article className="card">
          <h3>Records</h3>
          <p className="empty-copy">No tracking records yet. Blockchain logic will be added in a later stage.</p>
        </article>
      </div>
    </section>
  )
}
