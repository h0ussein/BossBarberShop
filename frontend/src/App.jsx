import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { BarberAuthProvider, useBarberAuth } from './contexts/BarberAuthContext';

// User Pages
import MainApp from './MainApp';
import Auth from './pages/Auth';
import VerifyEmail from './pages/VerifyEmail';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBarbers from './pages/admin/AdminBarbers';
import AdminBarberSchedule from './pages/admin/AdminBarberSchedule';
import AdminServices from './pages/admin/AdminServices';
import AdminBookings from './pages/admin/AdminBookings';
import AdminHours from './pages/admin/AdminHours';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHomepageSections from './pages/admin/AdminHomepageSections';

// Barber Pages
import BarberLogin from './pages/barber/BarberLogin';
import BarberDashboard from './pages/barber/BarberDashboard';
import BarberSchedule from './pages/barber/BarberSchedule';
import BarberBookings from './pages/barber/BarberBookings';
import BarberProfile from './pages/barber/BarberProfile';

// Protected Route for Users
const ProtectedUserRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
          <p className="mt-4 text-sm text-black/60">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <p className="mt-4 text-sm text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return isAdminAuthenticated ? children : <Navigate to="/adminR" replace />;
};

// Protected Route for Barber
const ProtectedBarberRoute = ({ children }) => {
  const { isBarberAuthenticated, isLoading } = useBarberAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <p className="mt-4 text-sm text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return isBarberAuthenticated ? children : <Navigate to="/barber" replace />;
};

// Admin Routes Wrapper
const AdminRoutes = () => {
  const { isAdminAuthenticated } = useAdminAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAdminAuthenticated ? <Navigate to="/adminR/dashboard" replace /> : <AdminLogin />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/barbers"
        element={
          <ProtectedAdminRoute>
            <AdminBarbers />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/barbers/:id/schedule"
        element={
          <ProtectedAdminRoute>
            <AdminBarberSchedule />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedAdminRoute>
            <AdminServices />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedAdminRoute>
            <AdminBookings />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/hours"
        element={
          <ProtectedAdminRoute>
            <AdminHours />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/homepage-sections"
        element={
          <ProtectedAdminRoute>
            <AdminHomepageSections />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedAdminRoute>
            <AdminSettings />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
};

// Barber Routes Wrapper
const BarberRoutes = () => {
  const { isBarberAuthenticated } = useBarberAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isBarberAuthenticated ? <Navigate to="/barber/dashboard" replace /> : <BarberLogin />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedBarberRoute>
            <BarberDashboard />
          </ProtectedBarberRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedBarberRoute>
            <BarberSchedule />
          </ProtectedBarberRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedBarberRoute>
            <BarberBookings />
          </ProtectedBarberRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedBarberRoute>
            <BarberProfile />
          </ProtectedBarberRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <BarberAuthProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#000',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                },
              }}
            />
            <Routes>
              {/* User Routes */}
              <Route path="/*" element={<MainApp />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Admin Routes */}
              <Route path="/adminR/*" element={<AdminRoutes />} />

              {/* Barber Routes */}
              <Route path="/barber/*" element={<BarberRoutes />} />
            </Routes>
          </BarberAuthProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
