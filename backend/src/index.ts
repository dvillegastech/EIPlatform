import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Routes
import invoiceRoutes from './routes/invoices';
import expenseRoutes from './routes/expenses';
import declarationRoutes from './routes/declarations';
import reportRoutes from './routes/reports';
import attachmentRoutes from './routes/attachments';
import categoryRoutes from './routes/categories';
import configRoutes from './routes/config';
import dashboardRoutes from './routes/dashboard';
import calculatorRoutes from './routes/calculator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection pool
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ei_platform',
  user: process.env.DB_USER || 'ei_user',
  password: process.env.DB_PASSWORD || 'ei_password_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// Routes
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/declarations', declarationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/config', configRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calculator', calculatorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
