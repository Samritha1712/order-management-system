import { useEffect, useState } from "react";
import axios from "../api/axios";

import StatCard from "../components/StatCard";
import OrdersTable from "../components/OrdersTable";
import ProductsGrid from "../components/ProductsGrid";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };

    const ordersRes = await axios.get("/orders", { headers });
    const productsRes = await axios.get("/products", { headers });

    setOrders(ordersRes.data || []);
    setProducts(productsRes.data || []);
  };

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>

      <div className="stats">
        <StatCard title="Total Orders" value={orders.length} />
        <StatCard title="Total Products" value={products.length} />
      </div>

      <OrdersTable orders={orders} />
      <ProductsGrid products={products} />
    </div>
  );
}

export default AdminDashboard;
