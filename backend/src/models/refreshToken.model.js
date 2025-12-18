const pool = require('../config/db');

const saveRefreshToken = async ({ user_id, token, expires_at }) => {
  const q = `
    INSERT INTO public.refresh_tokens (user_id, token, expires_at)
    VALUES ($1,$2,$3)
    RETURNING id, user_id, token, expires_at, created_at;
  `;
  const { rows } = await pool.query(q, [user_id, token, expires_at]);
  return rows[0];
};

const findRefreshToken = async (token) => {
  const { rows } = await pool.query('SELECT * FROM public.refresh_tokens WHERE token = $1 LIMIT 1', [token]);
  return rows[0];
};

const deleteRefreshToken = async (token) => {
  await pool.query('DELETE FROM public.refresh_tokens WHERE token = $1', [token]);
  return true;
};

const deleteAllForUser = async (user_id) => {
  await pool.query('DELETE FROM public.refresh_tokens WHERE user_id = $1', [user_id]);
  return true;
};

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllForUser
};
