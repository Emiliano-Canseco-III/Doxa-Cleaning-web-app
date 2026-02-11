import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.post("/", async (req, res) => {
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

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
      jobs.*,
      users.name AS employee_name,
      customers.name AS customer_name,
      customers.street_add1,
      customers.city,
      customers.state,
      customers.phone as customer_phone
    FROM jobs
    JOIN users ON jobs.employee_id = users.id
    JOIN customers ON jobs.customer_id = customers.id
    ORDER BY jobs.scheduled_date DESC, jobs.scheduled_time DESC
    `);

    res.json({
      message: "Jobs retrieved successfully",
      jobs: result.rows,
    });
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ error: "Server error retrieving jobs" });
  }
});

// Get jobs for specific employee
router.get("/my-jobs", async (req, res) => {
  try {
    const { employee_id } = req.query;

    if (!employee_id) {
      return res.status(400).json({ error: "Missing employee_id" });
    }

    const result = await pool.query(
      `
      SELECT
      jobs.*,
      customers.name AS customer_name,
      customers.street_add1,
      customers.city,
      customers.state,
      customers.phone as customer_phone
    FROM jobs
    JOIN customers ON jobs.customer_id = customers.id
    WHERE jobs.employee_id = $1
    ORDER BY jobs.scheduled_date ASC, jobs.scheduled_time ASC
    `,
      [employee_id],
    );

    res.json({
      message: "Employee jobs retrieved successfully",
      jobs: result.rows,
    });
  } catch (err) {
    console.error("Get employee jobs error:", err);
    res.status(500).json({ error: "Server error retrieving employee jobs" });
  }
});
export default router;
