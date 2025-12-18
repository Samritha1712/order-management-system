const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.getAllProducts = async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
};

exports.createProduct = async (req, res) => {
  const { name, description, price, stock_quantity, category } = req.body;

  const id = uuidv4();

  await pool.query(
    `INSERT INTO products (id, name, description, price, stock_quantity, category)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, name, description, price, stock_quantity, category]
  );

  res.json({ message: "Product created successfully" });
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock_quantity } = req.body;

  await pool.query(
    `UPDATE products SET name=$1, price=$2, stock_quantity=$3 WHERE id=$4`,
    [name, price, stock_quantity, id]
  );

  res.json({ message: "Product updated" });
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  await pool.query(`DELETE FROM products WHERE id=$1`, [id]);

  res.json({ message: "Product deleted" });
};
