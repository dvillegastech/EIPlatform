import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Invoices
export const getInvoices = (params?: any) => api.get('/invoices', { params });
export const getInvoice = (id: string) => api.get(`/invoices/${id}`);
export const createInvoice = (data: any) => api.post('/invoices', data);
export const updateInvoice = (id: string, data: any) => api.put(`/invoices/${id}`, data);
export const deleteInvoice = (id: string) => api.delete(`/invoices/${id}`);
export const getInvoiceStats = () => api.get('/invoices/stats/summary');

// Expenses
export const getExpenses = (params?: any) => api.get('/expenses', { params });
export const getExpense = (id: string) => api.get(`/expenses/${id}`);
export const createExpense = (data: any) => api.post('/expenses', data);
export const updateExpense = (id: string, data: any) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id: string) => api.delete(`/expenses/${id}`);
export const getExpenseStatsByCategory = () => api.get('/expenses/stats/by-category');

// Categories
export const getCategories = () => api.get('/categories');

// Config
export const getConfig = () => api.get('/config');
export const updateConfig = (data: any) => api.put('/config', data);

// Dashboard
export const getDashboardStats = (params?: any) => api.get('/dashboard/stats', { params });
export const getTrendData = (params?: any) => api.get('/dashboard/trend', { params });

// Calculator
export const calculateTaxes = (data: any) => api.post('/calculator/calculate', data);
export const simulateTaxes = (data: any) => api.post('/calculator/simulate', data);

// Declarations
export const getDeclarations = (params?: any) => api.get('/declarations', { params });
export const getDeclaration = (id: string) => api.get(`/declarations/${id}`);
export const createDeclaration = (data: any) => api.post('/declarations', data);
export const updateDeclaration = (id: string, data: any) => api.put(`/declarations/${id}`, data);
export const deleteDeclaration = (id: string) => api.delete(`/declarations/${id}`);

// Attachments
export const getAttachments = (params: any) => api.get('/attachments', { params });
export const uploadAttachment = (formData: FormData) =>
  api.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const downloadAttachment = (id: string) => api.get(`/attachments/${id}/download`, { responseType: 'blob' });
export const deleteAttachment = (id: string) => api.delete(`/attachments/${id}`);

// Reports
export const generateReport = (data: any) => api.post('/reports/generate', data);
export const getReports = () => api.get('/reports');

export default api;
