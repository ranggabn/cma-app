import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { nominal, norek, bank } = req.body;
    const result = await pool.query(
      `INSERT INTO savings (nominal, norek, bank)
       VALUES ($1, $2, $3) RETURNING *`,
      [nominal, norek, bank]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM savings ORDER BY id DESC");
  res.json(result.rows);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM savings WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { user_id, date, description, amount, type } = req.body;
  const result = await pool.query(
    `UPDATE savings SET user_id=$1, date=$2, description=$3, amount=$4, type=$5 WHERE id=$6 RETURNING *`,
    [user_id, date, description, amount, type, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM savings WHERE id = $1", [req.params.id]);
  res.json({ message: "Deleted successfully" });
});

export default router;
