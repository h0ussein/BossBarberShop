import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Check if registration requires email verification
      if (response.requiresVerification) {
        return { 
          success: true, 
          requiresVerification: true,
          message: response.message,
        };
      }
      
      // If somehow we get a token (shouldn't happen with verification enabled)
      if (response.data?.token) {
        const { user: newUser, token: newToken } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        toast.success('Registration successful!');
      }
      
      return { success: true, requiresVerification: response.requiresVerification };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Check if account requires email verification
      if (response.requiresVerification) {
        toast.error('Please verify your email first');
        return { 
          success: false, 
          requiresVerification: true,
          email: response.email,
        };
      }
      
      const { user: loggedInUser, token: newToken } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(loggedInUser);
      
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      // Check if error is about verification
      if (error.message?.includes('verify')) {
        return { 
          success: false, 
          requiresVerification: true,
          email: credentials.email,
        };
      }
      toast.error(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.user);
      toast.success('Profile updated!');
      return response;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    token,
    setToken,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
