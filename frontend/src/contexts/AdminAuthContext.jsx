import { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(true);

  const isAdminAuthenticated = !!adminToken && !!admin;

  // Load admin on mount if token exists
  useEffect(() => {
    const loadAdmin = async () => {
      if (adminToken) {
        try {
          // Temporarily set token for API call
          localStorage.setItem('token', adminToken);
          const response = await adminAPI.getProfile();
          localStorage.removeItem('token');
          setAdmin(response.data.admin);
        } catch (error) {
          console.error('Failed to load admin:', error);
          adminLogout();
        }
      }
      setIsLoading(false);
    };

    loadAdmin();
  }, []);

  const adminLogin = async (credentials) => {
    try {
      const response = await adminAPI.login(credentials);
      const { admin: loggedInAdmin, token: newToken } = response.data;
      
      localStorage.setItem('adminToken', newToken);
      setAdminToken(newToken);
      setAdmin(loggedInAdmin);
      
      toast.success('Welcome, Admin!');
      return response;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setAdmin(null);
    toast.success('Logged out successfully');
  };

  const value = {
    admin,
    adminToken,
    isAdminAuthenticated,
    isLoading,
    adminLogin,
    adminLogout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
