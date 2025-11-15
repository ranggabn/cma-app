import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { document_name, due_date } = req.body;
    const result = await pool.query(
      `INSERT INTO administration (document_name, due_date)
       VALUES ($1, $2) RETURNING *`,
      [document_name, due_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM administration ORDER BY due_date"
  );
  res.json(result.rows);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM administration WHERE id = $1",
    [req.params.id]
  );
  res.json(result.rows[0]);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { status } = req.body;
  const result = await pool.query(
    `UPDATE administration SET status=$1 WHERE id=$2 RETURNING *`,
    [status, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM administration WHERE id = $1", [req.params.id]);
  res.json({ message: "Deleted successfully" });
});

export default router;
