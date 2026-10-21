export default function TrackProduct() {
  return (
    <section className="page">
      <div className="page-header">
        <h2>Track Product</h2>
        <p>Look up a product to view every recorded stage from manufacturer to customer.</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <form className="form" onSubmit={(event) => event.preventDefault()}>
            <label className="field">
              <span>Product ID</span>
              <input type="text" name="productId" placeholder="Enter product ID" />
            </label>
            <button className="btn" type="submit">
              View journey
            </button>
          </form>
        </div>
        <article className="card">
          <h3>Journey timeline</h3>
          <p className="empty-copy">
            No journey is displayed yet. Tracking results will appear here after blockchain integration.
          </p>
        </article>
      </div>
    </section>
  )
}
