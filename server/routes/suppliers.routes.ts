import { Router } from "express";
import { pool } from "../db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// GET todos los proveedores
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT s.*, COUNT(p.id) as product_count
       FROM suppliers s
       LEFT JOIN products p ON s.id = p.supplier_id
       WHERE s.is_active = 1
       GROUP BY s.id
       ORDER BY s.name`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener proveedores" });
  }
});

// GET un proveedor por ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM suppliers WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener proveedor" });
  }
});

// POST crear proveedor
router.post("/", async (req, res) => {
  const {
    code, name, contact_name, email, phone,
    address, city, country
  } = req.body;

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO suppliers (
        code, name, contact_name, email, phone,
        address, city, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, name, contact_name || null, email || null, phone || null,
        address || null, city || null, country || null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Proveedor creado exitosamente"
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: "El código del proveedor ya existe" });
    } else {
      res.status(500).json({ message: "Error al crear proveedor" });
    }
  }
});

// PUT actualizar proveedor
router.put("/:id", async (req, res) => {
  const {
    code, name, contact_name, email, phone,
    address, city, country, is_active
  } = req.body;

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE suppliers SET
        code = ?, name = ?, contact_name = ?, email = ?, phone = ?,
        address = ?, city = ?, country = ?, is_active = ?
      WHERE id = ?`,
      [
        code, name, contact_name, email, phone,
        address, city, country, is_active, req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar proveedor" });
  }
});

// DELETE eliminar proveedor
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE suppliers SET is_active = 0 WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar proveedor" });
  }
});

export default router;