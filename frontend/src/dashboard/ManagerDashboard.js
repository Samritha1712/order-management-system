import { useEffect, useState } from "react";
import axios from "../api/axios";
import Sidebar from "./Sidebar";
import OrdersTable from "../components/OrdersTable";

function ManagerDashboard() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("/orders", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setOrders(res.data));
  }, []);

  return (
    <div className="dashboard">
      <Sidebar role="manager" />

      <div className="content">
        <h2>Manager Dashboard</h2>
        <OrdersTable orders={orders} allowStatusUpdate />
      </div>
    </div>
  );
}

export default ManagerDashboard;
