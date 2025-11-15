import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { task } = req.body;
    const result = await pool.query(
      `INSERT INTO to_do (task)
       VALUES ($1) RETURNING *`,
      [task]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM to_do ORDER BY id DESC");
  res.json(result.rows);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { is_completed } = req.body;
  const result = await pool.query(
    `UPDATE to_do SET is_completed = $1 WHERE id=$2 RETURNING *`,
    [is_completed, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM to_do WHERE id = $1", [req.params.id]);
  res.json({ message: "Deleted successfully" });
});

export default router;
