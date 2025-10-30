import { Router } from "express";
import { pool } from "../db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// GET todas las categorías
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
       GROUP BY c.id
       ORDER BY c.name`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
});

// POST crear categoría
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description || '']
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: "Categoría creada exitosamente" 
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: "La categoría ya existe" });
    } else {
      res.status(500).json({ message: "Error al crear categoría" });
    }
  }
});

// PUT actualizar categoría
router.put("/:id", async (req, res) => {
  const { name, description, is_active } = req.body;
  
  try {
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?",
      [name, description, is_active !== undefined ? is_active : 1, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría actualizada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar categoría" });
  }
});

// DELETE eliminar categoría
router.delete("/:id", async (req, res) => {
  try {
    // Verificar si hay productos asociados
    const [products] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1",
      [req.params.id]
    );

    if (products[0].count > 0) {
      return res.status(400).json({ 
        message: "No se puede eliminar la categoría porque tiene productos asociados" 
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM categories WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar categoría" });
  }
});

export default router;