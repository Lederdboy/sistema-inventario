import { Router } from "express";
import { pool } from "../db.js";
import { RowDataPacket } from "mysql2";

const router = Router();

// GET todos los movimientos
router.get("/", async (req, res) => {
  try {
    const { product_id, movement_type, limit } = req.query;
    
    let query = `
      SELECT sm.*,
             p.sku,
             p.name as product_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (product_id) {
      query += ` AND sm.product_id = ?`;
      params.push(product_id);
    }
    
    if (movement_type) {
      query += ` AND sm.movement_type = ?`;
      params.push(movement_type);
    }
    
    query += ` ORDER BY sm.created_at DESC`;
    
    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit as string));
    }
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener movimientos" });
  }
});

// POST crear movimiento
router.post("/", async (req, res) => {
  const { product_id, movement_type, quantity, unit_cost, reason, reference } = req.body;

  try {
    // Obtener stock actual
    const [productRows] = await pool.query<RowDataPacket[]>(
      "SELECT current_stock FROM products WHERE id = ?",
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const currentStock = productRows[0].current_stock;
    const absQuantity = Math.abs(quantity);

    // Calcular nuevo stock
    let newStock = currentStock;
    if (movement_type === 'IN') {
      newStock = currentStock + absQuantity;
    } else if (movement_type === 'OUT') {
      if (currentStock < absQuantity) {
        return res.status(400).json({ message: "Stock insuficiente" });
      }
      newStock = currentStock - absQuantity;
    }

    // Insertar movimiento
    await pool.query(
      `INSERT INTO stock_movements (
        product_id, movement_type, quantity, previous_stock, new_stock,
        unit_cost, reason, reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, movement_type, quantity, currentStock, newStock, unit_cost || null, reason || null, reference || null]
    );

    // Actualizar stock del producto
    await pool.query(
      "UPDATE products SET current_stock = ? WHERE id = ?",
      [newStock, product_id]
    );

    res.status(201).json({ message: "Movimiento registrado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar movimiento" });
  }
});

export default router;