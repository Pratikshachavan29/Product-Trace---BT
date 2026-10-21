export default function RegisterProduct() {
  return (
    <section className="page">
      <div className="page-header">
        <h2>Register Product</h2>
        <p>Capture manufacturer details for a new product. Submission to the blockchain will be added later.</p>
      </div>

      <div className="card">
        <form className="form" onSubmit={(event) => event.preventDefault()}>
          <label className="field">
            <span>Product name</span>
            <input type="text" name="productName" placeholder="Enter product name" />
          </label>
          <label className="field">
            <span>Batch or serial number</span>
            <input type="text" name="batchId" placeholder="Enter batch or serial number" />
          </label>
          <label className="field">
            <span>Manufacturer</span>
            <input type="text" name="manufacturer" placeholder="Enter manufacturer name" />
          </label>
          <label className="field">
            <span>Origin location</span>
            <input type="text" name="origin" placeholder="Enter origin location" />
          </label>
          <button className="btn" type="submit">
            Save product details
          </button>
        </form>
      </div>
    </section>
  )
}
