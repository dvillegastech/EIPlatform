import express, { Request, Response } from 'express';
import { pool } from '../index';
import { query, validationResult } from 'express-validator';

const router = express.Router();

// Get dashboard statistics
router.get('/stats',
  query('year').optional().isInt(),
  query('month').optional().isInt({ min: 1, max: 12 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;

      // Get revenue for the period
      const revenueResult = await pool.query(`
        SELECT
          COALESCE(SUM(amount_ttc), 0) as total_revenue,
          COUNT(*) as invoice_count
        FROM invoices
        WHERE status = 'PAID'
          AND EXTRACT(YEAR FROM payment_date) = $1
          AND EXTRACT(MONTH FROM payment_date) = $2
      `, [year, month]);

      // Get expenses for the period
      const expensesResult = await pool.query(`
        SELECT
          COALESCE(SUM(amount), 0) as total_expenses,
          COALESCE(SUM(deductible_amount), 0) as total_deductible,
          COUNT(*) as expense_count
        FROM expenses
        WHERE EXTRACT(YEAR FROM expense_date) = $1
          AND EXTRACT(MONTH FROM expense_date) = $2
      `, [year, month]);

      // Get company config for calculations
      const configResult = await pool.query('SELECT * FROM company_config ORDER BY created_at DESC LIMIT 1');
      const config = configResult.rows[0];

      // Calculate URSSAF and IR
      const revenue = parseFloat(revenueResult.rows[0].total_revenue);
      const urssafAmount = revenue * (config.urssaf_rate / 100);
      const abattement = Math.max(revenue * (config.abattement_rate / 100), 305);
      const taxableIncome = Math.max(revenue - abattement, 0);

      // Get pending/overdue invoices
      const pendingResult = await pool.query(`
        SELECT COUNT(*) as pending_count, COALESCE(SUM(amount_ttc), 0) as pending_amount
        FROM invoices
        WHERE status = 'PENDING'
      `);

      const overdueResult = await pool.query(`
        SELECT COUNT(*) as overdue_count, COALESCE(SUM(amount_ttc), 0) as overdue_amount
        FROM invoices
        WHERE status = 'OVERDUE'
      `);

      // Year to date statistics
      const ytdRevenueResult = await pool.query(`
        SELECT COALESCE(SUM(amount_ttc), 0) as ytd_revenue
        FROM invoices
        WHERE status = 'PAID' AND EXTRACT(YEAR FROM payment_date) = $1
      `, [year]);

      const ytdExpensesResult = await pool.query(`
        SELECT COALESCE(SUM(deductible_amount), 0) as ytd_expenses
        FROM expenses
        WHERE EXTRACT(YEAR FROM expense_date) = $1
      `, [year]);

      res.json({
        period: { year, month },
        revenue: {
          total: revenueResult.rows[0].total_revenue,
          count: revenueResult.rows[0].invoice_count,
        },
        expenses: {
          total: expensesResult.rows[0].total_expenses,
          deductible: expensesResult.rows[0].total_deductible,
          count: expensesResult.rows[0].expense_count,
        },
        taxes: {
          urssaf: urssafAmount.toFixed(2),
          urssaf_rate: config.urssaf_rate,
          taxable_income: taxableIncome.toFixed(2),
          abattement: abattement.toFixed(2),
        },
        pending: {
          count: pendingResult.rows[0].pending_count,
          amount: pendingResult.rows[0].pending_amount,
        },
        overdue: {
          count: overdueResult.rows[0].overdue_count,
          amount: overdueResult.rows[0].overdue_amount,
        },
        year_to_date: {
          revenue: ytdRevenueResult.rows[0].ytd_revenue,
          expenses: ytdExpensesResult.rows[0].ytd_expenses,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Error fetching dashboard statistics' });
    }
  }
);

// Get monthly trend data
router.get('/trend',
  query('year').optional().isInt(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

      const result = await pool.query(`
        SELECT
          EXTRACT(MONTH FROM i.invoice_date) as month,
          COALESCE(SUM(i.amount_ttc) FILTER (WHERE i.status = 'PAID'), 0) as revenue,
          COALESCE(SUM(e.deductible_amount), 0) as expenses
        FROM generate_series(1, 12) as month_num
        LEFT JOIN invoices i ON EXTRACT(MONTH FROM i.invoice_date) = month_num
          AND EXTRACT(YEAR FROM i.invoice_date) = $1
        LEFT JOIN expenses e ON EXTRACT(MONTH FROM e.expense_date) = month_num
          AND EXTRACT(YEAR FROM e.expense_date) = $1
        GROUP BY month
        ORDER BY month
      `, [year]);

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      res.status(500).json({ error: 'Error fetching trend data' });
    }
  }
);

export default router;
