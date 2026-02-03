import "dotenv/config";
import pg from "pg";
const { Pool } = pg; // Pool is used when there are multiple users at any given time.

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgres://localhost:5432/doxa_cleaning_llc",
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default pool;
