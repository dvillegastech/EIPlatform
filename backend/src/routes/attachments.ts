import express, { Request, Response } from 'express';
import { pool } from '../index';
import multer from 'multer';
import path from 'path';
import { param, query, validationResult } from 'express-validator';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, images, and documents are allowed'));
    }
  }
});

// Upload attachment
router.post('/upload',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { entity_type, entity_id } = req.body;

      if (!entity_type || !entity_id) {
        // Delete uploaded file if validation fails
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'entity_type and entity_id are required' });
      }

      if (!['INVOICE', 'EXPENSE'].includes(entity_type)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Invalid entity_type' });
      }

      const result = await pool.query(
        `INSERT INTO attachments (
          entity_type, entity_id, file_name, file_path,
          file_type, file_size, mime_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          entity_type,
          entity_id,
          req.file.originalname,
          req.file.path,
          path.extname(req.file.originalname).substring(1).toUpperCase(),
          req.file.size,
          req.file.mimetype,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      // Clean up file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Error uploading attachment' });
    }
  }
);

// Get attachments for an entity
router.get('/',
  query('entity_type').isIn(['INVOICE', 'EXPENSE']),
  query('entity_id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query(
        'SELECT * FROM attachments WHERE entity_type = $1 AND entity_id = $2 ORDER BY uploaded_at DESC',
        [req.query.entity_type, req.query.entity_id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      res.status(500).json({ error: 'Error fetching attachments' });
    }
  }
);

// Download attachment
router.get('/:id/download',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query('SELECT * FROM attachments WHERE id = $1', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      const attachment = result.rows[0];
      res.download(attachment.file_path, attachment.file_name);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      res.status(500).json({ error: 'Error downloading attachment' });
    }
  }
);

// Delete attachment
router.delete('/:id',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await pool.query('DELETE FROM attachments WHERE id = $1 RETURNING *', [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Attachment not found' });
      }

      // Delete file from filesystem
      const attachment = result.rows[0];
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }

      res.json({ message: 'Attachment deleted successfully' });
    } catch (error) {
      console.error('Error deleting attachment:', error);
      res.status(500).json({ error: 'Error deleting attachment' });
    }
  }
);

export default router;
