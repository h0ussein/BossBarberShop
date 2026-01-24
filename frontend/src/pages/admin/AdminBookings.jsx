import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { bookingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.getAll();
      setBookings(res.data.bookings);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await bookingsAPI.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const updateStatus = async (id, status) => {
    try {
      await bookingsAPI.update(id, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
      fetchStats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteBooking = async (id) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.delete(id);
        toast.success('Booking cancelled');
        fetchBookings();
        fetchStats();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

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
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-white sm:text-xl">Bookings</h1>
          <p className="text-xs text-white/50 sm:text-sm">View and manage appointments</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                filter === f
                  ? 'bg-white text-black'
                  : 'border border-white/10 text-white/60 hover:border-white/20 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Stats - Horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 min-w-[120px]">
            <p className="text-[10px] text-white/50">Total</p>
            <p className="mt-0.5 text-xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 min-w-[120px]">
            <p className="text-[10px] text-white/50">Pending</p>
            <p className="mt-0.5 text-xl font-semibold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 min-w-[120px]">
            <p className="text-[10px] text-white/50">Confirmed</p>
            <p className="mt-0.5 text-xl font-semibold text-green-400">{stats.confirmed}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-3 min-w-[120px]">
            <p className="text-[10px] text-white/50">Completed</p>
            <p className="mt-0.5 text-xl font-semibold text-blue-400">{stats.completed}</p>
          </div>
        </div>

        {/* Bookings - Card view on mobile, Table on desktop */}
        <div className="space-y-3 lg:hidden">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{booking.customer?.name}</p>
                  <p className="text-xs text-white/50">{booking.customer?.phone}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-white/50">Service</p>
                  <p className="text-white">{booking.service?.name}</p>
                </div>
                <div>
                  <p className="text-white/50">Barber</p>
                  <p className="text-white">{booking.barber?.name}</p>
                </div>
                <div>
                  <p className="text-white/50">Date</p>
                  <p className="text-white">{booking.date}</p>
                </div>
                <div>
                  <p className="text-white/50">Time</p>
                  <p className="text-white">{booking.time}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <p className="text-sm font-medium text-white">${booking.price}</p>
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(booking._id, 'confirmed')}
                      className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400"
                    >
                      Confirm
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(booking._id, 'completed')}
                      className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400"
                    >
                      Complete
                    </button>
                  )}
                  {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                    <button
                      onClick={() => deleteBooking(booking._id)}
                      className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredBookings.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
              No bookings found
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/50">
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Service</th>
                  <th className="px-5 py-4 font-medium">Barber</th>
                  <th className="px-5 py-4 font-medium">Date & Time</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-white/5">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-white">{booking.customer?.name}</p>
                        <p className="text-xs text-white/50">{booking.customer?.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/70">{booking.service?.name}</td>
                    <td className="px-5 py-4 text-white/70">{booking.barber?.name}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-white">{booking.date}</p>
                        <p className="text-xs text-white/50">{booking.time}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-white">${booking.price}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(booking._id, 'confirmed')}
                            className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 transition hover:bg-green-500/30"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(booking._id, 'completed')}
                            className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/30"
                          >
                            Complete
                          </button>
                        )}
                        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          <button
                            onClick={() => deleteBooking(booking._id)}
                            className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredBookings.length === 0 && (
            <div className="p-8 text-center text-sm text-white/50">
              No bookings found
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
