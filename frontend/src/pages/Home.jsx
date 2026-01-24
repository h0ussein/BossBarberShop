import { useState, useEffect } from 'react';
import { servicesAPI, settingsAPI } from '../services/api';

const Home = ({ onBook }) => {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, settingsRes] = await Promise.all([
        servicesAPI.getAll(true),
        settingsAPI.get(),
      ]);
      setServices(servicesRes.data.services);
      setSettings(settingsRes.data.settings);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="rounded-3xl border border-black/10 bg-black p-6 text-white md:p-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
          {settings?.shopName || 'BOSS Barbershop'}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
          Sharp cuts. Clean style.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
          Experience precision grooming with expert barbers who take pride in
          their craft. Walk in looking good, walk out looking great.
        </p>
        <button
          type="button"
          onClick={onBook}
          className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-white/90 md:w-auto md:px-8"
        >
          Book Your Session
        </button>
      </section>

      {/* Services Section */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Our Services</h3>
        <ul className="mt-4 space-y-3 text-sm text-black/70">
          {services.map((service, index) => (
            <li
              key={service._id}
              className={`flex items-center justify-between ${
                index < services.length - 1 ? 'border-b border-black/10 pb-3' : ''
              }`}
            >
              <div>
                <span className="text-black">{service.name}</span>
                <p className="text-xs text-black/50">{service.duration} minutes</p>
              </div>
              <span className="font-semibold text-black">${service.price}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* About Section */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">About Us</h3>
        <p className="mt-4 text-sm leading-relaxed text-black/70 md:text-base">
          {settings?.shopName || 'BOSS Barbershop'} delivers premium grooming experiences with expert barbers
          who take pride in their craft. Our skilled team is dedicated to
          making you look and feel your best.
        </p>
      </section>

      {/* Working Hours */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Working Hours</h3>
        <ul className="mt-4 space-y-2 text-sm">
          {settings?.workingHours?.map((day) => (
            <li key={day.day} className="flex items-center justify-between text-black/70">
              <span>{day.day}</span>
              <span className={`font-medium ${day.isOpen ? 'text-black' : 'text-black/50'}`}>
                {day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Closed'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;
