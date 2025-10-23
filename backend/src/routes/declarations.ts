import express, { Request, Response } from 'express';
import { pool } from '../index';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Get all declarations
router.get('/',
  query('year').optional().isInt(),
  query('period_type').optional().isIn(['MONTHLY', 'QUARTERLY']),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let query = 'SELECT * FROM declarations WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (req.query.year) {
        query += ` AND year = $${paramIndex}`;
        params.push(req.query.year);
        paramIndex++;
      }

      if (req.query.period_type) {
        query += ` AND period_type = $${paramIndex}`;
        params.push(req.query.period_type);
        paramIndex++;
      }

      query += ' ORDER BY year DESC, month DESC, quarter DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching declarations:', error);
      res.status(500).json({ error: 'Error fetching declarations' });
    }
  }
);

// Get single declaration
router.get('/:id',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query('SELECT * FROM declarations WHERE id = $1', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Declaration not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching declaration:', error);
      res.status(500).json({ error: 'Error fetching declaration' });
    }
  }
);

// Create declaration
router.post('/',
  body('period_type').isIn(['MONTHLY', 'QUARTERLY']),
  body('year').isInt(),
  body('month').optional().isInt({ min: 1, max: 12 }),
  body('quarter').optional().isInt({ min: 1, max: 4 }),
  body('total_revenue').isFloat({ min: 0 }),
  body('total_expenses').isFloat({ min: 0 }),
  body('deductible_expenses').isFloat({ min: 0 }),
  body('urssaf_amount').isFloat({ min: 0 }),
  body('urssaf_rate').isFloat({ min: 0 }),
  body('taxable_income').isFloat({ min: 0 }),
  body('ir_amount').optional().isFloat({ min: 0 }),
  body('notes').optional().trim(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        period_type,
        year,
        month,
        quarter,
        total_revenue,
        total_expenses,
        deductible_expenses,
        urssaf_amount,
        urssaf_rate,
        taxable_income,
        ir_amount,
        notes,
      } = req.body;

      // Validate period
      if (period_type === 'MONTHLY' && !month) {
        return res.status(400).json({ error: 'Month is required for monthly declarations' });
      }
      if (period_type === 'QUARTERLY' && !quarter) {
        return res.status(400).json({ error: 'Quarter is required for quarterly declarations' });
      }

      const result = await pool.query(
        `INSERT INTO declarations (
          period_type, year, month, quarter, total_revenue, total_expenses,
          deductible_expenses, urssaf_amount, urssaf_rate, taxable_income,
          ir_amount, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'DRAFT')
        RETURNING *`,
        [
          period_type,
          year,
          month || null,
          quarter || null,
          total_revenue,
          total_expenses,
          deductible_expenses,
          urssaf_amount,
          urssaf_rate,
          taxable_income,
          ir_amount || null,
          notes,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating declaration:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Declaration for this period already exists' });
      }
      res.status(500).json({ error: 'Error creating declaration' });
    }
  }
);

// Update declaration
router.put('/:id',
  param('id').isUUID(),
  body('declaration_date').optional().isISO8601(),
  body('payment_date').optional().isISO8601(),
  body('status').optional().isIn(['DRAFT', 'SUBMITTED', 'PAID']),
  body('notes').optional().trim(),
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
      const query = `UPDATE declarations SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Declaration not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating declaration:', error);
      res.status(500).json({ error: 'Error updating declaration' });
    }
  }
);

// Delete declaration
router.delete('/:id',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query('DELETE FROM declarations WHERE id = $1 RETURNING *', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Declaration not found' });
      }

      res.json({ message: 'Declaration deleted successfully' });
    } catch (error) {
      console.error('Error deleting declaration:', error);
      res.status(500).json({ error: 'Error deleting declaration' });
    }
  }
);

export default router;
