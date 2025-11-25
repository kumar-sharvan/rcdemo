import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = mysql
  .createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

try {
  const connection = await db.getConnection();
  console.log("✅ Database connected successfully!");
  connection.release();
} catch (error) {
  console.error("❌ Database connection failed:", error.message);
}

export default db;
