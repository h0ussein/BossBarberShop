import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { servicesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await servicesAPI.getAll();
      setServices(res.data.services);
    } catch (error) {
      toast.error('Failed to load services');
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

    const serviceData = {
      ...formData,
      price: Number(formData.price),
      duration: Number(formData.duration),
    };

    try {
      if (editingService) {
        await servicesAPI.update(editingService._id, serviceData);
        toast.success('Service updated successfully');
      } else {
        await servicesAPI.create(serviceData);
        toast.success('Service added successfully');
      }
      fetchServices();
      closeModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price.toString(),
        duration: service.duration.toString(),
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', price: '', duration: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration: '' });
  };

  const toggleActive = async (service) => {
    try {
      await servicesAPI.update(service._id, { isActive: !service.isActive });
      toast.success(service.isActive ? 'Service disabled' : 'Service enabled');
      fetchServices();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteService = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.delete(id);
        toast.success('Service deleted');
        fetchServices();
      } catch (error) {
        toast.error(error.message);
      }
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
            <h1 className="text-lg font-semibold text-white sm:text-xl">Services</h1>
            <p className="text-xs text-white/50 sm:text-sm">Manage your service offerings</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Service
          </button>
        </div>

        {/* Services - Card view on mobile */}
        <div className="space-y-3 lg:hidden">
          {services.map((service) => (
            <div
              key={service._id}
              className={`rounded-xl border p-4 ${
                service.isActive
                  ? 'border-white/10 bg-white/5'
                  : 'border-white/5 bg-white/[0.02] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{service.name}</p>
                  <p className="mt-0.5 text-xs text-white/50 line-clamp-2">{service.description}</p>
                </div>
                <span
                  className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    service.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <div>
                  <p className="text-[10px] text-white/50">Duration</p>
                  <p className="text-white">{service.duration} min</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50">Price</p>
                  <p className="font-semibold text-white">${service.price}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
                <button
                  onClick={() => openModal(service)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-medium text-white/70"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(service)}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-xs font-medium text-white/70"
                >
                  {service.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => deleteService(service._id)}
                  className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
              No services found. Add your first service!
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/50">
                  <th className="px-5 py-4 font-medium">Service</th>
                  <th className="px-5 py-4 font-medium">Duration</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {services.map((service) => (
                  <tr
                    key={service._id}
                    className={`border-b border-white/5 ${!service.isActive && 'opacity-50'}`}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-white">{service.name}</p>
                        <p className="text-xs text-white/50">{service.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/70">{service.duration} min</td>
                    <td className="px-5 py-4 font-medium text-white">${service.price}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          service.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(service)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(service)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
                        >
                          {service.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => deleteService(service._id)}
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
          {services.length === 0 && (
            <div className="p-8 text-center text-sm text-white/50">
              No services found. Add your first service!
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-white">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="e.g. Classic Haircut"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30 resize-none"
                  placeholder="Brief description of the service"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Duration (min)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="5"
                    step="5"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                    placeholder="30"
                  />
                </div>
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
                  {submitting ? 'Saving...' : editingService ? 'Update' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServices;
