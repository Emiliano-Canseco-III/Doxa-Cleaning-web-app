require("dotenv").config();
import { Client } from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgres://localhost:5432/doxa_cleaning_llc";

const client = new Client({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export default client;
