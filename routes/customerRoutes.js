import express from "express";
import db from "../db/db.js";

const router = express.Router();

// add new customer
router.post("/customer/add", async (req, res) => {
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
    } = req.body;

    // generate customer id
    const cumstomer_id =
      "CUST" +
      full_name.toUpperCase().slice(0, 2) +
      Math.floor(10000 + Math.random() * 90000);

    // required fields check
    if (!full_name || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name, mobile and email are required",
      });
    }

    // duplicate check
    const [existing] = await db.query(
      "SELECT email, mobile, aadhaar, pan_no FROM customers WHERE email = ? OR mobile = ? OR aadhaar = ? OR pan_no = ?",
      [email, mobile, aadhaar, pan_no]
    );

    if (existing.length > 0) {
      const errors = [];

      existing.forEach((item) => {
        if (item.email === email) errors.push("Email already exists");
        if (item.mobile === mobile) errors.push("Mobile number already exists");
        if (item.aadhaar === aadhaar)
          errors.push("Aadhaar number already exists");
        if (item.pan_no === pan_no) errors.push("PAN number already exists");
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // INSERT SQL -- now includes connector_id column
    const sql = `
INSERT INTO customers (
  customer_id,
  full_name, father_name, dob, gender, marital_status,
  mobile, alt_mobile, email, aadhaar, pan_no,
  address, city, state, pin_code,
  emp_type, company_name, business_name, monthly_income,
  loan_type, required_loan_amount, tenure,
  existing_loan, existing_loan_amount,
  bank_name, account_holder_name, account_no, ifsc, branch_name
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
`;

    const [result] = await db.query(sql, [
      cumstomer_id,
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
    ]);

    res.status(200).json({
      success: true,
      message: "Customer Added Successfully",
      customer_id: cumstomer_id,
      insertId: result.insertId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//get all customers
router.get("/customers", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM customers");

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No customers found",
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

//specific customer details
router.get("/customer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "SELECT * FROM customers WHERE customer_id = ?",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
