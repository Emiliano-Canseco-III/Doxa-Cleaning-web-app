import express from "express";
import pool from "../db/pool.js";
import { authenticateToken, requireAdmin } from "../Middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone FROM users WHERE role = 'employee' ORDER BY name ASC`,
    );
    res.json({ employees: result.rows });
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
