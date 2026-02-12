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

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id,
      customer_id,
      status,
      scheduled_date,
      scheduled_time,
      estimated_duration,
    } = req.body;

    // Build dynamic update query (Only update fields that are provided)
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (employee_id !== undefined) {
      updates.push(`employee_id = $${paramCount}`);
      values.push(employee_id);
      paramCount++;
    }
    if (customer_id !== undefined) {
      updates.push(`customer_id = $${paramCount}`);
      values.push(customer_id);
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }
    if (scheduled_date !== undefined) {
      updates.push(`scheduled_date = $${paramCount}`);
      values.push(scheduled_date);
      paramCount++;
    }
    if (scheduled_time !== undefined) {
      updates.push(`scheduled_time = $${paramCount}`);
      values.push(scheduled_time);
      paramCount++;
    }
    if (estimated_duration !== undefined) {
      updates.push(`estimated_duration = $${paramCount}`);
      values.push(estimated_duration);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Add job ID as last parameter
    values.push(id);

    const result = await pool.query(
      `UPDATE jobs
      SET ${updates.join(",")}
      WHERE id = $${paramCount}
      RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    res.json({
      message: "Job updated successfully",
      job: result.rows[0],
    });
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ error: "Server error updating job" });
  }
});
export default router;
