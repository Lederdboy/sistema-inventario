import { Router } from "express";
import { pool } from "../db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// GET todos los requerimientos
router.get("/", async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    let query = `
      SELECT r.*,
             p.sku,
             p.name as product_name,
             s.name as supplier_name
      FROM requirements r
      JOIN products p ON r.product_id = p.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    
    if (priority) {
      query += ` AND r.priority = ?`;
      params.push(priority);
    }
    
    query += ` ORDER BY 
      CASE r.priority 
        WHEN 'URGENT' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        ELSE 4 
      END,
      r.expected_date ASC
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener requerimientos" });
  }
});

// GET un requerimiento por ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*,
              p.sku,
              p.name as product_name
       FROM requirements r
       JOIN products p ON r.product_id = p.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Requerimiento no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener requerimiento" });
  }
});

// POST crear requerimiento
router.post("/", async (req, res) => {
  const {
    product_id, quantity_needed, priority, requested_by,
    department, reason, expected_date
  } = req.body;

  try {
    // 1. Generar el requirement_number en el backend
    const [maxResult] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(requirement_number, 10) AS UNSIGNED)), 0) + 1 as next_number
       FROM requirements
       WHERE requirement_number LIKE CONCAT('REQ-', YEAR(CURDATE()), '-%')`
    );
    
    const nextNumber = maxResult[0].next_number;
    const year = new Date().getFullYear();
    const requirementNumber = `REQ-${year}-${String(nextNumber).padStart(4, '0')}`;

    // 2. Insertar con el número generado
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO requirements (
        requirement_number, product_id, quantity_needed, priority, requested_by,
        department, reason, expected_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requirementNumber, product_id, quantity_needed, priority || 'MEDIUM', 
        requested_by, department || null, reason || null, expected_date || null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      requirement_number: requirementNumber,
      message: "Requerimiento creado exitosamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear requerimiento" });
  }
});

// PUT actualizar requerimiento
router.put("/:id", async (req, res) => {
  const updates: string[] = [];
  const values: any[] = [];

  Object.entries(req.body).forEach(([key, value]) => {
    updates.push(`${key} = ?`);
    values.push(value);
  });

  if (updates.length === 0) {
    return res.status(400).json({ message: "No hay datos para actualizar" });
  }

  values.push(req.params.id);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE requirements SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Requerimiento no encontrado" });
    }

    res.json({ message: "Requerimiento actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar requerimiento" });
  }
});

// DELETE eliminar requerimiento
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM requirements WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Requerimiento no encontrado" });
    }

    res.json({ message: "Requerimiento eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar requerimiento" });
  }
});

export default router;