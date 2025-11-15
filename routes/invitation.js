import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { name, contact, type, from, relation, pax } = req.body;
    const result = await pool.query(
      `INSERT INTO invitation (name, contact, type, "from", relation, pax)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, contact, type, from, relation, pax]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM invitation ORDER BY name");
  res.json(result.rows);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { name, contact, type, from, relation, pax } = req.body;
  const result = await pool.query(
    `UPDATE invitation SET name=$1, contact=$2, type=$3, "from"=$4, relation=$5, pax=$6 WHERE id=$7 RETURNING *`,
    [name, contact, type, from, relation, pax, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM invitation WHERE id = $1", [req.params.id]);
  res.json({ message: "Deleted successfully" });
});

export default router;
