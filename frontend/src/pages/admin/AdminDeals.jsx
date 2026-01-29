import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { dealsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    validUntil: '',
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await dealsAPI.getAll();
      setDeals(res.data.deals);
    } catch (error) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingDeal) {
        await dealsAPI.update(editingDeal._id, formData);
        toast.success('Deal updated successfully');
      } else {
        await dealsAPI.create(formData);
        toast.success('Deal added successfully');
      }
      fetchDeals();
      closeModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (deal = null) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        title: deal.title,
        description: deal.description,
        code: deal.code,
        validUntil: deal.validUntil,
      });
    } else {
      setEditingDeal(null);
      setFormData({ title: '', description: '', code: '', validUntil: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDeal(null);
    setFormData({ title: '', description: '', code: '', validUntil: '' });
  };

  const deleteDeal = async (id) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await dealsAPI.delete(id);
      toast.success('Deal deleted');
      fetchDeals();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">Deals & Promotions</h1>
            <p className="text-xs text-white/50 sm:text-sm">Manage offers shown on the Deals page</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Deal
          </button>
        </div>

        {/* Deals - Card view on mobile */}
        <div className="space-y-3 lg:hidden">
          {deals.map((deal) => (
            <div
              key={deal._id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="font-medium text-white truncate">{deal.title}</p>
              <p className="mt-0.5 text-xs text-white/50 line-clamp-2">{deal.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-lg border border-dashed border-white/20 bg-white/5 px-2.5 py-1 text-xs font-mono font-semibold tracking-wider text-white">
                  {deal.code}
                </span>
                <span className="text-[10px] text-white/50">Valid until {deal.validUntil}</span>
              </div>
              <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
                <button
                  onClick={() => openModal(deal)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-medium text-white/70"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteDeal(deal._id)}
                  className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {deals.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
              No deals yet. Add your first deal!
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/50">
                  <th className="px-5 py-4 font-medium">Title</th>
                  <th className="px-5 py-4 font-medium">Description</th>
                  <th className="px-5 py-4 font-medium">Promo Code</th>
                  <th className="px-5 py-4 font-medium">Valid Until</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {deals.map((deal) => (
                  <tr key={deal._id} className="border-b border-white/5">
                    <td className="px-5 py-4 font-medium text-white">{deal.title}</td>
                    <td className="px-5 py-4 text-white/70 max-w-xs truncate">{deal.description}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg border border-dashed border-white/20 bg-white/5 px-2 py-1 font-mono text-xs font-semibold tracking-wider text-white">
                        {deal.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/70">{deal.validUntil}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(deal)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDeal(deal._id)}
                          className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {deals.length === 0 && (
            <div className="p-8 text-center text-sm text-white/50">
              No deals yet. Add your first deal!
            </div>
          )}
        </div>
      </div>

      {/* Modal - Add / Edit Deal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-white">
              {editingDeal ? 'Edit Deal' : 'Add New Deal'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="e.g. First Visit Discount"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30 resize-none"
                  placeholder="Brief description of the offer"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Promo Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white font-mono uppercase outline-none transition focus:border-white/30"
                  placeholder="e.g. WELCOME20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Valid Until</label>
                <input
                  type="text"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="e.g. Mar 31, 2026 or Ongoing"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-white py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingDeal ? 'Update' : 'Add Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDeals;
