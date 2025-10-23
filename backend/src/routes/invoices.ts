import express, { Request, Response } from 'express';
import { pool } from '../index';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Get all invoices with filters
router.get('/',
  query('status').optional().isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
  query('year').optional().isInt(),
  query('month').optional().isInt({ min: 1, max: 12 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let query = 'SELECT * FROM invoices WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (req.query.status) {
        query += ` AND status = $${paramIndex}`;
        params.push(req.query.status);
        paramIndex++;
      }

      if (req.query.year) {
        query += ` AND EXTRACT(YEAR FROM invoice_date) = $${paramIndex}`;
        params.push(req.query.year);
        paramIndex++;
      }

      if (req.query.month) {
        query += ` AND EXTRACT(MONTH FROM invoice_date) = $${paramIndex}`;
        params.push(req.query.month);
        paramIndex++;
      }

      query += ' ORDER BY invoice_date DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ error: 'Error fetching invoices' });
    }
  }
);

// Get single invoice
router.get('/:id',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({ error: 'Error fetching invoice' });
    }
  }
);

// Create invoice
router.post('/',
  body('invoice_number').notEmpty().trim(),
  body('client_name').notEmpty().trim(),
  body('invoice_date').isISO8601(),
  body('due_date').isISO8601(),
  body('amount_ht').isFloat({ min: 0 }),
  body('amount_ttc').isFloat({ min: 0 }),
  body('tva_amount').optional().isFloat({ min: 0 }),
  body('tva_rate').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('payment_method').optional().trim(),
  body('notes').optional().trim(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        invoice_number,
        client_name,
        invoice_date,
        due_date,
        amount_ht,
        amount_ttc,
        tva_amount = 0,
        tva_rate = 0,
        description,
        payment_method,
        notes,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO invoices (
          invoice_number, client_name, invoice_date, due_date,
          amount_ht, amount_ttc, tva_amount, tva_rate,
          description, payment_method, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
        RETURNING *`,
        [
          invoice_number,
          client_name,
          invoice_date,
          due_date,
          amount_ht,
          amount_ttc,
          tva_amount,
          tva_rate,
          description,
          payment_method,
          notes,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Invoice number already exists' });
      }
      res.status(500).json({ error: 'Error creating invoice' });
    }
  }
);

// Update invoice
router.put('/:id',
  param('id').isUUID(),
  body('client_name').optional().trim(),
  body('invoice_date').optional().isISO8601(),
  body('due_date').optional().isISO8601(),
  body('payment_date').optional().isISO8601(),
  body('amount_ht').optional().isFloat({ min: 0 }),
  body('amount_ttc').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
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
      const query = `UPDATE invoices SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json({ error: 'Error updating invoice' });
    }
  }
);

// Delete invoice
router.delete('/:id',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({ error: 'Error deleting invoice' });
    }
  }
);

// Get invoice statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
        COUNT(*) FILTER (WHERE status = 'PAID') as paid_count,
        COUNT(*) FILTER (WHERE status = 'OVERDUE') as overdue_count,
        COALESCE(SUM(amount_ttc) FILTER (WHERE status = 'PAID'), 0) as total_paid,
        COALESCE(SUM(amount_ttc) FILTER (WHERE status = 'PENDING'), 0) as total_pending
      FROM invoices
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

export default router;
