import "dotenv/config";
import pool from "./pool.js";
import bcrypt from "bcrypt";

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Delete all data currently in database
    await pool.query("DELETE FROM jobs");
    await pool.query("DELETE FROM customers");
    await pool.query("DELETE FROM users");

    // Reset sequences to start from 1
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE customers_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE jobs_id_seq RESTART WITH 1");

    console.log("✅ Cleared existing data!");

    // Create two sample users(1 admin, 2 employees)
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Insert sample data to the users table.
    const usersResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, name, phone) VALUES
            ('admin@doxacleaning.com', $1, 'admin', 'Business Owner', '555-0100'),
            ('john@doxacleaning.com', $1, 'employee', 'John Smith', '555-0101'),
            ('sarah@doxacleaning.com', $1, 'employee', 'Sarah Johnson', '555-0102')
            RETURNING id, name, role`,
      [hashedPassword],
    );

    const adminId = usersResult.rows[0].id;
    const johnId = usersResult.rows[1].id;
    const sarahId = usersResult.rows[2].id;

    console.log("✅ Seeded Users:", usersResult.rows);

    // Fill customers table with sample data.
    const customersResult = await pool.query(
      `INSERT INTO customers (name, street_add1, city, state, zip_code, phone) VALUES
            ('Jane Smith', '123 Main St', 'Phoenix', 'AZ', '85001', '555-1234'),
            ('Bob Williams', '456 Oak Ave', 'Scottsdale', 'AZ', '85250', '555-5678'),
            ('Mary Davis', '789 Pine Rd', 'Tempe', 'AZ', '85281', '555-9012'),
            ('Tom Brown', '321 Elm St', 'Mesa', 'AZ', '85201', '555-3456')
            RETURNING id, name`,
    );

    const customer1Id = customersResult.rows[0].id;
    const customer2Id = customersResult.rows[1].id;
    const customer3Id = customersResult.rows[2].id;
    const customer4Id = customersResult.rows[3].id;

    console.log("✅ Seeded Customers:", customersResult.rows);

    // Give jobs table sample jobs.
    const jobsResult = await pool.query(
      `INSERT INTO jobs (employee_id, customer_id, status, scheduled_date, scheduled_time, estimated_duration) VALUES
            ($1, $2, 'pending', '2026-02-20', '09:00:00', 90),
            ($1, $3, 'pending', '2026-02-21', '10:00:00', 120),
            ($4, $5, 'in-progress', '2026-02-15', '14:00:00', 60),
            ($4, $6, 'completed', '2026-02-10', '08:00:00', 90),
            ($1, $2, 'completed', '2026-02-08', '11:00:00', 90)
            RETURNING id, status, scheduled_date`,
      [johnId, customer1Id, customer2Id, sarahId, customer3Id, customer4Id],
    );

    console.log("✅ Seeded jobs:", jobsResult.rows);

    console.log("🎊 Database seeded successfully!");
    console.log("\n 📝 Login credentials (all use password: admin123):");
    console.log("   Admin: admin@doxacleaning.com");
    console.log("   Employee 1: john@doxacleaning.com");
    console.log("   Employee 2: sarah@doxacleaning.com");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seedDatabase();
