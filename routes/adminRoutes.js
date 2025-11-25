import db from "../db/db.js";
import jwt from "jsonwebtoken";
import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

//Login Routes
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const sql = "SELECT * FROM admins WHERE email=?";
    const [rows] = await db.query(sql, [email]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const admin = rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      message: "Login Successful",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

//add connector
router.post("/admin/add-connector", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please fill all input fields",
      });
    }

    // Check duplicate email or phone
    const [existing] = await db.query(
      "SELECT id FROM connectors WHERE email = ? OR phone = ?",
      [email, phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone already exists",
      });
    }

    //  Generate connector id
    const connector_id =
      "CONN" +
      name.toUpperCase().slice(0, 2) +
      Math.floor(10000 + Math.random() * 90000);

    //  Hash password
    const hash_password = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO connectors (connector_id, name, email, password, phone, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [connector_id, name, email, hash_password, phone]
    );

    return res.status(200).json({
      success: true,
      message: "Connector inserted successfully!",
      connector_id,
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("Add connector error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

//Approve application
router.put("/loan/approve/:id", async (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE customers SET status='Approved' WHERE customer_id=?";
  await db.query(sql, [id]);

  res.json({ success: true, message: "Loan approved!" });
});

//reject application
router.put("/loan/reject/:id", async (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE customers SET status='Rejected' WHERE customer_id=?";
  await db.query(sql, [id]);

  res.json({ success: true, message: "Loan rejected!" });
});

//protected admin route
router.get("/admin/protected", (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Failed to authenticate token" });
      }
      res.json({ success: true, message: "Protected data", user: decoded });
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ success: false, message: "Forbidden" });
  }
});

export default router;
