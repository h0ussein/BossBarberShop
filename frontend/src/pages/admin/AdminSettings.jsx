import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { settingsAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [shopInfo, setShopInfo] = useState({
    shopName: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    instagram: '',
  });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [addingAdmin, setAddingAdmin] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, adminsRes] = await Promise.all([
        settingsAPI.get(),
        adminAPI.getAllAdmins().catch(() => ({ data: { admins: [] } })),
      ]);
      
      const settings = settingsRes.data.settings;
      setShopInfo({
        shopName: settings.shopName || '',
        tagline: settings.tagline || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        instagram: settings.instagram || '',
      });
      
      setAdmins(adminsRes.data.admins || []);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleShopInfoChange = (e) => {
    const { name, value } = e.target;
    setShopInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveShopInfo = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(shopInfo);
      toast.success('Shop information saved');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddingAdmin(true);
    try {
      await adminAPI.createAdmin(newAdmin);
      toast.success('Admin added successfully');
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      setShowAddAdmin(false);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  const deleteAdmin = async (id) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      try {
        await adminAPI.deleteAdmin(id);
        toast.success('Admin removed');
        fetchData();
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
        <div>
          <h1 className="text-lg font-semibold text-white sm:text-xl">Settings</h1>
          <p className="text-xs text-white/50 sm:text-sm">Manage your shop and admin settings</p>
        </div>

        {/* Shop Information */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Shop Information</h3>
              <p className="text-xs text-white/50">Basic details about your barbershop</p>
            </div>
            <button
              onClick={handleSaveShopInfo}
              disabled={saving}
              className="rounded-lg bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Shop Name</label>
              <input
                type="text"
                name="shopName"
                value={shopInfo.shopName}
                onChange={handleShopInfoChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={shopInfo.tagline}
                onChange={handleShopInfoChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Phone</label>
              <input
                type="tel"
                name="phone"
                value={shopInfo.phone}
                onChange={handleShopInfoChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Email</label>
              <input
                type="email"
                name="email"
                value={shopInfo.email}
                onChange={handleShopInfoChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-white/60">Address</label>
              <input
                type="text"
                name="address"
                value={shopInfo.address}
                onChange={handleShopInfoChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Instagram</label>
              <input
                type="text"
                name="instagram"
                value={shopInfo.instagram}
                onChange={handleShopInfoChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
          </div>
        </div>

        {/* Admin Management */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Admin Users</h3>
              <p className="text-xs text-white/50">Manage who can access the admin panel</p>
            </div>
            <button
              onClick={() => setShowAddAdmin(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Admin
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {admins.map((admin) => (
              <div
                key={admin._id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                    {admin.name?.charAt(0) || 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{admin.name}</p>
                    <p className="text-xs text-white/50 truncate">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span
                    className={`hidden sm:inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      admin.role === 'super_admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : admin.role === 'admin'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {admin.role?.replace('_', ' ')}
                  </span>
                  {admin.role !== 'super_admin' && (
                    <button
                      onClick={() => deleteAdmin(admin._id)}
                      className="shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-center text-xs text-white/50 py-4">No admins found</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-white">Add New Admin</h2>
            <form onSubmit={handleAddAdmin} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30"
                >
                  <option value="admin" className="bg-zinc-900">Admin</option>
                  <option value="barber" className="bg-zinc-900">Barber</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdmin(false)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingAdmin}
                  className="flex-1 rounded-xl bg-white py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {addingAdmin ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
