import { createContext, useContext, useState, useEffect } from 'react';
import { barberAuthAPI } from '../services/api';
import toast from 'react-hot-toast';

const BarberAuthContext = createContext(null);

export const BarberAuthProvider = ({ children }) => {
  const [barber, setBarber] = useState(null);
  const [barberToken, setBarberToken] = useState(localStorage.getItem('barberToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (barberToken) {
      fetchBarberProfile();
    } else {
      setIsLoading(false);
    }
  }, [barberToken]);

  const fetchBarberProfile = async () => {
    try {
      const response = await barberAuthAPI.getProfile();
      setBarber({
        ...response.data.account,
        ...response.data.barber,
      });
    } catch (error) {
      console.error('Failed to fetch barber profile:', error);
      // Token might be invalid, clear it
      localStorage.removeItem('barberToken');
      setBarberToken(null);
      setBarber(null);
    } finally {
      setIsLoading(false);
    }
  };

  const barberLogin = async (email, password) => {
    try {
      const response = await barberAuthAPI.login({ email, password });
      const { token, barber: barberData } = response.data;

      localStorage.setItem('barberToken', token);
      setBarberToken(token);
      setBarber(barberData);

      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const barberLogout = () => {
    localStorage.removeItem('barberToken');
    setBarberToken(null);
    setBarber(null);
    toast.success('Logged out successfully');
  };

  const refreshBarberProfile = async () => {
    if (barberToken) {
      await fetchBarberProfile();
    }
  };

  const value = {
    barber,
    barberToken,
    isBarberAuthenticated: !!barber,
    isLoading,
    barberLogin,
    barberLogout,
    refreshBarberProfile,
  };

  return (
    <BarberAuthContext.Provider value={value}>
      {children}
    </BarberAuthContext.Provider>
  );
};

export const useBarberAuth = () => {
  const context = useContext(BarberAuthContext);
  if (!context) {
    throw new Error('useBarberAuth must be used within a BarberAuthProvider');
  }
  return context;
};
