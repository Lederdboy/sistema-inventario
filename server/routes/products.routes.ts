import { Router } from "express";
import { pool } from "../db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// GET todos los productos
router.get("/", async (req, res) => {
  try {
    const { search, category_id, low_stock } = req.query;
    
    let query = `
      SELECT p.*, 
             c.name as category_name,
             s.name as supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.is_active = 1
    `;
    
    const params: any[] = [];
    
    if (search) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }
    
    if (low_stock === 'true') {
      query += ` AND p.current_stock <= p.reorder_point`;
    }
    
    query += ` ORDER BY p.name`;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
});

// GET un producto por ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, 
              c.name as category_name,
              s.name as supplier_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
});

// POST crear producto
router.post("/", async (req, res) => {
  const {
    sku, name, description, category_id, supplier_id,
    unit_price, cost_price, current_stock, min_stock,
    max_stock, reorder_point, location
  } = req.body;

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO products (
        sku, name, description, category_id, supplier_id,
        unit_price, cost_price, current_stock, min_stock,
        max_stock, reorder_point, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sku, name, description || null, category_id || null, supplier_id || null,
        unit_price || 0, cost_price || 0, current_stock || 0, min_stock || 0,
        max_stock || 1000, reorder_point || 0, location || null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Producto creado exitosamente"
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: "El SKU ya existe" });
    } else {
      res.status(500).json({ message: "Error al crear producto" });
    }
  }
});

// PUT actualizar producto
router.put("/:id", async (req, res) => {
  const {
    sku, name, description, category_id, supplier_id,
    unit_price, cost_price, current_stock, min_stock,
    max_stock, reorder_point, location
  } = req.body;

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE products SET
        sku = ?, name = ?, description = ?, category_id = ?, supplier_id = ?,
        unit_price = ?, cost_price = ?, current_stock = ?, min_stock = ?,
        max_stock = ?, reorder_point = ?, location = ?
      WHERE id = ?`,
      [
        sku, name, description, category_id, supplier_id,
        unit_price, cost_price, current_stock, min_stock,
        max_stock, reorder_point, location, req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
});

// DELETE eliminar producto
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE products SET is_active = 0 WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
});

export default router;