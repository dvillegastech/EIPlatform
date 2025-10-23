import express, { Request, Response } from 'express';
import { pool } from '../index';
import { body, query, validationResult } from 'express-validator';
import { calculateTaxes, CompanyConfig } from '../services/calculator';

const router = express.Router();

// Calculate taxes for a given period
router.post('/calculate',
  body('year').isInt(),
  body('month').optional().isInt({ min: 1, max: 12 }),
  body('quarter').optional().isInt({ min: 1, max: 4 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { year, month, quarter } = req.body;

      // Get company config
      const configResult = await pool.query('SELECT * FROM company_config ORDER BY created_at DESC LIMIT 1');
      if (configResult.rows.length === 0) {
        return res.status(404).json({ error: 'Company configuration not found' });
      }

      const config: CompanyConfig = {
        activity_type: configResult.rows[0].activity_type,
        urssaf_rate: parseFloat(configResult.rows[0].urssaf_rate),
        abattement_rate: parseFloat(configResult.rows[0].abattement_rate),
        versement_liberatoire: configResult.rows[0].versement_liberatoire,
        versement_liberatoire_rate: configResult.rows[0].versement_liberatoire_rate
          ? parseFloat(configResult.rows[0].versement_liberatoire_rate)
          : undefined,
      };

      // Build date filter
      let dateFilter = 'EXTRACT(YEAR FROM invoice_date) = $1';
      const params: any[] = [year];

      if (month) {
        dateFilter += ' AND EXTRACT(MONTH FROM invoice_date) = $2';
        params.push(month);
      } else if (quarter) {
        const startMonth = (quarter - 1) * 3 + 1;
        const endMonth = quarter * 3;
        dateFilter += ' AND EXTRACT(MONTH FROM invoice_date) BETWEEN $2 AND $3';
        params.push(startMonth, endMonth);
      }

      // Get total revenue
      const revenueResult = await pool.query(
        `SELECT COALESCE(SUM(amount_ttc), 0) as total FROM invoices WHERE status = 'PAID' AND ${dateFilter}`,
        params
      );

      // Get total expenses
      const expenseFilter = dateFilter.replace(/invoice_date/g, 'expense_date');
      const expensesResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total, COALESCE(SUM(deductible_amount), 0) as deductible FROM expenses WHERE ${expenseFilter}`,
        params
      );

      const revenue = parseFloat(revenueResult.rows[0].total);
      const expenses = parseFloat(expensesResult.rows[0].total);
      const deductibleExpenses = parseFloat(expensesResult.rows[0].deductible);

      // Calculate taxes
      const calculation = calculateTaxes(revenue, expenses, deductibleExpenses, config);

      res.json({
        period: { year, month, quarter },
        calculation,
      });
    } catch (error) {
      console.error('Error calculating taxes:', error);
      res.status(500).json({ error: 'Error calculating taxes' });
    }
  }
);

// Simulate different scenarios
router.post('/simulate',
  body('revenue').isFloat({ min: 0 }),
  body('expenses').optional().isFloat({ min: 0 }),
  body('activity_type').optional().isIn(['BIC_VENTE', 'BIC_SERVICE', 'BNC', 'BNC_CIPAV']),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { revenue, expenses = 0 } = req.body;

      // Get company config or use provided activity type
      const configResult = await pool.query('SELECT * FROM company_config ORDER BY created_at DESC LIMIT 1');
      let config: CompanyConfig;

      if (req.body.activity_type) {
        // Use custom activity type from request
        const activityType = req.body.activity_type;
        const urssafRates: any = {
          BIC_VENTE: 12.3,
          BIC_SERVICE: 21.2,
          BNC: 24.6,
          BNC_CIPAV: 23.2,
        };
        const abattementRates: any = {
          BIC_VENTE: 71,
          BIC_SERVICE: 50,
          BNC: 34,
          BNC_CIPAV: 34,
        };

        config = {
          activity_type: activityType,
          urssaf_rate: urssafRates[activityType],
          abattement_rate: abattementRates[activityType],
          versement_liberatoire: false,
        };
      } else if (configResult.rows.length > 0) {
        // Use saved config
        config = {
          activity_type: configResult.rows[0].activity_type,
          urssaf_rate: parseFloat(configResult.rows[0].urssaf_rate),
          abattement_rate: parseFloat(configResult.rows[0].abattement_rate),
          versement_liberatoire: configResult.rows[0].versement_liberatoire,
          versement_liberatoire_rate: configResult.rows[0].versement_liberatoire_rate
            ? parseFloat(configResult.rows[0].versement_liberatoire_rate)
            : undefined,
        };
      } else {
        return res.status(404).json({ error: 'Company configuration not found and no activity type provided' });
      }

      const calculation = calculateTaxes(revenue, expenses, expenses, config);

      res.json({
        simulation: true,
        config,
        calculation,
      });
    } catch (error) {
      console.error('Error simulating taxes:', error);
      res.status(500).json({ error: 'Error simulating taxes' });
    }
  }
);

export default router;
