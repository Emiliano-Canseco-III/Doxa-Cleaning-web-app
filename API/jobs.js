import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.POST("/", async (req, res) => {
  try {
    // Get data from request
    const {
      employee_id,
      customer_id,
      status,
      scheduled_date,
      scheduled_time,
      estimated_duration,
    } = req.body;

    // Validate required fields
    if (
      !employee_id ||
      !customer_id ||
      !status ||
      !scheduled_date ||
      !scheduled_time ||
      !estimated_duration
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: employee_id, customer_id, status, scheduled_date, scheduled_time, estimated_duration",
      });
    }

    // Insert job into database
    const result = await pool.query(
      `INSERT INTO jobs (employee_id, customer_id, status, scheduled_date, scheduled_time, estimated_duration)
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
      [
        employee_id,
        customer_id,
        status,
        scheduled_date,
        scheduled_time,
        estimated_duration,
      ],
    );

    // Return the created job
    res.status(201).json({
      message: "Job created successfully",
      job: result.rows[0],
    });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Server error creating job" });
  }
});

export default router;
