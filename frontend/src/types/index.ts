export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  invoice_date: string;
  due_date: string;
  payment_date?: string;
  amount_ht: number;
  amount_ttc: number;
  tva_amount: number;
  tva_rate: number;
  description?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  expense_date: string;
  amount: number;
  description: string;
  supplier?: string;
  deduction_type: 'DEBOURS' | 'NON_DEDUCTIBLE' | 'PERSONNEL';
  deduction_percentage: number;
  deductible_amount: number;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  deduction_type: string;
  deduction_percentage: number;
  icon?: string;
  created_at: string;
}

export interface CompanyConfig {
  id: string;
  company_name: string;
  siret?: string;
  activity_type: 'BIC_VENTE' | 'BIC_SERVICE' | 'BNC' | 'BNC_CIPAV';
  urssaf_rate: number;
  abattement_rate: number;
  versement_liberatoire: boolean;
  versement_liberatoire_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Declaration {
  id: string;
  period_type: 'MONTHLY' | 'QUARTERLY';
  year: number;
  month?: number;
  quarter?: number;
  total_revenue: number;
  total_expenses: number;
  deductible_expenses: number;
  urssaf_amount: number;
  urssaf_rate: number;
  taxable_income: number;
  ir_amount?: number;
  declaration_date?: string;
  payment_date?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PAID';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  entity_type: 'INVOICE' | 'EXPENSE';
  entity_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface DashboardStats {
  period: {
    year: number;
    month: number;
  };
  revenue: {
    total: number;
    count: number;
  };
  expenses: {
    total: number;
    deductible: number;
    count: number;
  };
  taxes: {
    urssaf: number;
    urssaf_rate: number;
    taxable_income: number;
    abattement: number;
  };
  pending: {
    count: number;
    amount: number;
  };
  overdue: {
    count: number;
    amount: number;
  };
  year_to_date: {
    revenue: number;
    expenses: number;
  };
}

export interface TaxCalculation {
  revenue: number;
  expenses: number;
  deductibleExpenses: number;
  urssafAmount: number;
  urssafRate: number;
  abattementAmount: number;
  taxableIncome: number;
  irAmount?: number;
  netIncome: number;
}
