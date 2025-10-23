import { useEffect, useState } from 'react';
import { getDashboardStats, getTrendData } from '../services/api';
import { DashboardStats } from '../types';
import {
  CurrencyEuroIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendRes] = await Promise.all([
        getDashboardStats({ year: selectedYear, month: selectedMonth }),
        getTrendData({ year: selectedYear }),
      ]);

      setStats(statsRes.data);
      setTrendData(
        trendRes.data.map((item: any) => ({
          month: monthNames[item.month - 1],
          revenue: parseFloat(item.revenue),
          expenses: parseFloat(item.expenses),
        }))
      );
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Chiffre d\'affaires',
      value: `${parseFloat(stats.revenue.total).toFixed(2)} €`,
      icon: CurrencyEuroIcon,
      color: 'bg-green-500',
      subtitle: `${stats.revenue.count} facture(s)`,
    },
    {
      name: 'Dépenses',
      value: `${parseFloat(stats.expenses.total).toFixed(2)} €`,
      icon: ShoppingCartIcon,
      color: 'bg-red-500',
      subtitle: `${stats.expenses.deductible} € déductible`,
    },
    {
      name: 'Cotisations URSSAF',
      value: `${stats.taxes.urssaf} €`,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      subtitle: `Taux: ${stats.taxes.urssaf_rate}%`,
    },
    {
      name: 'Factures en retard',
      value: stats.overdue.count,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
      subtitle: `${parseFloat(stats.overdue.amount).toFixed(2)} €`,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vue d'ensemble de votre Enterprise Individuelle
        </p>
      </div>

      {/* Period selector */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {monthNames.map((name, index) => (
            <option key={index} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
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

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                    <dd className="text-xs text-gray-500">{stat.subtitle}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Évolution annuelle</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} €`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenus" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Dépenses" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tax summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Résumé fiscal</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Revenus du mois:</span>
            <span className="font-semibold">{parseFloat(stats.revenue.total).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Abattement forfaitaire:</span>
            <span className="font-semibold">{stats.taxes.abattement} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Revenu imposable:</span>
            <span className="font-semibold">{stats.taxes.taxable_income} €</span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-gray-600 font-medium">Cotisations URSSAF:</span>
            <span className="font-bold text-primary-600">{stats.taxes.urssaf} €</span>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Année en cours</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">CA total:</span>
              <span className="font-semibold text-blue-900">
                {parseFloat(stats.year_to_date.revenue).toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Dépenses totales:</span>
              <span className="font-semibold text-blue-900">
                {parseFloat(stats.year_to_date.expenses).toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
