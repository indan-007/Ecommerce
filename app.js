const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'your_secret_key', // 🔒 Change this to a strong secret in production
  resave: false,
  saveUninitialized: true,
}));

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'users_db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL database.');
});

// Serve static files (like public/index.html, style.css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html properly
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API to get user info
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, name: req.session.user.name });
  } else {
    res.json({ loggedIn: false });
  }
});

// Signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'New folder', 'signup.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'New folder', 'login.html'));
});

// Signup POST
app.post('/signup', (req, res) => {
  const { name, phone, password } = req.body;
  connection.query('INSERT INTO users (name, phone, password) VALUES (?, ?, ?)', [name, phone, password], (err, results) => {
    if (err) throw err;
    res.redirect('/login');
  });
});

// Login POST
app.post('/login', (req, res) => {
  const { phone, password } = req.body;
  connection.query('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, password], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      req.session.user = { id: results[0].id, name: results[0].name };
      res.redirect('/index.html');
    } else {
      res.send('Invalid credentials. <a href="/login">Try again</a>');
    }
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
    }
    res.redirect('/');
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
