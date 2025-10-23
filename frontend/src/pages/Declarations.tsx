import { useEffect, useState } from 'react';
import { getDeclarations, calculateTaxes } from '../services/api';
import { Declaration } from '../types';
import { PlusIcon, CalculatorIcon } from '@heroicons/react/24/outline';

export default function Declarations() {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculation, setCalculation] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadDeclarations();
  }, []);

  const loadDeclarations = async () => {
    try {
      setLoading(true);
      const res = await getDeclarations();
      setDeclarations(res.data);
    } catch (error) {
      console.error('Error loading declarations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      const res = await calculateTaxes({
        year: selectedYear,
        month: selectedMonth,
      });
      setCalculation(res.data);
      setShowCalculator(true);
    } catch (error) {
      console.error('Error calculating taxes:', error);
      alert('Erreur lors du calcul');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Déclarations</h1>
          <p className="mt-2 text-sm text-gray-600">Gérez vos déclarations URSSAF et fiscales</p>
        </div>
      </div>

      {/* Calculator Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Calculer les cotisations</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCalculate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <CalculatorIcon className="h-5 w-5 mr-2" />
            Calculer
          </button>
        </div>
      </div>

      {/* Calculation Results */}
      {showCalculator && calculation && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Résultats du calcul - {selectedMonth}/{selectedYear}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Revenus et dépenses</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Chiffre d'affaires:</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {parseFloat(calculation.calculation.revenue).toFixed(2)} €
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Dépenses totales:</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {parseFloat(calculation.calculation.expenses).toFixed(2)} €
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Dépenses déductibles:</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {parseFloat(calculation.calculation.deductibleExpenses).toFixed(2)} €
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Cotisations et impôts</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Abattement forfaitaire:</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {parseFloat(calculation.calculation.abattementAmount).toFixed(2)} €
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Revenu imposable:</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {parseFloat(calculation.calculation.taxableIncome).toFixed(2)} €
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-sm font-medium text-gray-900">Cotisations URSSAF:</dt>
                  <dd className="text-lg font-bold text-primary-600">
                    {parseFloat(calculation.calculation.urssafAmount).toFixed(2)} €
                  </dd>
                </div>
                {calculation.calculation.irAmount && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-900">Impôt sur le revenu:</dt>
                    <dd className="text-lg font-bold text-primary-600">
                      {parseFloat(calculation.calculation.irAmount).toFixed(2)} €
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-sm font-medium text-gray-900">Revenu net:</dt>
                  <dd className="text-lg font-bold text-green-600">
                    {parseFloat(calculation.calculation.netIncome).toFixed(2)} €
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Montant à déclarer à l'URSSAF:</strong>{' '}
              {parseFloat(calculation.calculation.urssafAmount).toFixed(2)} €
              <br />
              <em className="text-xs">Taux appliqué: {calculation.calculation.urssafRate}%</em>
            </p>
          </div>
        </div>
      )}

      {/* Declarations History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Historique des déclarations</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Période
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URSSAF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenu imposable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {declarations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune déclaration enregistrée
                </td>
              </tr>
            ) : (
              declarations.map((decl) => (
                <tr key={decl.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {decl.period_type === 'MONTHLY' ? `${decl.month}/${decl.year}` : `T${decl.quarter} ${decl.year}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {decl.total_revenue.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {decl.urssaf_amount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {decl.taxable_income.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      decl.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      decl.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {decl.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
