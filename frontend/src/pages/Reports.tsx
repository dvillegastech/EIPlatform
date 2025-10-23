import { useEffect, useState } from 'react';
import { generateReport, getReports } from '../services/api';
import { DocumentChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Report {
  id: string;
  report_type: string;
  report_name: string;
  start_date: string;
  end_date: string;
  file_path: string;
  generated_at: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportName, setReportName] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await getReports();
      setReports(res.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate || !reportName) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      setGenerating(true);
      const res = await generateReport({
        report_type: reportType,
        report_name: reportName,
        start_date: startDate,
        end_date: endDate,
      });

      alert('Rapport généré avec succès!');

      // Download the report
      if (res.data.download_url) {
        window.open(res.data.download_url, '_blank');
      }

      // Reload reports list
      loadReports();

      // Reset form
      setReportName('');
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
        <p className="mt-2 text-sm text-gray-600">Générez des rapports PDF pour vos déclarations</p>
      </div>

      {/* Generate Report Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DocumentChartBarIcon className="h-5 w-5 mr-2" />
          Générer un nouveau rapport
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="MONTHLY">Mensuel</option>
                <option value="QUARTERLY">Trimestriel</option>
                <option value="ANNUAL">Annuel</option>
                <option value="CUSTOM">Personnalisé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du rapport</label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Ex: Rapport mensuel Janvier 2025"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"
          >
            {generating ? 'Génération en cours...' : 'Générer le rapport PDF'}
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Rapports générés</h2>
        </div>

        {reports.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rapport</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par générer votre premier rapport.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom du rapport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Généré le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.report_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.report_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(report.start_date), 'dd/MM/yyyy')} -{' '}
                    {format(new Date(report.end_date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(report.generated_at), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/uploads/${report.file_path.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
                      Télécharger
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
