import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/pool.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    // Get data from request body
    const { email, password, role, name, phone } = req.body;

    // Validate required fields
    if (!email || !password || !role || !name || !phone) {
      return res.status(400).json({
        error: "Missing required fields: email, password, role, name, phone",
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    // Hash the password (10 rounds of salting)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, role, name, phone, created_at`,
      [email, password_hash, role, name, phone],
    );

    // Return the created user (without password hash)
    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(500)
      .json({ error: "Internal server error during registration" });
  }
});

// POST /api/auth/login - User login
router.post("/login", async (req, res) => {
  try {
    // Get email and password from request
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Compare password with hashed password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Send back token and user info (NO PASSWORD)
    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
