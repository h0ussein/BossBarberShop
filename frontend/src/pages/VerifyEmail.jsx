import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authAPI.verifyEmail(token);
      
      if (response.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Auto-login user
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          setToken(response.data.token);
          setUser(response.data.user);
        }
        
        toast.success('Email verified successfully!');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Verification failed. The link may be invalid or expired.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-black">ABED MERHI</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/50">
            BARBERSHOP
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-black/10 border-t-black"></div>
              <h2 className="text-xl font-semibold text-black">Verifying your email...</h2>
              <p className="mt-2 text-sm text-black/60">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-black">Email Verified!</h2>
              <p className="mt-2 text-sm text-black/60">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-black/90"
              >
                Continue to Homepage
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-black">Verification Failed</h2>
              <p className="mt-2 text-sm text-black/60">{message}</p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-black/90"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full rounded-xl border border-black/10 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5"
                >
                  Go to Homepage
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
