import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const { date, description, amount, type } = req.body;
    const result = await pool.query(
      `INSERT INTO cashflow (date, description, amount, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [date, description, amount, type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
router.get("/summary", async (req, res) => {
  const result = await pool.query(
    `SELECT 
    sum(case when type = 0 then amount else 0 end) as income,
    sum(case when type = 1 then amount else 0 end) as expenses,
    (sum(case when type = 0 then amount else 0 end) - sum(case when type = 1 then amount else 0 end)) as saldo
    FROM cashflow;`
  );
  res.json(result.rows);
});

// READ ALL
router.get("/detail", async (req, res) => {
  const result = await pool.query(
    `SELECT *, to_char(date, 'DD FMMonth YYYY') as tanggal_transaksi
    FROM cashflow
    WHERE type = $1
    ORDER BY date DESC
    LIMIT 5`,
    [req.query.type]
  );
  res.json(result.rows);
});

router.get("/summaryCash", async (req, res) => {
  const result = await pool.query(
    `SELECT 
      ROW_NUMBER() OVER () AS id,
      SUM(amount) AS value,
      TO_CHAR(MAX(date), 'YYYY-MM') AS month,
      TO_CHAR(MAX(date), 'Month') AS title,
      'Pendapatan Bulan ' || TO_CHAR(MAX(date), 'Month') AS subtitle
    FROM cashflow
    WHERE type = $1
    GROUP BY 
      TO_CHAR(date, 'YYYY-MM'), 
      TO_CHAR(date, 'Month')
    ORDER BY MAX(date) DESC;`,
    [req.query.type]
  );
  res.json(result.rows);
});

router.get("/detailCash", async (req, res) => {
  const result = await pool.query(
    `SELECT *, to_char(date, 'DD FMMonth YYYY') as tanggal_transaksi
      FROM cashflow
      WHERE type = $1 AND to_char(date, 'YYYY-MM') = $2
      ORDER BY date DESC`,
    [req.query.type, req.query.month]
  );
  res.json(result.rows);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM cashflow WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { user_id, date, description, amount, type } = req.body;
  const result = await pool.query(
    `UPDATE cashflow SET user_id=$1, date=$2, description=$3, amount=$4, type=$5 WHERE id=$6 RETURNING *`,
    [user_id, date, description, amount, type, req.params.id]
  );
  res.json(result.rows[0]);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM cashflow WHERE id = $1", [req.params.id]);
  res.json({ message: "Deleted successfully" });
});

export default router;
