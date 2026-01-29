import { useState, useEffect } from 'react';
import { servicesAPI, settingsAPI, homepageSectionsAPI } from '../services/api';
import SEO from '../components/SEO';

const Home = ({ onBook }) => {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [homepageSections, setHomepageSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, settingsRes, sectionsRes] = await Promise.all([
        servicesAPI.getAll(true),
        settingsAPI.get(),
        homepageSectionsAPI.getAll(),
      ]);
      setServices(servicesRes.data.services);
      setSettings(settingsRes.data.settings);
      setHomepageSections(sectionsRes.data.sections || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Hero Section Skeleton */}
        <div className="rounded-3xl border border-black/10 bg-black p-6 md:p-8" style={{ minHeight: '200px' }}>
          <div className="h-3 w-20 animate-pulse rounded bg-white/20"></div>
          <div className="mt-3 h-8 w-3/4 animate-pulse rounded bg-white/30"></div>
          <div className="mt-4 h-16 w-full animate-pulse rounded bg-white/20"></div>
          <div className="mt-6 h-12 w-full animate-pulse rounded-full bg-white/40 md:w-48"></div>
        </div>
        {/* Services Section Skeleton */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8" style={{ minHeight: '200px' }}>
          <div className="h-3 w-24 animate-pulse rounded bg-black/10"></div>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-black/10 pb-3">
                <div className="h-4 w-32 animate-pulse rounded bg-black/10"></div>
                <div className="h-4 w-12 animate-pulse rounded bg-black/10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO 
        title="Salon Abed - Premium Barbershop & Grooming Services | Book Online"
        description="Experience precision grooming at Salon Abed. Expert barbers offering haircuts, beard trims, and premium styling. Book your appointment online today. Walk in looking good, walk out looking great."
        keywords="barbershop, haircut, grooming, barber, beard trim, men's haircut, styling, Salon Abed, professional barber, book appointment"
        canonicalUrl="https://bossbarbershop.onrender.com/"
      />
      {/* Hero Section */}
      <section className="rounded-3xl border border-black/10 bg-black p-6 text-white md:p-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
          {settings?.shopName || 'Salon Abed'}
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
          {settings?.shopName || 'Salon Abed'} delivers premium grooming experiences with expert barbers
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

      {/* Homepage Sections */}
      {homepageSections.length > 0 && (
        <>
          {homepageSections.map((section) => (
            <section
              key={section._id}
              className="rounded-3xl border border-black/10 bg-white overflow-hidden"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={section.image.url}
                  alt={section.description || 'Homepage section'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  width="1200"
                  height="675"
                />
              </div>
              {section.description && (
                <div className="p-6 md:p-8">
                  <p className="text-sm leading-relaxed text-black/70 md:text-base">
                    {section.description}
                  </p>
                </div>
              )}
            </section>
          ))}
        </>
      )}
    </div>
  );
};

export default Home;
