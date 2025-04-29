const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const db = require("./db");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// Serve signup page from "New folder"
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "New folder", "signup.html"));
});

// Serve login page from "New folder"
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "New folder", "login.html"));
});

// Signup endpoint
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashed],
    err => {
      if (err) return res.send("Signup failed.");
      res.redirect("/login");
    }
  );
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0) return res.send("Invalid login.");
    const valid = await bcrypt.compare(password, results[0].password);
    if (valid) res.send("Login successful!");
    else res.send("Invalid credentials.");
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
