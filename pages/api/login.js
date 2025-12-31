// File: pages/api/login.js

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// --- Configuration ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const JWT_SECRET = process.env.JWT_SECRET;

// --- Main API Handler ---
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const client = await pool.connect();
  try {
    const userResult = await client.query('SELECT id, password_hash, user_role, is_active FROM users WHERE email = $1', [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account not activated. Please verify your email address.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id, userRole: user.user_role }, JWT_SECRET, { expiresIn: '7d' });

    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`);
    
    res.status(200).json({ message: 'Login successful.' });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  } finally {
    client.release();
  }
}
