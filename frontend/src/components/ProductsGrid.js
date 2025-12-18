function ProductsGrid({ products }) {
  return (
    <div>
      <h3>Products</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} className="card">
            <h4>{p.name}</h4>
            <p>₹{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsGrid;
