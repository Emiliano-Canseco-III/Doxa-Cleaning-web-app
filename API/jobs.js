import express from "express";
import pool from "../db/pool.js";
import {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin,
} from "../Middleware/auth.js";

const router = express.Router();

// Create a new job
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      employee_id,
      customer_id,
      status,
      scheduled_date,
      scheduled_time,
      estimated_duration,
    } = req.body;

    // Check for missing fields
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

    res.status(201).json({
      message: "Job created successfully",
      job: result.rows[0],
    });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Server error creating job" });
  }
});

// Return all existing jobs and assigned employee
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  // Join users, customers, and jobs table.
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
    ORDER BY jobs.scheduled_date ASC, jobs.scheduled_time ASC
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

// Returns jobs connected to current User
router.get(
  "/my-jobs",
  authenticateToken,
  requireOwnerOrAdmin,
  async (req, res) => {
    try {
      const { employee_id } = req.query;

      if (!employee_id) {
        return res.status(422).json({ error: "Missing employee_id" });
      }

      // Join jobs and customers table to get full job details
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
  },
);

// Updates job status to "In-progress"
router.patch("/:id/in-progress", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE jobs
      SET status = 'in-progress', started_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    res.json({
      message: "Job Started",
      job: result.rows[0],
    });
  } catch (err) {
    console.error("Start job error:", err);
    res.status(500).json({ error: "Server error starting job" });
  }
});

// Updates job status to "complete"
router.patch("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE jobs
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    res.json({
      message: "Job marked as completed",
      job: result.rows[0],
    });
  } catch (err) {
    console.error("Complete job error:", err);
    res.status(500).json({ error: "Server error completing job" });
  }
});

router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the selected job from database and return deleted job data
    const result = await pool.query(
      "DELETE FROM jobs WHERE id = $1 RETURNING *",
      [id],
    );

    // If job is not found in database, return 404 error code
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    // If job is deleted from database successfully, return success message and deleted job data
    res.json({
      message: "Job deleted successfully",
      deletedJob: result.rows[0],
    });

    // If there was a server error during deletion, log error and return 500 error code
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ error: "Server error deleting job" });
  }
});

// Update any info of a selected job
router.patch("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id,
      customer_id,
      status,
      scheduled_date,
      scheduled_time,
      estimated_duration,
      notes,
    } = req.body;

    // Build dynamic update query (Only update fields that are provided)
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Check if fields are empty
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
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }
    if (estimated_duration !== undefined) {
      updates.push(`estimated_duration = $${paramCount}`);
      values.push(estimated_duration);
      paramCount++;
    }

    // Checks for at least 1 submitted field
    if (updates.length === 0) {
      return res.status(422).json({ error: "No fields to update" });
    }

    // Add job ID last
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
