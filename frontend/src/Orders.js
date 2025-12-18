import { useEffect, useState } from "react";
import axios from "./api/axios";

function Orders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("/orders", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setOrders(res.data))
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Orders</h2>

      {orders.map(order => (
        <div key={order.id} style={{ border: "1px solid #ccc", marginBottom: 10 }}>
          <p><b>ID:</b> {order.id}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Total:</b> ₹{order.total_amount}</p>
        </div>
      ))}
    </div>
  );
}

export default Orders;
