import db from "../db/db.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

//connector login
router.post("/connector/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM connectors WHERE email=?";

    const [rows] = await db.query(sql, [email]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Connector not found",
      });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        id: rows[0].id,
        email: rows[0].email,
        role: "connector",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
      token,
      data: rows[0],
      message: "Login Successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// CONNECTOR adds customer
router.post("/connector/add-customer", async (req, res) => {
  try {
    const {
      full_name,
      father_name,
      dob,
      gender,
      marital_status,
      mobile,
      alt_mobile,
      email,
      aadhaar,
      pan_no,
      address,
      city,
      state,
      pin_code,
      emp_type,
      company_name,
      business_name,
      monthly_income,
      loan_type,
      required_loan_amount,
      tenure,
      existing_loan,
      existing_loan_amount,
      bank_name,
      account_holder_name,
      account_no,
      ifsc,
      branch_name,
      connector_id,
    } = req.body;

    if (!connector_id) {
      return res.status(400).json({
        success: false,
        message: "Connector ID missing",
      });
    }

    const customer_id =
      "CUST" +
      full_name.toUpperCase().slice(0, 2) +
      Math.floor(10000 + Math.random() * 90000);

    //create real time date time
    const created_at = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const sql = `
      INSERT INTO customers (
        customer_id,
        connector_id,
        full_name,
        father_name,
        dob,
        gender,
        marital_status,
        mobile,
        alt_mobile,
        email,
        aadhaar,
        pan_no,
        address,
        city,
        state,
        pin_code,
        emp_type,
        company_name,
        business_name,
        monthly_income,
        loan_type,
        required_loan_amount,
        tenure,
        existing_loan,
        existing_loan_amount,
        bank_name,
        account_holder_name,
        account_no,
        ifsc,
        branch_name,
        created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    await db.query(sql, [
      customer_id,
      connector_id,
      full_name,
      father_name,
      dob,
      gender,
      marital_status,
      mobile,
      alt_mobile,
      email,
      aadhaar,
      pan_no,
      address,
      city,
      state,
      pin_code,
      emp_type,
      company_name,
      business_name,
      monthly_income,
      loan_type,
      required_loan_amount,
      tenure,
      existing_loan,
      existing_loan_amount,
      bank_name,
      account_holder_name,
      account_no,
      ifsc,
      branch_name,
      created_at,
    ]);

    return res.json({
      success: true,
      message: "Customer added by connector successfully",
      customer_id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

//SHOW ONLY FILL BY CONNECTOR'S CUSTOMERS
router.get("/connector/customers/:connectorId", async (req, res) => {
  const { connectorId } = req.params;
  try {
    const [result] = await db.query(
      "SELECT * FROM customers WHERE connector_id = ?",
      [connectorId]
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//fetch all connectors
router.get("/connectors", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM connectors");

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No connector found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

//delete connector
router.delete("/connectors/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM connectors WHERE connector_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Connector not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Connector deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export default router;
