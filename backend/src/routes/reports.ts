import express, { Request, Response } from 'express';
import { pool } from '../index';
import PDFDocument from 'pdfkit';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Generate PDF report
router.post('/generate',
  body('report_type').isIn(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM']),
  body('report_name').notEmpty().trim(),
  body('start_date').isISO8601(),
  body('end_date').isISO8601(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { report_type, report_name, start_date, end_date } = req.body;

      // Fetch data for the report
      const invoicesResult = await pool.query(
        `SELECT * FROM invoices
         WHERE invoice_date BETWEEN $1 AND $2
         ORDER BY invoice_date DESC`,
        [start_date, end_date]
      );

      const expensesResult = await pool.query(
        `SELECT e.*, c.name as category_name
         FROM expenses e
         LEFT JOIN expense_categories c ON e.category_id = c.id
         WHERE e.expense_date BETWEEN $1 AND $2
         ORDER BY e.expense_date DESC`,
        [start_date, end_date]
      );

      const configResult = await pool.query('SELECT * FROM company_config ORDER BY created_at DESC LIMIT 1');
      const config = configResult.rows[0];

      // Calculate totals
      const totalRevenue = invoicesResult.rows
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + parseFloat(inv.amount_ttc), 0);

      const totalExpenses = expensesResult.rows
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

      const totalDeductible = expensesResult.rows
        .reduce((sum, exp) => sum + parseFloat(exp.deductible_amount), 0);

      const urssafAmount = totalRevenue * (parseFloat(config.urssaf_rate) / 100);
      const abattement = Math.max(totalRevenue * (parseFloat(config.abattement_rate) / 100), 305);
      const taxableIncome = Math.max(totalRevenue - abattement, 0);

      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `report-${Date.now()}.pdf`;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadDir, fileName);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text(report_name, { align: 'center' });
      doc.fontSize(12).text(`Période: ${start_date} - ${end_date}`, { align: 'center' });
      doc.moveDown();

      // Company info
      doc.fontSize(14).text('Information de l\'entreprise', { underline: true });
      doc.fontSize(10)
        .text(`Nom: ${config.company_name}`)
        .text(`Type d'activité: ${config.activity_type}`)
        .text(`Taux URSSAF: ${config.urssaf_rate}%`);
      doc.moveDown();

      // Summary
      doc.fontSize(14).text('Résumé Financier', { underline: true });
      doc.fontSize(10)
        .text(`Chiffre d'affaires total: ${totalRevenue.toFixed(2)} €`)
        .text(`Dépenses totales: ${totalExpenses.toFixed(2)} €`)
        .text(`Dépenses déductibles: ${totalDeductible.toFixed(2)} €`)
        .text(`Cotisations URSSAF: ${urssafAmount.toFixed(2)} €`)
        .text(`Abattement forfaitaire: ${abattement.toFixed(2)} €`)
        .text(`Revenu imposable: ${taxableIncome.toFixed(2)} €`)
        .text(`Revenu net: ${(totalRevenue - urssafAmount - totalExpenses).toFixed(2)} €`);
      doc.moveDown();

      // Invoices
      doc.fontSize(14).text('Factures', { underline: true });
      doc.fontSize(10);

      if (invoicesResult.rows.length === 0) {
        doc.text('Aucune facture pour cette période.');
      } else {
        invoicesResult.rows.forEach((inv, index) => {
          doc.text(
            `${index + 1}. ${inv.invoice_number} - ${inv.client_name} - ${inv.amount_ttc} € - ${inv.status}`,
            { continued: false }
          );
        });
      }
      doc.moveDown();

      // Expenses
      doc.fontSize(14).text('Dépenses', { underline: true });
      doc.fontSize(10);

      if (expensesResult.rows.length === 0) {
        doc.text('Aucune dépense pour cette période.');
      } else {
        expensesResult.rows.forEach((exp, index) => {
          doc.text(
            `${index + 1}. ${exp.category_name} - ${exp.description} - ${exp.amount} € (Déductible: ${exp.deductible_amount} €)`,
            { continued: false }
          );
        });
      }

      // Footer
      doc.moveDown();
      doc.fontSize(8).text(`Généré le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });

      doc.end();

      // Wait for PDF to be written
      stream.on('finish', async () => {
        // Save report metadata to database
        const reportResult = await pool.query(
          `INSERT INTO reports (report_type, report_name, start_date, end_date, file_path)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [report_type, report_name, start_date, end_date, filePath]
        );

        res.json({
          report: reportResult.rows[0],
          download_url: `/uploads/${fileName}`,
        });
      });

      stream.on('error', (error) => {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Error generating PDF report' });
      });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Error generating report' });
    }
  }
);

// Get all reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM reports ORDER BY generated_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
});

export default router;
