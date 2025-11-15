import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// READ ALL - format bank accounts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM master_account");

    // Ubah menjadi { bank: [norek1, norek2] }
    const bankAccounts = {};

    result.rows.forEach((row) => {
      const bank = row.bank;
      const norek = row.norek;

      if (!bankAccounts[bank]) {
        bankAccounts[bank] = [];
      }
      bankAccounts[bank].push(norek);
    });

    res.json(bankAccounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
