import express, { Request, Response } from 'express';
import { pool } from '../index';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get company configuration
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM company_config ORDER BY created_at DESC LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Error fetching configuration' });
  }
});

// Update company configuration
router.put('/',
  body('company_name').optional().trim(),
  body('siret').optional().trim(),
  body('activity_type').optional().isIn(['BIC_VENTE', 'BIC_SERVICE', 'BNC', 'BNC_CIPAV']),
  body('urssaf_rate').optional().isFloat({ min: 0, max: 100 }),
  body('abattement_rate').optional().isFloat({ min: 0, max: 100 }),
  body('versement_liberatoire').optional().isBoolean(),
  body('versement_liberatoire_rate').optional().isFloat({ min: 0, max: 100 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get current config ID
      const currentConfig = await pool.query('SELECT id FROM company_config ORDER BY created_at DESC LIMIT 1');

      if (currentConfig.rows.length === 0) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      const configId = currentConfig.rows[0].id;

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

      values.push(configId);
      const query = `UPDATE company_config SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(query, values);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating config:', error);
      res.status(500).json({ error: 'Error updating configuration' });
    }
  }
);

export default router;
