const pool = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const [usersRes, productsRes, ordersRes, pendingRes, deliveredRes, revenueRes] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM public.users"),
      pool.query("SELECT COUNT(*)::int AS count FROM products"),
      pool.query("SELECT COUNT(*)::int AS count FROM orders"),
      pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE status = 'delivered'"),
      pool.query("SELECT COALESCE(SUM(total_amount), 0)::float AS total FROM orders WHERE status <> 'cancelled'"),
    ]);

    return res.json({
      totalUsers: usersRes.rows[0]?.count || 0,
      totalProducts: productsRes.rows[0]?.count || 0,
      totalOrders: ordersRes.rows[0]?.count || 0,
      pendingOrders: pendingRes.rows[0]?.count || 0,
      deliveredOrders: deliveredRes.rows[0]?.count || 0,
      totalRevenue: revenueRes.rows[0]?.total || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
};
