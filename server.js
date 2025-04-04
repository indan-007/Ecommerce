const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('./db');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret_key'; // Change this to a secure random string

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists and is admin
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Configure email for password reset
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your gmail
    pass: 'your-email-password'    // Replace with your password or app password
  }
});

// Helper function to generate random code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ===== AUTH ROUTES =====

// Register new user
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, full_name, phone_number, address } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Code expires in 24 hours
    
    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password, full_name, phone_number, address, is_verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())`,
      [username, email, hashedPassword, full_name, phone_number, address]
    );
    
    // Get the inserted user ID
    const userId = result.insertId;
    
    // Insert verification code
    await pool.execute(
      `INSERT INTO verification_codes (user_id, code, type, expires_at, created_at)
       VALUES (?, ?, 'email_verification', ?, NOW())`,
      [userId, verificationCode, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
    );
    
    // Send verification email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: `
        <h2>Welcome to Our E-commerce Store!</h2>
        <p>Thank you for registering. Please use the following code to verify your email address:</p>
        <h3 style="color: #4CAF50;">${verificationCode}</h3>
        <p>This code will expire in 24 hours.</p>
      `
    };
    
    // Uncomment to enable actual email sending
    // await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'User registered successfully. Verification code sent to email.',
      verificationCode // Only for development, remove in production
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Get user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Check if already verified
    if (user.is_verified) {
      return res.json({ success: true, message: 'Email already verified' });
    }
    
    // Get verification code
    const [codes] = await pool.execute(
      `SELECT * FROM verification_codes 
       WHERE user_id = ? AND code = ? AND type = 'email_verification' AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id, code]
    );
    
    if (codes.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    
    // Update user to verified
    await pool.execute(
      'UPDATE users SET is_verified = TRUE WHERE id = ?',
      [user.id]
    );
    
    // Delete used verification code
    await pool.execute(
      'DELETE FROM verification_codes WHERE id = ?',
      [codes[0].id]
    );
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Get user by username or email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check if email is verified (skip for admin during development)
    if (!user.is_verified && user.role !== 'admin') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Return user data without password
    const userData = { ...user };
    delete userData.password;
    
    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Code expires in 1 hour
    
    // Insert verification code
    await pool.execute(
      `INSERT INTO verification_codes (user_id, code, type, expires_at, created_at)
       VALUES (?, ?, 'password_reset', ?, NOW())`,
      [user.id, verificationCode, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
    );
    
    // Send reset email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Please use the following code:</p>
        <h3 style="color: #4CAF50;">${verificationCode}</h3>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    // Uncomment to enable actual email sending
    // await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Password reset code sent to email',
      verificationCode // Only for development, remove in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    
    // Get user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get verification code
    const [codes] = await pool.execute(
      `SELECT * FROM verification_codes 
       WHERE user_id = ? AND code = ? AND type = 'password_reset' AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id, code]
    );
    
    if (codes.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    
    // Update user password
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    // Delete used verification code
    await pool.execute(
      'DELETE FROM verification_codes WHERE id = ?',
      [codes[0].id]
    );
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Resend verification code
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Check if already verified
    if (user.is_verified) {
      return res.json({ success: true, message: 'Email already verified' });
    }
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Code expires in 24 hours
    
    // Insert verification code
    await pool.execute(
      `INSERT INTO verification_codes (user_id, code, type, expires_at, created_at)
       VALUES (?, ?, 'email_verification', ?, NOW())`,
      [user.id, verificationCode, expiresAt.toISOString().slice(0, 19).replace('T', ' ')]
    );
    
    // Send verification email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: `
        <h2>Email Verification</h2>
        <p>Please use the following code to verify your email address:</p>
        <h3 style="color: #4CAF50;">${verificationCode}</h3>
        <p>This code will expire in 24 hours.</p>
      `
    };
    
    // Uncomment to enable actual email sending
    // await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Verification code sent to email',
      verificationCode // Only for development, remove in production
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== USER MANAGEMENT ROUTES =====

// Get users (admin only)
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const role = req.query.role || 'all';
    
    let query = 'SELECT id, username, email, full_name, role, is_verified, created_at FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    
    if (role !== 'all') {
      query += ' WHERE role = ?';
      countQuery += ' WHERE role = ?';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    // Get users
    const [users] = role !== 'all' 
      ? await pool.execute(query, [role, limit, offset])
      : await pool.execute(query, [limit, offset]);
    
    // Get total count
    const [countResult] = role !== 'all'
      ? await pool.execute(countQuery, [role])
      : await pool.execute(countQuery);
    
    const totalUsers = countResult[0].total;
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.json({
      success: true,
      users,
      totalUsers,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single user (admin only)
app.get('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, phone_number, address, role, is_verified, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create user (admin only)
app.post('/api/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password, full_name, role, is_verified } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert user
    await pool.execute(
      `INSERT INTO users (username, email, password, full_name, role, is_verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [username, email, hashedPassword, full_name, role || 'user', is_verified ? 1 : 0]
    );
    
    res.json({
      success: true,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user (admin only)
app.put('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password, full_name, role, is_verified } = req.body;
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if username/email is taken by another user
    if (username || email) {
      const [existingUsers] = await pool.execute(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND id <> ?',
        [username || '', email || '', userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username or email already taken by another user' 
        });
      }
    }
    
    // Update fields
    let query = 'UPDATE users SET ';
    const params = [];
    
    if (username) {
      query += 'username = ?, ';
      params.push(username);
    }
    
    if (email) {
      query += 'email = ?, ';
      params.push(email);
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += 'password = ?, ';
      params.push(hashedPassword);
    }
    
    if (full_name !== undefined) {
      query += 'full_name = ?, ';
      params.push(full_name);
    }
    
    if (role) {
      query += 'role = ?, ';
      params.push(role);
    }
    
    if (is_verified !== undefined) {
      query += 'is_verified = ?, ';
      params.push(is_verified ? 1 : 0);
    }
    
    query += 'updated_at = NOW() WHERE id = ?';
    params.push(userId);
    
    await pool.execute(query, params);
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent deleting yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }
    
    // Delete user
    await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password endpoint
app.post('/api/users/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;
    
    // Get user with password
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    
    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    
    // Update password
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== EXISTING PAYMENT ROUTES =====

// Process payment endpoint
app.post('/api/process-payment', async (req, res) => {
  try {
    const { payment_method, card_number, bank_name, upi_id, emi_option } = req.body;
    const order_id = 'ORD' + Math.floor(100000 + Math.random() * 900000);
    const payment_status = payment_method === 'cod' ? 'cod_pending' : 'completed';
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Insert into database
    await pool.execute(
      `INSERT INTO payments 
       (order_id, payment_method, card_number, bank_name, upi_id, emi_option, payment_status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, payment_method, card_number, bank_name, upi_id, emi_option, payment_status, created_at]
    );
    
    res.json({
      success: true,
      order_id: order_id,
      message: 'Payment processed successfully'
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment failed'
    });
  }
});

// Get payment status endpoint
app.get('/api/payment/:orderId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE order_id = ?',
      [req.params.orderId]
    );
    
    if (rows.length > 0) {
      res.json({
        success: true,
        payment: rows[0]
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
