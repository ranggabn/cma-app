import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      title,
      creditor_name,
      total_amount,
      jumlah_bulan,
      start_date,
      due_date,
      notes,
      cicilan,
    } = req.body;

    const start = new Date(start_date);
    const due = new Date(due_date);

    // 1. Insert ke debt_master
    const masterResult = await client.query(
      `INSERT INTO debt_master 
        (title, creditor_name, total_amount, jumlah_bulan, start_date, due_date, notes, cicilan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        title,
        creditor_name,
        total_amount,
        jumlah_bulan,
        start,
        due_date,
        notes,
        cicilan,
      ]
    );

    const masterId = masterResult.rows[0].id;

    // 2. Insert ke debt_detail berdasarkan jumlah_bulan
    for (let i = 0; i < jumlah_bulan; i++) {
      const dues = new Date(due);
      dues.setMonth(dues.getMonth() + i);

      await client.query(
        `INSERT INTO debt_detail 
          (debt_master_id, installment_number, due_date, payment_amount)
         VALUES ($1, $2, $3, $4)`,
        [masterId, i + 1, dues, cicilan]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Debt created successfully",
      debt_master_id: masterId,
      total_detail_created: jumlah_bulan,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// READ ALL
router.get("/master", async (req, res) => {
  const result = await pool.query(
    `SELECT *,
    to_char(start_date, 'DD FMMonth YYYY') as tanggal_mulai,
    to_char(due_date, 'DD FMMonth YYYY') as tanggal_cicilan
    FROM debt_master ORDER BY status, due_date`
  );
  res.json(result.rows);
});

// READ ALL
router.get("/master-limit", async (req, res) => {
  const result = await pool.query(
    `SELECT *,
    to_char(start_date, 'DD FMMonth YYYY') as tanggal_mulai,
    to_char(due_date, 'DD FMMonth YYYY') as tanggal_cicilan
    FROM debt_master
    WHERE status=$1
    ORDER BY due_date
    LIMIT 5`,
    [0]
  );
  res.json(result.rows);
});

router.get("/detail/:id", async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM debt_detail WHERE debt_master_id = $1 
    ORDER BY installment_number`,
    [req.params.id]
  );
  res.json(result.rows);
});

// READ ONE
router.get("/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM debt_master WHERE id = $1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

// UPDATE
router.put("/detail/:id", async (req, res) => {
  const { payment_date } = req.body;
  const detailId = req.params.id;

  // 1️⃣ Update cicilan yang ditekan user
  const update = await pool.query(
    `UPDATE debt_detail 
     SET payment_date = $1, status = 1 
     WHERE id = $2 
     RETURNING *`,
    [payment_date, detailId]
  );

  const updatedDetail = update.rows[0];

  // 2️⃣ Ambil debt_master_id dari cicilan yang diupdate
  const debtMasterId = updatedDetail.debt_master_id;

  // 3️⃣ Cek apakah SEMUA cicilan sudah status=1
  const checkAll = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE status = 0) AS remaining
     FROM debt_detail 
     WHERE debt_master_id = $1`,
    [debtMasterId]
  );

  const remaining = Number(checkAll.rows[0].remaining);

  // 4️⃣ Jika remaining = 0 → semua sudah lunas → update debt_master
  let masterUpdate = null;

  if (remaining === 0) {
    masterUpdate = await pool.query(
      `UPDATE debt_master 
       SET status = 1 
       WHERE id = $1
       RETURNING *`,
      [debtMasterId]
    );
  }

  // 5️⃣ Kirim response lengkap
  res.json({
    detail: updatedDetail,
    masterUpdated: masterUpdate ? masterUpdate.rows[0] : null,
  });
});

// DELETE
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM debt_master WHERE id = $1", [req.params.id]);
  res.json({ message: "Deleted successfully" });
});

export default router;
