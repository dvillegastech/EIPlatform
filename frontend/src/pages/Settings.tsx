import { useEffect, useState } from 'react';
import { getConfig, updateConfig } from '../services/api';
import { CompanyConfig } from '../types';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const [config, setConfig] = useState<CompanyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await getConfig();
      setConfig(res.data);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      company_name: formData.get('company_name'),
      siret: formData.get('siret'),
      activity_type: formData.get('activity_type'),
      urssaf_rate: parseFloat(formData.get('urssaf_rate') as string),
      abattement_rate: parseFloat(formData.get('abattement_rate') as string),
      versement_liberatoire: formData.get('versement_liberatoire') === 'on',
      versement_liberatoire_rate: formData.get('versement_liberatoire_rate')
        ? parseFloat(formData.get('versement_liberatoire_rate') as string)
        : null,
    };

    try {
      setSaving(true);
      await updateConfig(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      loadConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getDefaultRates = (activityType: string) => {
    const rates: any = {
      BIC_VENTE: { urssaf: 12.3, abattement: 71, versement: 1.0 },
      BIC_SERVICE: { urssaf: 21.2, abattement: 50, versement: 1.7 },
      BNC: { urssaf: 24.6, abattement: 34, versement: 2.2 },
      BNC_CIPAV: { urssaf: 23.2, abattement: 34, versement: 2.2 },
    };
    return rates[activityType] || rates.BNC;
  };

  if (loading || !config) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configurez votre Enterprise Individuelle et les taux de cotisation
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'entreprise</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                <input
                  type="text"
                  name="company_name"
                  defaultValue={config.company_name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SIRET</label>
                <input
                  type="text"
                  name="siret"
                  defaultValue={config.siret}
                  maxLength={14}
                  placeholder="12345678901234"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">14 chiffres sans espaces</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type d'activité</label>
                <select
                  name="activity_type"
                  defaultValue={config.activity_type}
                  required
                  onChange={(e) => {
                    const rates = getDefaultRates(e.target.value);
                    const form = e.target.form;
                    if (form) {
                      (form.elements.namedItem('urssaf_rate') as HTMLInputElement).value = rates.urssaf.toString();
                      (form.elements.namedItem('abattement_rate') as HTMLInputElement).value = rates.abattement.toString();
                      (form.elements.namedItem('versement_liberatoire_rate') as HTMLInputElement).value = rates.versement.toString();
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="BIC_VENTE">Vente de marchandises (BIC)</option>
                  <option value="BIC_SERVICE">Services artisanaux et commerciaux (BIC)</option>
                  <option value="BNC">Professions libérales non réglementées (BNC)</option>
                  <option value="BNC_CIPAV">Professions libérales CIPAV (BNC)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tax Rates */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Taux de cotisation et fiscalité</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Taux URSSAF (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="urssaf_rate"
                  defaultValue={config.urssaf_rate}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Taux de cotisations sociales URSSAF appliqué sur le CA
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Taux d'abattement forfaitaire (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="abattement_rate"
                  defaultValue={config.abattement_rate}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Abattement forfaitaire pour frais professionnels
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="versement_liberatoire"
                    defaultChecked={config.versement_liberatoire}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Versement libératoire de l'impôt sur le revenu
                  </span>
                </label>
                <p className="mt-1 ml-6 text-xs text-gray-500">
                  Option de paiement de l'IR en même temps que les cotisations URSSAF
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Taux versement libératoire (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="versement_liberatoire_rate"
                  defaultValue={config.versement_liberatoire_rate || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Taux 2025 - Information</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Vente de marchandises: URSSAF 12.3%, Abattement 71%</li>
              <li>• Services BIC: URSSAF 21.2%, Abattement 50%</li>
              <li>• BNC non réglementées: URSSAF 24.6%, Abattement 34%</li>
              <li>• BNC CIPAV: URSSAF 23.2%, Abattement 34%</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t">
            {saved && (
              <div className="flex items-center text-green-600">
                <CheckIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Paramètres enregistrés</span>
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Aide et informations</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900">Types d'activité</h4>
            <p className="mt-1">
              Choisissez le type d'activité correspondant à votre entreprise. Cela détermine les taux
              de cotisations URSSAF et d'abattement forfaitaire applicables.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Versement libératoire</h4>
            <p className="mt-1">
              Le versement libératoire permet de payer votre impôt sur le revenu en même temps que vos
              cotisations URSSAF, au lieu du prélèvement à la source. Conditions: RFR 2023 {'<'} 28 797 €
              par part de quotient familial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
