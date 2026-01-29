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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeData, setPasscodeData] = useState({ currentPasscode: '', newPasscode: '', confirmPasscode: '' });
  const [updatingPasscode, setUpdatingPasscode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const settingsRes = await settingsAPI.get();
      
      const settings = settingsRes.data.settings;
      setShopInfo({
        shopName: settings.shopName || '',
        tagline: settings.tagline || '',
        phone: settings.phone || '',
        email: settings.email || '',
        address: settings.address || '',
        instagram: settings.instagram || '',
      });
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

  const handlePasscodeChange = (e) => {
    const { name, value } = e.target;
    setPasscodeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePasscode = async (e) => {
    e.preventDefault();
    
    if (passcodeData.newPasscode !== passcodeData.confirmPasscode) {
      toast.error('New passcode and confirmation do not match');
      return;
    }
    
    if (passcodeData.newPasscode.length < 4) {
      toast.error('New passcode must be at least 4 characters');
      return;
    }
    
    setUpdatingPasscode(true);
    try {
      await adminAPI.updatePasscode({
        currentPasscode: passcodeData.currentPasscode,
        newPasscode: passcodeData.newPasscode,
      });
      toast.success('Admin passcode updated successfully');
      setPasscodeData({ currentPasscode: '', newPasscode: '', confirmPasscode: '' });
      setShowPasscodeModal(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdatingPasscode(false);
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

        {/* Admin Security */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Admin Security</h3>
              <p className="text-xs text-white/50">Manage admin passcode for secure access</p>
            </div>
            <button
              onClick={() => setShowPasscodeModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Change Passcode
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin Access Protected</p>
                <p className="text-xs text-white/50">Current passcode: ••••••</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-white">Change Admin Passcode</h2>
            <p className="mt-1 text-xs text-white/50">Update the admin passcode for secure access</p>
            <form onSubmit={handleUpdatePasscode} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Current Passcode</label>
                <input
                  type="password"
                  name="currentPasscode"
                  value={passcodeData.currentPasscode}
                  onChange={handlePasscodeChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30 text-center tracking-wider"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">New Passcode</label>
                <input
                  type="password"
                  name="newPasscode"
                  value={passcodeData.newPasscode}
                  onChange={handlePasscodeChange}
                  required
                  minLength={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30 text-center tracking-wider"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">Confirm New Passcode</label>
                <input
                  type="password"
                  name="confirmPasscode"
                  value={passcodeData.confirmPasscode}
                  onChange={handlePasscodeChange}
                  required
                  minLength={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/30 text-center tracking-wider"
                  placeholder="••••••"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasscodeModal(false);
                    setPasscodeData({ currentPasscode: '', newPasscode: '', confirmPasscode: '' });
                  }}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPasscode}
                  className="flex-1 rounded-xl bg-white py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {updatingPasscode ? 'Updating...' : 'Update Passcode'}
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
