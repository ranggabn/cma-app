import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { pool } from "./db.js";
import swaggerFile from "./swagger-output.json" with { type: "json" };

import cashflowRoutes from "./routes/cashflow.js";
import debtRoutes from "./routes/debt.js";
import debtDetailRoutes from "./routes/debt_detail.js";
import engagementRoutes from "./routes/engagement.js";
import todoRoutes from "./routes/to_do.js";
import savingsRoutes from "./routes/savings.js";
import invitationRoutes from "./routes/invitation.js";
import adminRoutes from "./routes/administration.js";
import weddingRoutes from "./routes/wedding.js";
import masterAccountRoutes from "./routes/master_account.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger (tanpa anotasi manual)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use("/cashflow", cashflowRoutes);
app.use("/debt", debtRoutes);
app.use("/debt-detail", debtDetailRoutes);
app.use("/engagement", engagementRoutes);
app.use("/to-do", todoRoutes);
app.use("/savings", savingsRoutes);
app.use("/guests", invitationRoutes);
app.use("/administration", adminRoutes);
app.use("/wedding", weddingRoutes);
app.use("/master-account", masterAccountRoutes);

app.get("/", (req, res) => res.send("DB CMA API is running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
