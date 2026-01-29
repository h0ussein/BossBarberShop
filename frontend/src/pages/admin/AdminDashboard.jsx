import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { bookingsAPI, barbersAPI, servicesAPI } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalBookings: 0,
    activeBarbers: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, barbersRes, statsRes] = await Promise.all([
        bookingsAPI.getAll(),
        barbersAPI.getAll(true),
        bookingsAPI.getStats(),
      ]);
      
      setRecentBookings(bookingsRes.data.bookings.slice(0, 5));
      setStats({
        todayBookings: statsRes.data.todayBookings || 0,
        totalBookings: statsRes.data.total || 0,
        activeBarbers: barbersRes.data.barbers.length || 0,
        totalRevenue: statsRes.data.totalRevenue || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { label: "Today's Bookings", value: stats.todayBookings, change: 'appointments' },
    { label: 'Total Bookings', value: stats.totalBookings, change: 'all time' },
    { label: 'Active Barbers', value: stats.activeBarbers, change: 'available' },
    { label: 'Revenue', value: `$${stats.totalRevenue}`, change: 'completed' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Stats - Grid on all sizes */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4"
            >
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide text-white/50 truncate">
                {stat.label}
              </p>
              <p className="mt-1 text-xl sm:text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-0.5 text-[9px] sm:text-[10px] text-white/60">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Recent Bookings - Card view on mobile */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Bookings</h3>
            <button 
              onClick={() => navigate('/adminR/bookings')}
              className="text-xs text-white/50 hover:text-white"
            >
              View All
            </button>
          </div>
          
          {/* Mobile Cards */}
          <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3 lg:hidden">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking._id} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5 sm:p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">{booking.customer?.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-medium ${
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
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-white/50">
                    <span className="truncate">{booking.service?.name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate">{booking.barber?.name}</span>
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs text-white/60">
                    {booking.date} at {booking.time}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-white/50 py-4">No bookings yet</p>
            )}
          </div>

          {/* Desktop Table */}
          <div className="mt-4 hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/50">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium">Barber</th>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr key={booking._id} className="border-b border-white/5">
                      <td className="py-3 text-white">{booking.customer?.name}</td>
                      <td className="py-3 text-white/70">{booking.service?.name}</td>
                      <td className="py-3 text-white/70">{booking.barber?.name}</td>
                      <td className="py-3 text-white/70">{booking.date} {booking.time}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-400'
                              : booking.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-xs text-white/50">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          <button 
            onClick={() => navigate('/adminR/barbers')}
            className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3 text-left transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white">Add New Barber</p>
              <p className="text-[10px] sm:text-xs text-white/50">Register a team member</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/adminR/hours')}
            className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3 text-left transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white">Update Hours</p>
              <p className="text-[10px] sm:text-xs text-white/50">Modify schedule</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/adminR/services')}
            className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-3 text-left transition hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-white">Manage Services</p>
              <p className="text-[10px] sm:text-xs text-white/50">Edit prices</p>
            </div>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
