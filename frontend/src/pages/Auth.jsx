import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import SideDrawer from '../components/SideDrawer';

const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    id: 'booking',
    label: 'Book',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: 'offers',
    label: 'Offers',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationSent, setShowVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tabId) => {
    if (tabId === 'profile') {
      // Already on auth page
      return;
    }
    // Navigate to main app with the selected tab using hash
    // Use replace: false to allow browser back button to work
    navigate(`/#${tabId}`);
  };

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
      <div className="min-h-screen bg-white text-black">
        <TopBar
          onMenuClick={() => setDrawerOpen(true)}
          onQuickBook={() => navigate('/')}
          navItems={navItems}
          activeTab="profile"
          onTabChange={handleTabChange}
        />
        <SideDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          items={navItems}
          onNavigate={handleTabChange}
        />
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 pb-28 lg:pb-8">
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
        <BottomNav items={navItems} activeTab="profile" onChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <TopBar
        onMenuClick={() => setDrawerOpen(true)}
        onQuickBook={() => navigate('/')}
        navItems={navItems}
        activeTab="profile"
        onTabChange={handleTabChange}
      />
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={navItems}
        onNavigate={handleTabChange}
      />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 pb-28 lg:pb-8">
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
        <BottomNav items={navItems} activeTab="profile" onChange={handleTabChange} />
      </div>
    </div>
  );
};

export default Auth;
