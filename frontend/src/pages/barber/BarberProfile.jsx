import { useState } from 'react';
import BarberLayout from '../../components/barber/BarberLayout';
import ImageUpload from '../../components/ImageUpload';
import { barberAuthAPI } from '../../services/api';
import { useBarberAuth } from '../../contexts/BarberAuthContext';
import toast from 'react-hot-toast';

const BarberProfile = () => {
  const { barber, refreshBarberProfile } = useBarberAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changing, setChanging] = useState(false);

  const handleAvatarUpload = async (avatarData) => {
    try {
      await barberAuthAPI.updateAvatar(avatarData);
      toast.success('Profile photo updated');
      refreshBarberProfile();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChanging(true);
    try {
      await barberAuthAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChanging(false);
    }
  };

  return (
    <BarberLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-white sm:text-xl">Profile</h1>
          <p className="text-xs text-white/50 sm:text-sm">Your account information</p>
        </div>

        {/* Profile Info */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <ImageUpload
              currentImage={barber?.avatar?.url}
              onUploadSuccess={handleAvatarUpload}
              folder="barbers"
              size="lg"
              tokenType="barber"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold text-white">{barber?.name}</h2>
              <p className="text-sm text-white/50">{barber?.barberRole || barber?.role}</p>
              <p className="mt-1 text-xs text-white/40">Click on photo to change</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs text-white/50">Email</p>
                <p className="mt-0.5 text-sm text-white">{barber?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs text-white/50">Phone</p>
                <p className="mt-0.5 text-sm text-white">{barber?.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Role</p>
                <p className="mt-0.5 text-sm text-white">{barber?.barberRole || 'Barber'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Password</h3>
              <p className="text-xs text-white/50">Change your password</p>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:text-white"
              >
                Change
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium text-white/70 transition hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changing}
                  className="flex-1 rounded-lg bg-white py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {changing ? 'Changing...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </BarberLayout>
  );
};

export default BarberProfile;
