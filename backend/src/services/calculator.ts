/**
 * Service de calcul pour les cotisations URSSAF et l'impôt sur le revenu
 * Basé sur les taux 2025 pour Enterprise Individuelle en France
 */

export interface CompanyConfig {
  activity_type: 'BIC_VENTE' | 'BIC_SERVICE' | 'BNC' | 'BNC_CIPAV';
  urssaf_rate: number;
  abattement_rate: number;
  versement_liberatoire: boolean;
  versement_liberatoire_rate?: number;
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

/**
 * Taux URSSAF 2025 par type d'activité
 */
export const URSSAF_RATES = {
  BIC_VENTE: 12.3,        // Vente de marchandises
  BIC_SERVICE: 21.2,      // Services artisanaux et commerciaux
  BNC: 24.6,              // Professions libérales non réglementées
  BNC_CIPAV: 23.2,        // Professions libérales CIPAV
};

/**
 * Taux d'abattement forfaitaire par type d'activité
 */
export const ABATTEMENT_RATES = {
  BIC_VENTE: 71,          // 71% pour vente
  BIC_SERVICE: 50,        // 50% pour services BIC
  BNC: 34,                // 34% pour BNC
  BNC_CIPAV: 34,          // 34% pour BNC CIPAV
};

/**
 * Taux de versement libératoire 2025
 */
export const VERSEMENT_LIBERATOIRE_RATES = {
  BIC_VENTE: 1.0,
  BIC_SERVICE: 1.7,
  BNC: 2.2,
  BNC_CIPAV: 2.2,
};

/**
 * Barème de l'impôt sur le revenu 2025
 */
export const IR_BRACKETS = [
  { limit: 11497, rate: 0 },
  { limit: 29315, rate: 11 },
  { limit: 83823, rate: 30 },
  { limit: 180294, rate: 41 },
  { limit: Infinity, rate: 45 },
];

/**
 * Calcule les cotisations URSSAF
 */
export function calculateUrssaf(revenue: number, urssafRate: number): number {
  return revenue * (urssafRate / 100);
}

/**
 * Calcule l'abattement forfaitaire
 */
export function calculateAbattement(revenue: number, abattementRate: number): number {
  const minAbattement = 305; // Minimum légal
  const abattement = revenue * (abattementRate / 100);
  return Math.max(abattement, minAbattement);
}

/**
 * Calcule le revenu imposable après abattement
 */
export function calculateTaxableIncome(revenue: number, abattementRate: number): number {
  const abattement = calculateAbattement(revenue, abattementRate);
  return Math.max(revenue - abattement, 0);
}

/**
 * Calcule l'impôt sur le revenu selon le barème progressif
 * Note: Ce calcul est simplifié et ne tient pas compte du quotient familial
 */
export function calculateIR(taxableIncome: number): number {
  let tax = 0;
  let previousLimit = 0;

  for (const bracket of IR_BRACKETS) {
    if (taxableIncome <= previousLimit) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.limit) - previousLimit;
    tax += taxableInBracket * (bracket.rate / 100);
    previousLimit = bracket.limit;

    if (taxableIncome <= bracket.limit) break;
  }

  return tax;
}

/**
 * Calcule le versement libératoire
 */
export function calculateVersementLiberatoire(
  revenue: number,
  rate: number
): number {
  return revenue * (rate / 100);
}

/**
 * Calcul complet pour une période donnée
 */
export function calculateTaxes(
  revenue: number,
  expenses: number,
  deductibleExpenses: number,
  config: CompanyConfig
): TaxCalculation {
  // 1. Calcul URSSAF sur le chiffre d'affaires
  const urssafAmount = calculateUrssaf(revenue, config.urssaf_rate);

  // 2. Calcul de l'abattement
  const abattementAmount = calculateAbattement(revenue, config.abattement_rate);

  // 3. Calcul du revenu imposable
  const taxableIncome = calculateTaxableIncome(revenue, config.abattement_rate);

  // 4. Calcul de l'IR
  let irAmount: number | undefined;
  if (config.versement_liberatoire && config.versement_liberatoire_rate) {
    // Versement libératoire
    irAmount = calculateVersementLiberatoire(revenue, config.versement_liberatoire_rate);
  } else {
    // Barème progressif (simplifié, sans tenir compte des autres revenus du foyer)
    irAmount = calculateIR(taxableIncome);
  }

  // 5. Calcul du revenu net
  const netIncome = revenue - urssafAmount - (irAmount || 0) - expenses;

  return {
    revenue,
    expenses,
    deductibleExpenses,
    urssafAmount,
    urssafRate: config.urssaf_rate,
    abattementAmount,
    taxableIncome,
    irAmount,
    netIncome,
  };
}

/**
 * Calcule les statistiques pour un tableau de bord
 */
export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  totalUrssaf: number;
  totalIR: number;
  netIncome: number;
  averageMonthlyRevenue: number;
  averageMonthlyExpenses: number;
}

export function calculateDashboardStats(
  revenues: number[],
  expenses: number[],
  config: CompanyConfig
): DashboardStats {
  const totalRevenue = revenues.reduce((sum, r) => sum + r, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e, 0);

  const calculation = calculateTaxes(totalRevenue, totalExpenses, totalExpenses, config);

  return {
    totalRevenue,
    totalExpenses,
    totalUrssaf: calculation.urssafAmount,
    totalIR: calculation.irAmount || 0,
    netIncome: calculation.netIncome,
    averageMonthlyRevenue: revenues.length > 0 ? totalRevenue / revenues.length : 0,
    averageMonthlyExpenses: expenses.length > 0 ? totalExpenses / expenses.length : 0,
  };
}
