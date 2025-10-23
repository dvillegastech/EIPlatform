-- Enterprise Individuelle Platform Database Schema
-- Pour la gestion d'une Enterprise Individuelle en France

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: Configuration de l'entreprise
CREATE TABLE company_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    siret VARCHAR(14),
    activity_type VARCHAR(50) NOT NULL, -- 'BIC_VENTE', 'BIC_SERVICE', 'BNC', 'BNC_CIPAV'
    urssaf_rate DECIMAL(5,2) NOT NULL, -- Taux URSSAF en pourcentage
    abattement_rate DECIMAL(5,2) NOT NULL, -- Taux d'abattement forfaitaire en pourcentage
    versement_liberatoire BOOLEAN DEFAULT false,
    versement_liberatoire_rate DECIMAL(5,2), -- Taux du versement libératoire si applicable
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Facturas generadas (Invoices)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    amount_ht DECIMAL(10,2) NOT NULL, -- Montant Hors Taxes
    amount_ttc DECIMAL(10,2) NOT NULL, -- Montant Toutes Taxes Comprises
    tva_amount DECIMAL(10,2) DEFAULT 0,
    tva_rate DECIMAL(5,2) DEFAULT 0,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'
    payment_method VARCHAR(50), -- 'VIREMENT', 'CHEQUE', 'ESPECES', 'CARTE'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Categorías de gastos
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    deduction_type VARCHAR(50) NOT NULL, -- 'DEBOURS', 'NON_DEDUCTIBLE', 'PERSONNEL'
    deduction_percentage DECIMAL(5,2) DEFAULT 100, -- Pourcentage déductible pour certains frais
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Gastos deducibles
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES expense_categories(id),
    expense_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    supplier VARCHAR(255),
    deduction_type VARCHAR(50) NOT NULL, -- 'DEBOURS', 'NON_DEDUCTIBLE', 'PERSONNEL'
    deduction_percentage DECIMAL(5,2) DEFAULT 100,
    deductible_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount * deduction_percentage / 100) STORED,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100), -- Numero de factura del proveedor
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Archivos adjuntos (Soportes)
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'INVOICE', 'EXPENSE'
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'PDF', 'IMAGE', 'DOC'
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Declaraciones mensuales/trimestrales
CREATE TABLE declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_type VARCHAR(20) NOT NULL, -- 'MONTHLY', 'QUARTERLY'
    year INTEGER NOT NULL,
    month INTEGER, -- NULL para trimestral
    quarter INTEGER, -- NULL para mensual
    total_revenue DECIMAL(10,2) NOT NULL,
    total_expenses DECIMAL(10,2) NOT NULL,
    deductible_expenses DECIMAL(10,2) NOT NULL,
    urssaf_amount DECIMAL(10,2) NOT NULL,
    urssaf_rate DECIMAL(5,2) NOT NULL,
    taxable_income DECIMAL(10,2) NOT NULL, -- Después del abattement
    ir_amount DECIMAL(10,2), -- Si versement libératoire
    declaration_date DATE,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'PAID'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(period_type, year, month, quarter)
);

-- Table: Reportes generados
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(50) NOT NULL, -- 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM'
    report_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    file_path VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters JSONB -- Parámetros adicionales del reporte
);

-- Indexes para mejorar rendimiento
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_payment_date ON invoices(payment_date);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_declarations_period ON declarations(year, month, quarter);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_declarations_updated_at BEFORE UPDATE ON declarations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_config_updated_at BEFORE UPDATE ON company_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar categorías de gastos predefinidas
INSERT INTO expense_categories (name, description, deduction_type, deduction_percentage, icon) VALUES
    ('Loyer', 'Loyer du local professionnel ou quote-part du domicile', 'PERSONNEL', 50, 'home'),
    ('Électricité', 'Factures d''électricité (quote-part professionnelle)', 'PERSONNEL', 50, 'bolt'),
    ('Internet', 'Abonnement internet (usage professionnel)', 'PERSONNEL', 100, 'wifi'),
    ('Téléphone', 'Forfait téléphone mobile professionnel', 'PERSONNEL', 100, 'phone'),
    ('Navigo', 'Carte Navigo - Transport en commun', 'PERSONNEL', 100, 'train'),
    ('Carburant', 'Essence/Diesel pour déplacements professionnels', 'PERSONNEL', 100, 'local_gas_station'),
    ('Restauration', 'Restaurant d''entreprise / Repas professionnels', 'PERSONNEL', 100, 'restaurant'),
    ('Logiciels', 'Licences de logiciels professionnels', 'PERSONNEL', 100, 'computer'),
    ('Matériel informatique', 'Ordinateurs, périphériques, etc.', 'PERSONNEL', 100, 'laptop'),
    ('Fournitures', 'Fournitures de bureau', 'PERSONNEL', 100, 'edit'),
    ('Formation', 'Formations professionnelles', 'PERSONNEL', 100, 'school'),
    ('Assurance', 'Assurance professionnelle', 'PERSONNEL', 100, 'shield'),
    ('Comptable', 'Honoraires comptable/expert-comptable', 'PERSONNEL', 100, 'account_balance'),
    ('Débours', 'Frais engagés au nom du client', 'DEBOURS', 100, 'receipt_long'),
    ('Autres', 'Autres dépenses professionnelles', 'PERSONNEL', 100, 'more_horiz');

-- Insertar configuración por defecto (BNC - Profesión liberal)
INSERT INTO company_config (
    company_name,
    activity_type,
    urssaf_rate,
    abattement_rate,
    versement_liberatoire,
    versement_liberatoire_rate
) VALUES (
    'Mon Enterprise Individuelle',
    'BNC',
    24.6, -- Taux URSSAF 2025 pour BNC
    34.0, -- Abattement forfaitaire pour BNC
    false,
    NULL
);

-- Vue pour resumen mensual
CREATE VIEW monthly_summary AS
SELECT
    EXTRACT(YEAR FROM i.invoice_date) as year,
    EXTRACT(MONTH FROM i.invoice_date) as month,
    SUM(i.amount_ttc) as total_revenue,
    SUM(e.deductible_amount) as total_deductible_expenses,
    COUNT(DISTINCT i.id) as invoice_count,
    COUNT(DISTINCT e.id) as expense_count
FROM invoices i
LEFT JOIN expenses e ON EXTRACT(YEAR FROM e.expense_date) = EXTRACT(YEAR FROM i.invoice_date)
    AND EXTRACT(MONTH FROM e.expense_date) = EXTRACT(MONTH FROM i.invoice_date)
WHERE i.status = 'PAID'
GROUP BY year, month
ORDER BY year DESC, month DESC;

-- Vue pour dashboard
CREATE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM invoices WHERE status = 'PENDING') as pending_invoices,
    (SELECT COUNT(*) FROM invoices WHERE status = 'OVERDUE') as overdue_invoices,
    (SELECT COALESCE(SUM(amount_ttc), 0) FROM invoices WHERE status = 'PAID'
     AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)) as current_month_revenue,
    (SELECT COALESCE(SUM(deductible_amount), 0) FROM expenses
     AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)) as current_month_expenses,
    (SELECT COALESCE(SUM(amount_ttc), 0) FROM invoices WHERE status = 'PAID'
     AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)) as year_to_date_revenue,
    (SELECT COALESCE(SUM(deductible_amount), 0) FROM expenses
     WHERE EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)) as year_to_date_expenses;
