const userModel = require('../models/user.model');
const rtModel = require('../models/refreshToken.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await userModel.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await hashPassword(password);
    const user = await userModel.createUser({ email, password_hash, first_name, last_name });
    return res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email/password' });

    const user = await userModel.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await comparePassword(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token in DB (with expiry time)
    const decoded = require('jsonwebtoken').decode(refreshToken);
    const expires_at = new Date(decoded.exp * 1000);
    await rtModel.saveRefreshToken({ user_id: user.id, token: refreshToken, expires_at });

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });

    // Check DB
    const saved = await rtModel.findRefreshToken(refreshToken);
    if (!saved) return res.status(401).json({ error: 'Invalid refresh token' });

    // Verify token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (e) {
      await rtModel.deleteRefreshToken(refreshToken).catch(()=>{});
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccess = signAccessToken({ id: payload.id, email: payload.email, role: payload.role });
    return res.json({ accessToken: newAccess });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await rtModel.deleteRefreshToken(refreshToken);
    }
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const me = async (req, res) => {
  // auth.middleware attaches user to req.user
  const user = req.user;
  return res.json({ user });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me
};
