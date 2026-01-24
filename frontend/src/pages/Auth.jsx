import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationSent, setShowVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login({ email: formData.email, password: formData.password });
        
        // Check if requires verification
        if (result.requiresVerification) {
          setVerificationEmail(result.email || formData.email);
          setShowVerificationSent(true);
          return;
        }
        
        if (result.success) {
          navigate('/');
        }
      } else {
        const result = await register(formData);
        
        if (result.requiresVerification) {
          setVerificationEmail(formData.email);
          setShowVerificationSent(true);
          toast.success('Registration successful! Check your email.');
        } else if (result.success) {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authAPI.resendVerification(verificationEmail);
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  // Show verification pending screen
  if (showVerificationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-black">BOSS</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/50">Barbershop</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-black">Check Your Email</h2>
            <p className="mt-2 text-sm text-black/60">
              We've sent a verification link to
            </p>
            <p className="mt-1 font-medium text-black">{verificationEmail}</p>
            <p className="mt-4 text-sm text-black/60">
              Click the link in the email to verify your account and start booking appointments.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5 disabled:opacity-50"
              >
                {resending ? 'Sending...' : "Didn't receive it? Resend"}
              </button>
              <button
                onClick={() => {
                  setShowVerificationSent(false);
                  setIsLogin(true);
                }}
                className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-black/90"
              >
                Back to Login
              </button>
            </div>
          </div>

          <p className="mt-6 text-xs text-black/50">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black">BOSS</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/50">Barbershop</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-black">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-1 text-sm text-black/60">
            {isLogin
              ? 'Sign in to book your next appointment'
              : 'Join us for a premium grooming experience'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="phone">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                  placeholder="+1 234 567 8900"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-black/60 transition hover:text-black"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-semibold text-black">{isLogin ? 'Sign Up' : 'Sign In'}</span>
            </button>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-black/50 transition hover:text-black"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
