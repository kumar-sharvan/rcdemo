import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import db from "./db/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import connectorRoutes from "./routes/connectorRoutes.js";

dotenv.config({ quiet: true });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Use admin routes
app.use("/api", adminRoutes);
app.use("/api", customerRoutes);
app.use("/api", connectorRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
