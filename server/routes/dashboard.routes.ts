import { Router } from "express";
import { pool } from "../db.js";
import { RowDataPacket } from "mysql2";

const router = Router();

// GET estadísticas del dashboard
router.get("/stats", async (req, res) => {
  try {
    // Total de productos
    const [totalProducts] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM products WHERE is_active = 1"
    );

    // Productos con stock bajo
    const [lowStock] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM products WHERE current_stock <= reorder_point AND is_active = 1"
    );

    // Valor total del inventario
    const [inventoryValue] = await pool.query<RowDataPacket[]>(
      "SELECT SUM(current_stock * cost_price) as total FROM products WHERE is_active = 1"
    );

    // Requerimientos pendientes
    const [pendingReqs] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM requirements WHERE status = 'PENDING'"
    );

    res.json({
      totalProducts: totalProducts[0].count || 0,
      lowStockProducts: lowStock[0].count || 0,
      inventoryValue: inventoryValue[0].total || 0,
      pendingRequirements: pendingReqs[0].count || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

// GET productos con stock bajo
router.get("/low-stock", async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*,
              c.name as category_name,
              s.name as supplier_name,
              (p.reorder_point - p.current_stock) as quantity_to_order
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE p.is_active = 1 
         AND p.current_stock <= p.reorder_point
       ORDER BY p.current_stock ASC
       LIMIT 20`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener productos con stock bajo" });
  }
});

// GET movimientos recientes
router.get("/recent-movements", async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT sm.*,
              p.sku,
              p.name as product_name,
              c.name as category_name
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY sm.created_at DESC
       LIMIT 20`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener movimientos recientes" });
  }
});

export default router;