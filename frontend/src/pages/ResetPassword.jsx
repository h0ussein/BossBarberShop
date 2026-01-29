import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setUser, setToken: setAuthToken } = useAuth();

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('/auth');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.resetPassword(token, password);
      
      if (result.success) {
        toast.success('Password reset successfully!');
        
        // Auto-login the user
        localStorage.setItem('token', result.data.token);
        setAuthToken(result.data.token);
        setUser(result.data.user);
        
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black">ABED MERHI</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/50">Barbershop</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-black">Reset Your Password</h2>
          <p className="mt-1 text-sm text-black/60">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                placeholder="••••••••"
                minLength="6"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                placeholder="••••••••"
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="text-xs text-black/50 transition hover:text-black"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;