import { useEffect, useState } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense, getCategories, uploadAttachment } from '../services/api';
import { Expense, Category } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [filterCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes] = await Promise.all([
        getExpenses(),
        getCategories(),
      ]);
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const params = filterCategory ? { category_id: filterCategory } : {};
      const res = await getExpenses(params);
      setExpenses(res.data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      category_id: formData.get('category_id'),
      expense_date: formData.get('expense_date'),
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description'),
      supplier: formData.get('supplier'),
      deduction_type: formData.get('deduction_type'),
      deduction_percentage: parseFloat(formData.get('deduction_percentage') as string),
      payment_method: formData.get('payment_method'),
      reference_number: formData.get('reference_number'),
      notes: formData.get('notes'),
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, data);
      } else {
        await createExpense(data);
      }
      setShowModal(false);
      setEditingExpense(null);
      loadExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;

    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleUpload = async (expenseId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', 'EXPENSE');
    formData.append('entity_id', expenseId);

    try {
      await uploadAttachment(formData);
      alert('Justificatif téléchargé avec succès');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erreur lors du téléchargement');
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
          <h1 className="text-3xl font-bold text-gray-900">Dépenses</h1>
          <p className="mt-2 text-sm text-gray-600">Gérez vos dépenses professionnelles</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null);
            setShowModal(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouvelle dépense
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Déductible
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(expense.expense_date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expense.category_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expense.amount.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {expense.deductible_amount.toFixed(2)} € ({expense.deduction_percentage}%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setEditingExpense(expense);
                      setShowModal(true);
                    }}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5 inline" />
                  </button>
                  <label className="text-gray-600 hover:text-gray-900 cursor-pointer">
                    <DocumentArrowUpIcon className="h-5 w-5 inline" />
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUpload(expense.id, e.target.files[0]);
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
                {editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    name="category_id"
                    defaultValue={editingExpense?.category_id}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="expense_date"
                    defaultValue={editingExpense?.expense_date}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    defaultValue={editingExpense?.amount}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingExpense?.description}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                  <input
                    type="text"
                    name="supplier"
                    defaultValue={editingExpense?.supplier}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de déduction</label>
                    <select
                      name="deduction_type"
                      defaultValue={editingExpense?.deduction_type || 'PERSONNEL'}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="PERSONNEL">Personnel</option>
                      <option value="DEBOURS">Débours</option>
                      <option value="NON_DEDUCTIBLE">Non déductible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">% Déductible</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      name="deduction_percentage"
                      defaultValue={editingExpense?.deduction_percentage || 100}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
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
