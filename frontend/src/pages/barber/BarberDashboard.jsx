import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BarberLayout from '../../components/barber/BarberLayout';
import NotificationPermission from '../../components/NotificationPermission';
import { barberAuthAPI } from '../../services/api';
import { useBarberAuth } from '../../contexts/BarberAuthContext';

const BarberDashboard = () => {
  const navigate = useNavigate();
  const { barber } = useBarberAuth();
  const [bookings, setBookings] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [allRes, todayRes] = await Promise.all([
        barberAuthAPI.getBookings(),
        barberAuthAPI.getBookings({ date: today }),
      ]);
      setBookings(allRes.data.bookings);
      setTodayBookings(todayRes.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    today: todayBookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <BarberLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      </BarberLayout>
    );
  }

  return (
    <BarberLayout>
      <div className="space-y-4">
        {/* Welcome */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h1 className="text-lg font-semibold text-white">
            Welcome back, {barber?.name}!
          </h1>
          <p className="text-sm text-white/50">Here's your overview for today</p>
        </div>

        {/* Notification Permission */}
        <NotificationPermission />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-white/50">Today</p>
            <p className="mt-1 text-xl sm:text-2xl font-semibold text-white">{stats.today}</p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-white/60">appointments</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-white/50">Pending</p>
            <p className="mt-1 text-xl sm:text-2xl font-semibold text-yellow-400">{stats.pending}</p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-white/60">to confirm</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-white/50">Confirmed</p>
            <p className="mt-1 text-xl sm:text-2xl font-semibold text-green-400">{stats.confirmed}</p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-white/60">upcoming</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-white/50">Completed</p>
            <p className="mt-1 text-xl sm:text-2xl font-semibold text-blue-400">{stats.completed}</p>
            <p className="mt-0.5 text-[9px] sm:text-[10px] text-white/60">all time</p>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Today's Appointments</h3>
            <button
              onClick={() => navigate('/barber/bookings')}
              className="text-xs text-white/50 hover:text-white"
            >
              View All
            </button>
          </div>

          {todayBookings.length > 0 ? (
            <div className="mt-4 space-y-3">
              {todayBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {booking.customer?.name}
                    </p>
                    <p className="text-xs text-white/50">
                      {booking.service?.name} • {booking.time}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-400'
                        : booking.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-center text-sm text-white/60">No appointments today</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <button
            onClick={() => navigate('/barber/schedule')}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Update Schedule</p>
              <p className="text-xs text-white/50">Set your working hours</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/barber/bookings')}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">View Bookings</p>
              <p className="text-xs text-white/50">Manage appointments</p>
            </div>
          </button>
        </div>
      </div>
    </BarberLayout>
  );
};

export default BarberDashboard;
