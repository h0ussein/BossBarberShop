import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ImageUpload from '../../components/ImageUpload';
import { barbersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminBarbers = () => {
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [editingBarber, setEditingBarber] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarData, setAvatarData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Barber',
  });

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const res = await barbersAPI.getAll();
      setBarbers(res.data.barbers);
    } catch (error) {
      toast.error('Failed to load barbers');
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
      if (editingBarber) {
        await barbersAPI.update(editingBarber._id, formData);
        // Update avatar if changed
        if (avatarData) {
          await barbersAPI.updateAvatar(editingBarber._id, avatarData);
        }
        toast.success('Barber updated successfully');
        closeModal();
      } else {
        const res = await barbersAPI.create(formData);
        toast.success('Barber added successfully');
        // Show login credentials
        if (res.data.credentials) {
          setCredentials(res.data.credentials);
          setShowModal(false);
          setShowCredentials(true);
        } else {
          closeModal();
        }
      }
      fetchBarbers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (barber = null) => {
    if (barber) {
      setEditingBarber(barber);
      setFormData({
        name: barber.name,
        email: barber.email,
        phone: barber.phone,
        role: barber.role,
      });
    } else {
      setEditingBarber(null);
      setFormData({ name: '', email: '', phone: '', role: 'Barber' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBarber(null);
    setAvatarData(null);
    setFormData({ name: '', email: '', phone: '', role: 'Barber' });
  };

  const toggleActive = async (barber) => {
    try {
      await barbersAPI.update(barber._id, { isActive: !barber.isActive });
      toast.success(barber.isActive ? 'Barber deactivated' : 'Barber activated');
      fetchBarbers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteBarber = async (id) => {
    if (confirm('Are you sure you want to delete this barber?')) {
      try {
        await barbersAPI.delete(id);
        toast.success('Barber deleted');
        fetchBarbers();
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
            <h1 className="text-lg font-semibold text-white sm:text-xl">Barbers</h1>
            <p className="text-xs text-white/50 sm:text-sm">Manage your team members</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Barber
          </button>
        </div>

        {/* Barbers Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <div
              key={barber._id}
              className={`rounded-xl border p-4 transition ${
                barber.isActive
                  ? 'border-white/10 bg-white/5'
                  : 'border-white/5 bg-white/[0.02] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-semibold text-white overflow-hidden">
                    {barber.avatar?.url ? (
                      <img src={barber.avatar.url} alt={barber.name} className="h-full w-full object-cover" />
                    ) : (
                      barber.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{barber.name}</h3>
                    <p className="text-xs text-white/50">{barber.role}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    barber.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {barber.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <p className="flex items-center gap-2 text-white/60 truncate">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="truncate">{barber.email}</span>
                </p>
                <p className="flex items-center gap-2 text-white/60">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {barber.phone}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                <button
                  onClick={() => navigate(`/adminR/barbers/${barber._id}/schedule`)}
                  className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  Schedule
                </button>
                <button
                  onClick={() => openModal(barber)}
                  className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(barber)}
                  className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  {barber.isActive ? 'Off' : 'On'}
                </button>
                <button
                  onClick={() => deleteBarber(barber._id)}
                  className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {barbers.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-sm text-white/50">No barbers found. Add your first barber!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-white">
              {editingBarber ? 'Edit Barber' : 'Add New Barber'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Avatar upload - only show when editing */}
              {editingBarber && (
                <div className="flex flex-col items-center">
                  <label className="mb-2 block text-xs font-medium text-white/60">Profile Photo</label>
                  <ImageUpload
                    currentImage={editingBarber.avatar?.url}
                    onUploadSuccess={(data) => setAvatarData(data)}
                    folder="barbers"
                    size="lg"
                    tokenType="admin"
                  />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={editingBarber}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30 disabled:opacity-50"
                  placeholder="email@example.com"
                />
                {!editingBarber && (
                  <p className="mt-1 text-xs text-white/40">This will be the barber's login email</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                >
                  <option value="Junior Barber" className="bg-zinc-900">Junior Barber</option>
                  <option value="Barber" className="bg-zinc-900">Barber</option>
                  <option value="Senior Barber" className="bg-zinc-900">Senior Barber</option>
                </select>
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
                  {submitting ? 'Saving...' : editingBarber ? 'Update' : 'Add Barber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentials && credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">Barber Account Created!</h2>
              <p className="mt-1 text-sm text-white/50">Share these login credentials with the barber</p>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/50">Login URL</p>
                  <p className="mt-0.5 font-mono text-sm text-white">{window.location.origin}/barber</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Email</p>
                  <p className="mt-0.5 font-mono text-sm text-white">{credentials.email}</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Password</p>
                  <p className="mt-0.5 font-mono text-sm text-white">{credentials.password}</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-yellow-400/80">
              Make sure to save or share this password now. It won't be shown again!
            </p>

            <button
              onClick={() => {
                setShowCredentials(false);
                setCredentials(null);
                setFormData({ name: '', email: '', phone: '', role: 'Barber' });
              }}
              className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBarbers;
