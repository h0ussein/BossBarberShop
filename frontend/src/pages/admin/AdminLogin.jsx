import { useState } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    passcode: '',
  });

  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminLogin(formData);
      navigate('/adminR/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">ABED MERHI</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
          <h2 className="text-lg font-semibold text-white">Admin Access</h2>
          <p className="mt-1 text-sm text-white/60">
            Enter the admin passcode to access the dashboard
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-white/60" htmlFor="passcode">
                Admin Passcode
              </label>
              <input
                id="passcode"
                name="passcode"
                type="password"
                required
                value={formData.passcode}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/30 text-center tracking-wider"
                placeholder="••••••"
                minLength="4"
                maxLength="8"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-full bg-white py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Accessing...' : 'Access Admin'}
            </button>
          </form>
        </div>

        {/* Security note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            Secure admin access only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
