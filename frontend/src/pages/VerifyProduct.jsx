export default function VerifyProduct() {
  return (
    <section className="page">
      <div className="page-header">
        <h2>Verify Product</h2>
        <p>Check whether a product’s tracking history is complete and has not been modified.</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <form className="form" onSubmit={(event) => event.preventDefault()}>
            <label className="field">
              <span>Product ID</span>
              <input type="text" name="productId" placeholder="Enter product ID" />
            </label>
            <button className="btn" type="submit">
              Verify record
            </button>
          </form>
        </div>
        <article className="card">
          <h3>Verification result</h3>
          <p className="empty-copy">
            No verification result yet. Integrity checks will be connected to the smart contract in a later stage.
          </p>
        </article>
      </div>
    </section>
  )
}
