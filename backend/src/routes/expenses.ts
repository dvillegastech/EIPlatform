import express, { Request, Response } from 'express';
import { pool } from '../index';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Get all expenses with filters
router.get('/',
  query('year').optional().isInt(),
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('category_id').optional().isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let query = `
        SELECT e.*, c.name as category_name, c.icon as category_icon
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (req.query.year) {
        query += ` AND EXTRACT(YEAR FROM e.expense_date) = $${paramIndex}`;
        params.push(req.query.year);
        paramIndex++;
      }

      if (req.query.month) {
        query += ` AND EXTRACT(MONTH FROM e.expense_date) = $${paramIndex}`;
        params.push(req.query.month);
        paramIndex++;
      }

      if (req.query.category_id) {
        query += ` AND e.category_id = $${paramIndex}`;
        params.push(req.query.category_id);
        paramIndex++;
      }

      query += ' ORDER BY e.expense_date DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ error: 'Error fetching expenses' });
    }
  }
);

// Get single expense
router.get('/:id',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query(`
        SELECT e.*, c.name as category_name, c.icon as category_icon
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        WHERE e.id = $1
      `, [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching expense:', error);
      res.status(500).json({ error: 'Error fetching expense' });
    }
  }
);

// Create expense
router.post('/',
  body('category_id').isUUID(),
  body('expense_date').isISO8601(),
  body('amount').isFloat({ min: 0 }),
  body('description').notEmpty().trim(),
  body('supplier').optional().trim(),
  body('deduction_type').isIn(['DEBOURS', 'NON_DEDUCTIBLE', 'PERSONNEL']),
  body('deduction_percentage').optional().isFloat({ min: 0, max: 100 }),
  body('payment_method').optional().trim(),
  body('reference_number').optional().trim(),
  body('notes').optional().trim(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        category_id,
        expense_date,
        amount,
        description,
        supplier,
        deduction_type,
        deduction_percentage = 100,
        payment_method,
        reference_number,
        notes,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO expenses (
          category_id, expense_date, amount, description, supplier,
          deduction_type, deduction_percentage, payment_method,
          reference_number, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          category_id,
          expense_date,
          amount,
          description,
          supplier,
          deduction_type,
          deduction_percentage,
          payment_method,
          reference_number,
          notes,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({ error: 'Error creating expense' });
    }
  }
);

// Update expense
router.put('/:id',
  param('id').isUUID(),
  body('category_id').optional().isUUID(),
  body('expense_date').optional().isISO8601(),
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('deduction_type').optional().isIn(['DEBOURS', 'NON_DEDUCTIBLE', 'PERSONNEL']),
  body('deduction_percentage').optional().isFloat({ min: 0, max: 100 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const fields = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(req.body)) {
        if (value !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(req.params.id);
      const query = `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: 'Error updating expense' });
    }
  }
);

// Delete expense
router.delete('/:id',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ error: 'Error deleting expense' });
    }
  }
);

// Get expense statistics by category
router.get('/stats/by-category', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        c.name,
        c.icon,
        COUNT(e.id) as expense_count,
        COALESCE(SUM(e.amount), 0) as total_amount,
        COALESCE(SUM(e.deductible_amount), 0) as total_deductible
      FROM expense_categories c
      LEFT JOIN expenses e ON c.id = e.category_id
      GROUP BY c.id, c.name, c.icon
      ORDER BY total_amount DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

export default router;
