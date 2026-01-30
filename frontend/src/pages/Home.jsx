import { useState, useEffect } from 'react';
import { servicesAPI, settingsAPI, homepageSectionsAPI } from '../services/api';
import SEO from '../components/SEO';
import abedBg from '../assets/abed.jpeg';

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
    <div className="space-y-5 md:space-y-6">
      <SEO 
        title="Salon Abed - Premium Barbershop & Grooming Services | Book Online"
        description="Experience precision grooming at Salon Abed. Expert barbers offering haircuts, beard trims, and premium styling. Book your appointment online today. Walk in looking good, walk out looking great."
        keywords="barbershop, haircut, grooming, barber, beard trim, men's haircut, styling, Salon Abed, professional barber, book appointment"
        canonicalUrl="https://bossbarbershop.onrender.com/"
      />
      {/* Hero Section – first section with abed.jpeg background */}
      <section
        className="relative min-h-[320px] overflow-hidden rounded-3xl border border-black/10 bg-cover bg-center bg-no-repeat p-6 text-white shadow-xl md:min-h-[380px] md:p-8 md:p-10"
        style={{ backgroundImage: `url(${abedBg})` }}
      >
        <div className="absolute inset-0 rounded-3xl bg-black/70" />
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/70 font-medium">
            {settings?.shopName || 'Salon Abed'}
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl md:leading-tight">
            Sharp cuts.<br />
            Clean style.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/80 md:text-lg md:leading-relaxed">
            Experience precision grooming with expert barbers who take pride in
            their craft. Walk in looking good, walk out looking great.
          </p>
          <button
            type="button"
            onClick={onBook}
            className="mt-8 w-full rounded-full bg-white py-4 text-sm font-bold uppercase tracking-wide text-black shadow-lg transition-all hover:scale-105 hover:bg-white/95 hover:shadow-xl active:scale-95 md:w-auto md:px-10 md:py-4"
          >
            Book Your Session
          </button>
        </div>
      </section>

      {/* Services Section with Enhanced Design */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-semibold">Our Services</h3>
          <p className="mt-2 text-sm text-black/60">Professional grooming services tailored for you</p>
        </div>
        <div className="space-y-3">
          {services.map((service, index) => (
            <div
              key={service._id}
              className={`group flex items-center justify-between rounded-xl border border-black/5 bg-gradient-to-r from-white to-black/5 p-4 transition-all hover:border-black/10 hover:shadow-md ${
                index < services.length - 1 ? 'mb-3' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Service Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black/5 group-hover:bg-black/10 transition-colors">
                  <svg className="h-6 w-6 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-base font-semibold text-black">{service.name}</span>
                  <p className="mt-0.5 text-xs text-black/50">{service.duration} minutes</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-black">${service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-semibold">About Salon Abed</h3>
        <p className="mt-4 text-base leading-relaxed text-black/80 md:text-lg md:leading-relaxed">
          Salon Abed is a premium barbershop dedicated to delivering exceptional grooming experiences.
          Founded by Abed Merhi, we combine traditional barbering techniques with modern styling to create
          the perfect look for every client. Our expert barbers are passionate about their craft and committed
          to making you look and feel your absolute best.
        </p>
      </section>

      {/* Working Hours with Enhanced Design */}
      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-semibold">Working Hours</h3>
        <div className="mt-5 space-y-3">
          {settings?.workingHours?.map((day) => (
            <div
              key={day.day}
              className={`flex items-center justify-between rounded-lg border border-black/5 px-4 py-3 transition-colors ${
                day.isOpen ? 'bg-black/5' : 'bg-black/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Day Indicator */}
                <div className={`h-2 w-2 rounded-full ${day.isOpen ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="font-medium text-black/80">{day.day}</span>
              </div>
              <span className={`font-semibold ${day.isOpen ? 'text-black' : 'text-black/40'}`}>
                {day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Closed'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Homepage Sections with Enhanced Design */}
      {homepageSections.length > 0 && (
        <>
          {homepageSections.map((section, index) => (
            <section
              key={section._id}
              className="group overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={section.image.url}
                  alt={section.description || 'Homepage section'}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  width="1200"
                  height="675"
                />
              </div>
              {section.description && (
                <div className="p-6 md:p-8">
                  <p className="text-base leading-relaxed text-black/80 md:text-lg md:leading-relaxed">
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
