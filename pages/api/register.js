// File: pages/api/register.js

const { Resend } = require('resend');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const crypto = require('crypto');

// --- Configuration ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const resend = new Resend(process.env.RESEND_API_KEY);
const BCRYPT_SALT_ROUNDS = 12;

// --- Main API Handler ---
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    companyName,
    vatTaxId,
    billingAddress,
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  // --- Validation ---
  if (!email || !password || !companyName || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }

    // --- Logic ---
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    const companyQuery = `
      INSERT INTO companies (name, vat_tax_id, billing_address, lifecycle_stage, portal_enabled)
      VALUES ($1, $2, $3, 'Customer', TRUE)
      RETURNING id;
    `;
    const companyResult = await client.query(companyQuery, [companyName, vatTaxId, billingAddress]);
    const newCompanyId = companyResult.rows[0].id;

    const userQuery = `
      INSERT INTO users (company_id, first_name, last_name, email, password_hash, user_role, is_active, email_verification_token, email_verification_expires)
      VALUES ($1, $2, $3, $4, $5, 'Companies', FALSE, $6, $7)
      RETURNING id, first_name;
    `;
    const userResult = await client.query(userQuery, [newCompanyId, firstName, lastName, email.toLowerCase(), passwordHash, verificationToken, tokenExpiry]);
    const newUserName = userResult.rows[0].first_name;

    // --- Send Verification Email ---
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${verificationToken}`;
    await resend.emails.send({
      from: 'Onboarding <onboarding@your-domain.com>', // Replace with your verified Resend domain
      to: [email],
      subject: 'Welcome! Please Verify Your Email Address',
      html: `<h1>Welcome, ${newUserName}!</h1><p>Thank you for registering. Please click the link below to verify your email address and activate your account:</p><a href="${verificationUrl}">Verify Email</a><p>This link will expire in one hour.</p>`
    });

    await client.query('COMMIT');
    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  } finally {
    client.release();
  }
}
