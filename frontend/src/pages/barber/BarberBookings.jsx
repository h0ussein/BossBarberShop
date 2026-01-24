import { useState, useEffect } from 'react';
import BarberLayout from '../../components/barber/BarberLayout';
import { barberAuthAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BarberBookings = () => {
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await barberAuthAPI.getBookings();
      setBookings(res.data.bookings);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const updateStatus = async (id, status) => {
    try {
      await barberAuthAPI.updateBooking(id, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error(error.message);
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

  const stats = {
    total: bookings.length,
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
        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-white sm:text-xl">My Bookings</h1>
          <p className="text-xs text-white/50 sm:text-sm">Manage your appointments</p>
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
              {f} {f !== 'all' && `(${stats[f]})`}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
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
                    <p className="text-white/50">Price</p>
                    <p className="text-white">${booking.price}</p>
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
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
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
                      onClick={() => updateStatus(booking._id, 'cancelled')}
                      className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <p className="text-sm text-white/50">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </BarberLayout>
  );
};

export default BarberBookings;
