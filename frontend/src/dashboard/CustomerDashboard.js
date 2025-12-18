import OrdersTable from "../components/OrdersTable";
import ProductsGrid from "../components/ProductsGrid";

function CustomerDashboard() {
  return (
    <div>
      <h2>Customer Dashboard</h2>
      <ProductsGrid products={[]} />
      <OrdersTable orders={[]} />
    </div>
  );
}

export default CustomerDashboard;
