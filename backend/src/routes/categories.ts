import express, { Request, Response } from 'express';
import { pool } from '../index';

const router = express.Router();

// Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM expense_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

export default router;
