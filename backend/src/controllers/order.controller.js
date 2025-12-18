const pool = require("../config/db");

// GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (!role || !userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const whereClause = role === 'customer' ? 'WHERE o.user_id = $1' : '';
    const params = role === 'customer' ? [userId] : [];

    const result = await pool.query(
      `
      SELECT 
        o.id,
        o.user_id,
        json_build_object(
          'id', u.id,
          'email', u.email,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'role', u.role
        ) AS user,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      JOIN public.users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      ${whereClause}
      GROUP BY o.id, u.id
      ORDER BY o.created_at DESC
      `,
      params
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    if (!role || !userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `
      SELECT 
        o.id,
        o.user_id,
        json_build_object(
          'id', u.id,
          'email', u.email,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'role', u.role
        ) AS user,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      JOIN public.users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.id = $1
      GROUP BY o.id, u.id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = result.rows[0];

    if (role === 'customer' && String(order.user_id) !== String(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  const role = req.user?.role;
  const userId = req.user?.id;
  const { items, shipping_address } = req.body;

  if (!role || !userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (role !== 'customer') {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items are required" });
  }

  const normalizedItems = items
    .map((it) => ({
      product_id: it.product_id,
      quantity: Number(it.quantity),
    }))
    .filter((it) => it.product_id && Number.isFinite(it.quantity) && it.quantity > 0);

  if (normalizedItems.length === 0) {
    return res.status(400).json({ error: "Invalid items" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productIds = [...new Set(normalizedItems.map((i) => String(i.product_id)))];
    const productsResult = await client.query(
      `
      SELECT id, price, stock_quantity
      FROM products
      WHERE id::text = ANY($1::text[])
      `,
      [productIds]
    );

    if (productsResult.rowCount !== productIds.length) {
      const e = new Error("One or more products not found");
      e.status = 400;
      throw e;
    }

    const productMap = new Map(productsResult.rows.map((p) => [String(p.id), p]));

    for (const item of normalizedItems) {
      const product = productMap.get(String(item.product_id));
      if (!product) {
        const e = new Error("One or more products not found");
        e.status = 400;
        throw e;
      }
      if (Number(product.stock_quantity) < item.quantity) {
        const e = new Error(`Insufficient stock for product ${item.product_id}`);
        e.status = 400;
        throw e;
      }
    }

    const totalAmount = normalizedItems.reduce((sum, item) => {
      const product = productMap.get(String(item.product_id));
      return sum + Number(product.price) * Number(item.quantity);
    }, 0);

    // insert order
    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, total_amount, status, shipping_address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        userId,
        totalAmount,
        "pending",
        shipping_address || "",
      ]
    );

    const order = orderResult.rows[0];

    // insert order items
    for (const item of normalizedItems) {
      const product = productMap.get(String(item.product_id));

      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
        `,
        [
          order.id,
          item.product_id,
          item.quantity,
          product.price,
        ]
      );

      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    const status = err?.status && Number.isFinite(err.status) ? err.status : 500;
    const msg = status === 500 ? "Failed to create order" : err.message;
    return res.status(status).json({ error: msg });
  } finally {
    client.release();
  }
};

// PUT /api/orders/:id/cancel (customer)
exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const role = req.user?.role;
  const userId = req.user?.id;

  if (!role || !userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (role !== 'customer') {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const existing = await pool.query(
      `SELECT id, user_id, status FROM orders WHERE id = $1`,
      [id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = existing.rows[0];
    if (String(order.user_id) !== String(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }

    const updated = await pool.query(
      `UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    );

    return res.json({ message: "Order cancelled", order: updated.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to cancel order" });
  }
};

// PUT /api/orders/:id
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
};
