import { createOrder } from "./api/order.api";

function Products() {
  const products = [
    { id: 1, name: "Lipstick", price: 499 },
  ];

  const placeOrder = async (product) => {
    await createOrder({
      items: [{ product_id: product.id, quantity: 1 }],
      shipping_address: "Default Address",
    });
    alert("Order placed");
  };

  return (
    <div>
      <h2>Products</h2>
      {products.map((p) => (
        <div key={p.id}>
          <p>
            {p.name} - ₹{p.price}
          </p>
          <button onClick={() => placeOrder(p)}>Place Order</button>
        </div>
      ))}
    </div>
  );
}

export default Products;
