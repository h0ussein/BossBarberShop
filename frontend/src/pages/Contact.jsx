import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get();
      setSettings(res.data.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
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
      {/* Header */}
      <section className="rounded-3xl border border-black/10 bg-black p-6 text-white md:p-8">
        <h2 className="text-[10px] uppercase tracking-[0.35em] text-white/60">Get in Touch</h2>
        <h3 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Contact Us</h3>
        <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
          Have questions or want to schedule an appointment? Reach out to us through any of the channels below.
        </p>
      </section>

      {/* Location */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Location</h3>
        <div className="mt-4 text-sm text-black/70">
          <p className="font-semibold text-black">{settings?.shopName || 'BOSS Barbershop'}</p>
          <p className="mt-1">{settings?.address || '123 Main Street, Downtown, City 12345'}</p>
        </div>
        <div className="mt-4 flex h-40 items-center justify-center rounded-2xl border border-black/10 bg-black/[0.02] text-xs text-black/40">
          Map Placeholder
        </div>
      </section>

      {/* Contact Info */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Contact Info</h3>
        <ul className="mt-4 space-y-4 text-sm">
          <li className="flex items-center justify-between border-b border-black/10 pb-4">
            <span className="text-black/60">Phone</span>
            <a href={`tel:${settings?.phone}`} className="font-medium text-black transition hover:underline">
              {settings?.phone || '+1 234 567 890'}
            </a>
          </li>
          <li className="flex items-center justify-between border-b border-black/10 pb-4">
            <span className="text-black/60">Email</span>
            <a href={`mailto:${settings?.email}`} className="font-medium text-black transition hover:underline">
              {settings?.email || 'hello@bossbarbershop.com'}
            </a>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-black/60">Instagram</span>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="font-medium text-black transition hover:underline">
              {settings?.instagram || '@bossbarbershop'}
            </a>
          </li>
        </ul>
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

export default Contact;
