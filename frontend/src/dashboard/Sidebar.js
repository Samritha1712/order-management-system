function Sidebar({ role, onLogout }) {
  return (
    <div style={{
      width: "220px",
      background: "#1f2937",
      color: "white",
      height: "100vh",
      padding: "20px"
    }}>
      <h3>OMS</h3>

      <p style={{ marginTop: 20 }}>Role: {role}</p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {role === "admin" && <li>Admin Dashboard</li>}
        {role === "manager" && <li>Manager Dashboard</li>}
        {role === "customer" && <li>Customer Dashboard</li>}
      </ul>

      <button
        onClick={onLogout}
        style={{ marginTop: 30, padding: 8 }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
