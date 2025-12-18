function OrderStatusBadge({ status }) {
  const colors = {
    pending: "orange",
    shipped: "blue",
    delivered: "green",
    cancelled: "red"
  };

  return (
    <span style={{ color: colors[status], fontWeight: "bold" }}>
      {status.toUpperCase()}
    </span>
  );
}

export default OrderStatusBadge;
