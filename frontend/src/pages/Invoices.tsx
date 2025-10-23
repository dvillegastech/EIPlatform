import { useEffect, useState } from 'react';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, uploadAttachment, getAttachments } from '../services/api';
import { Invoice } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    loadInvoices();
  }, [filterStatus]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { status: filterStatus } : {};
      const res = await getInvoices(params);
      setInvoices(res.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      invoice_number: formData.get('invoice_number'),
      client_name: formData.get('client_name'),
      invoice_date: formData.get('invoice_date'),
      due_date: formData.get('due_date'),
      amount_ht: parseFloat(formData.get('amount_ht') as string),
      amount_ttc: parseFloat(formData.get('amount_ttc') as string),
      tva_amount: parseFloat(formData.get('tva_amount') as string) || 0,
      tva_rate: parseFloat(formData.get('tva_rate') as string) || 0,
      description: formData.get('description'),
      payment_method: formData.get('payment_method'),
    };

    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, data);
      } else {
        await createInvoice(data);
      }
      setShowModal(false);
      setEditingInvoice(null);
      loadInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Erreur lors de la sauvegarde de la facture');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

    try {
      await deleteInvoice(id);
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleUpload = async (invoiceId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', 'INVOICE');
    formData.append('entity_id', invoiceId);

    try {
      await uploadAttachment(formData);
      alert('Fichier téléchargé avec succès');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
          <p className="mt-2 text-sm text-gray-600">Gérez vos factures clients</p>
        </div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle facture
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="PAID">Payée</option>
          <option value="OVERDUE">En retard</option>
          <option value="CANCELLED">Annulée</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Facture
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant TTC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {invoice.invoice_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {invoice.client_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.amount_ttc.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setEditingInvoice(invoice);
                      setShowModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5 inline" />
                  </button>
                  <label className="text-gray-600 hover:text-gray-900 cursor-pointer">
                    <DocumentArrowUpIcon className="h-5 w-5 inline" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUpload(invoice.id, e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />

            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">N° Facture</label>
                  <input
                    type="text"
                    name="invoice_number"
                    defaultValue={editingInvoice?.invoice_number}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Client</label>
                  <input
                    type="text"
                    name="client_name"
                    defaultValue={editingInvoice?.client_name}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date facture</label>
                    <input
                      type="date"
                      name="invoice_date"
                      defaultValue={editingInvoice?.invoice_date}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date échéance</label>
                    <input
                      type="date"
                      name="due_date"
                      defaultValue={editingInvoice?.due_date}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Montant HT</label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount_ht"
                      defaultValue={editingInvoice?.amount_ht}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Montant TTC</label>
                    <input
                      type="number"
                      step="0.01"
                      name="amount_ttc"
                      defaultValue={editingInvoice?.amount_ttc}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingInvoice?.description}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
