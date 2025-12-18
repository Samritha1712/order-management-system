const pool = require('../config/db');

const createUser = async ({ email, password_hash, first_name, last_name, role = 'customer' }) => {
  const q = `
    INSERT INTO public.users (email, password_hash, first_name, last_name, role)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING id, email, first_name, last_name, role, created_at;
  `;
  const values = [email, password_hash, first_name, last_name, role];
  const { rows } = await pool.query(q, values);
  return rows[0];
};

const findByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM public.users WHERE email = $1 LIMIT 1', [email]);
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await pool.query('SELECT id, email, first_name, last_name, role, created_at FROM public.users WHERE id = $1', [id]);
  return rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
};
