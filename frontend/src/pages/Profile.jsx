import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState({
    upcomingAppointments: [],
    pastAppointments: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch appointments when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAppointments();
    }
  }, [isAuthenticated, user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Check if user has email
      if (!user?.email) {
        setAppointments({
          upcomingAppointments: [],
          pastAppointments: [],
        });
        return;
      }

      const response = await authAPI.getAppointments();
      setAppointments({
        upcomingAppointments: response.data.upcomingAppointments || [],
        pastAppointments: response.data.pastAppointments || [],
      });
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      if (error.message.includes('email not found')) {
        toast.error('Please add an email to your profile to view appointments');
      } else {
        toast.error('Failed to load appointments');
      }
      setAppointments({
        upcomingAppointments: [],
        pastAppointments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-6 text-center md:p-8">
        <h2 className="text-lg font-semibold text-black">Please Sign In</h2>
        <p className="mt-2 text-sm text-black/60">
          Sign in to view your profile and appointments
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="mt-4 rounded-full bg-black px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <section className="rounded-3xl border border-black/10 bg-black p-6 text-white md:p-8">
        <h2 className="text-[10px] uppercase tracking-[0.35em] text-white/60">My Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-semibold text-black">
            {getInitials(user?.name)}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-white/60">{user?.email}</p>
            {user?.phone && <p className="text-sm text-white/50">{user?.phone}</p>}
          </div>
        </div>
      </section>

      {/* Upcoming Appointments */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Upcoming Appointments</h3>
          {!loading && (
            <button
              onClick={fetchAppointments}
              className="text-xs font-medium text-black/50 hover:text-black transition"
              title="Refresh appointments"
            >
              ↻ Refresh
            </button>
          )}
        </div>
        {loading ? (
          <div className="mt-4 flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            <span className="ml-2 text-sm text-black/60">Loading appointments...</span>
          </div>
        ) : !user?.email ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-black/50">Please add an email address to view your appointments.</p>
            <p className="mt-1 text-xs text-black/60">
              Appointments made without an email cannot be displayed here.
            </p>
          </div>
        ) : appointments.upcomingAppointments.length === 0 ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-black/50">No upcoming appointments.</p>
            <button
              onClick={() => navigate('/#booking')}
              className="mt-2 text-sm font-medium text-black hover:underline"
            >
              Book your first appointment →
            </button>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {appointments.upcomingAppointments.map((apt) => (
              <li
                key={apt._id}
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black">{apt.service?.name || 'Service'}</p>
                    <p className="text-xs text-black/50">with {apt.barber?.name || 'Barber'}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      apt.status === 'confirmed'
                        ? 'bg-black text-white'
                        : apt.status === 'pending'
                        ? 'border border-amber-300 bg-amber-50 text-amber-700'
                        : 'border border-black/20 text-black/60'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-black/60">
                  <span>{formatDate(apt.date)}</span>
                  <span>•</span>
                  <span>{apt.time}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Past Appointments */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Past Appointments</h3>
        {loading ? (
          <div className="mt-4 flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            <span className="ml-2 text-sm text-black/60">Loading appointments...</span>
          </div>
        ) : !user?.email ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-black/50">Please add an email address to view your appointment history.</p>
          </div>
        ) : appointments.pastAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-black/50">No past appointments.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {appointments.pastAppointments.map((apt) => (
              <li
                key={apt._id}
                className="rounded-2xl border border-black/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black/80">{apt.service?.name || 'Service'}</p>
                    <p className="text-xs text-black/50">with {apt.barber?.name || 'Barber'}</p>
                  </div>
                  <span
                    className={`text-xs ${
                      apt.status === 'completed'
                        ? 'text-green-600'
                        : apt.status === 'cancelled' 
                        ? 'text-red-500'
                        : 'text-black/60'
                    } capitalize`}
                  >
                    {apt.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-black/50">
                  <span>{formatDate(apt.date)}</span>
                  <span>•</span>
                  <span>{apt.time}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sign Out */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-full border border-black/20 py-3 text-sm font-semibold uppercase tracking-wide text-black/60 transition hover:border-black/40 hover:bg-black/5 hover:text-black"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
