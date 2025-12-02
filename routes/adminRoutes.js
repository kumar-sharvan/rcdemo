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
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
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

//fetch all approved customers in admin1_status
router.get("/customers/approved", async (req, res) => {
  const sql = "SELECT * FROM customers WHERE admin1_status='Approved'";
  const [rows] = await db.query(sql);
  res.json({ success: true, data: rows });
});

//-----GET ALL status LEVEL 2-----
router.get("/customers/status-level2", async (req, res) => {
  const sql = "SELECT status FROM customers ";
  const [rows] = await db.query(sql);
  res.json({ success: true, data: rows });
});

//-------Approve Application for Admin Level 2-------
router.put("/loan/final-approve/:id", async (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE customers SET status='Approved' WHERE customer_id=?";
  await db.query(sql, [id]);

  res.json({ success: true, message: "Loan finally approved!" });
});

//-------Reject Application for Admin Level 2-------
router.put("/loan/final-reject/:id", async (req, res) => {
  const { id } = req.params;
  const sql =
    "UPDATE customers SET status='Rejected' WHERE customer_id=?";
  await db.query(sql, [id]);

  res.json({ success: true, message: "Loan finally rejected!" });
});

//Approve application for admin level 1
router.put("/loan/approve/:id", async (req, res) => {
  const { id } = req.params;

  const sql =
    "UPDATE customers SET admin1_status='Approved' WHERE customer_id=?";
  await db.query(sql, [id]);

  res.json({ success: true, message: "Loan approved!" });
});

//reject application for admin level 1
router.put("/loan/reject/:id", async (req, res) => {
  const { id } = req.params;

  const sql =
    "UPDATE customers SET admin1_status='Rejected' WHERE customer_id=?";
  await db.query(sql, [id]);

  res.json({ success: true, message: "Loan rejected!" });
});

// -----GET ALL PARTICULAR LOAN ROUTES BELOW-----
//GET ALL APPROVED LOANS
router.get("/loans/approved", async (req, res) => {
  const sql = "SELECT * FROM customers WHERE status='Approved'";
  const [rows] = await db.query(sql);
  res.json({ success: true, data: rows });
});

//GET ALL REJECTED LOANS
router.get("/loans/rejected", async (req, res) => {
  const sql = "SELECT * FROM customers WHERE status='Rejected'";
  const [rows] = await db.query(sql);
  res.json({ success: true, data: rows });
});
//GET ALL PENDING LOANS
router.get("/loans/pending", async (req, res) => {
  const sql = "SELECT * FROM customers WHERE status='Pending'";
  const [rows] = await db.query(sql);
  res.json({ success: true, data: rows });
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

