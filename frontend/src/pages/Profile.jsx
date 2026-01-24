import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Demo data - will be fetched from API
  const upcomingAppointments = [
    { id: 1, barber: 'Ahmed', service: 'Classic Haircut', date: 'Jan 28, 2026', time: '2:00 PM', status: 'confirmed' },
    { id: 2, barber: 'Omar', service: 'Beard Trim', date: 'Feb 4, 2026', time: '11:00 AM', status: 'pending' },
  ];

  const pastAppointments = [
    { id: 3, barber: 'Khalid', service: 'Hair + Beard Combo', date: 'Jan 15, 2026', time: '3:00 PM' },
    { id: 4, barber: 'Ahmed', service: 'Classic Haircut', date: 'Dec 20, 2025', time: '1:00 PM' },
  ];

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
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Upcoming Appointments</h3>
        {upcomingAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-black/50">No upcoming appointments.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcomingAppointments.map((apt) => (
              <li
                key={apt.id}
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black">{apt.service}</p>
                    <p className="text-xs text-black/50">with {apt.barber}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      apt.status === 'confirmed'
                        ? 'bg-black text-white'
                        : 'border border-black/20 text-black/60'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-black/60">
                  <span>{apt.date}</span>
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
        {pastAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-black/50">No past appointments.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pastAppointments.map((apt) => (
              <li
                key={apt.id}
                className="rounded-2xl border border-black/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black/80">{apt.service}</p>
                    <p className="text-xs text-black/50">with {apt.barber}</p>
                  </div>
                  <span className="text-xs text-black/40">Completed</span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-black/50">
                  <span>{apt.date}</span>
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
