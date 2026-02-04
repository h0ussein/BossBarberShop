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
    <div className="bg-white">
      <SEO 
        title="Salon Abed - Premium Barbershop & Grooming Services | Book Online"
        description="Experience precision grooming at Salon Abed. Expert barbers offering haircuts, beard trims, and premium styling. Book your appointment online today. Walk in looking good, walk out looking great."
        keywords="barbershop, haircut, grooming, barber, beard trim, men's haircut, styling, Salon Abed, professional barber, book appointment"
        canonicalUrl="https://salonabed.hair/"
      />
      
      {/* Hero Section */}
      <section
        className="relative min-h-[400px] overflow-hidden bg-cover bg-center bg-no-repeat text-white md:min-h-[450px]"
        style={{ backgroundImage: `url(${abedBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 flex min-h-[400px] flex-col items-center justify-center px-6 py-12 text-center md:min-h-[450px] md:py-16">
          <h1 className="mb-2 text-2xl font-light uppercase tracking-[0.3em] text-white md:text-3xl">
            ABED MERHI
          </h1>
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-white/70 md:text-xs">
            BARBERSHOP
          </p>
          <h2 className="mb-6 max-w-2xl text-2xl font-light leading-tight text-white md:text-3xl md:leading-snug">
            Precision. Style. Confidence.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={onBook}
              className="rounded-full bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition-all hover:bg-gray-100 md:px-7 md:py-3"
            >
              BOOK APPOINTMENT
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border-2 border-white bg-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black md:px-7 md:py-3"
            >
              OUR SERVICES
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-50 px-4 py-6 md:px-6 md:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 text-center">
            <h3 className="mb-1 text-sm font-normal uppercase tracking-[0.2em] text-black md:text-base">
              OUR SERVICES
            </h3>
            <p className="text-[10px] text-gray-600 md:text-xs">
              Professional grooming tailored for the modern man.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((service) => (
              <div
                key={service._id}
                className="group w-[calc(33.333%-0.5rem)] rounded-xl bg-white p-4 text-center shadow-sm transition-all hover:shadow-md md:p-5"
              >
                <h4 className="mb-1 text-xs font-semibold text-black md:text-sm">{service.name}</h4>
                <p className="mb-2 text-[10px] text-gray-500 md:text-xs">{service.duration} min</p>
                <p className="text-base font-bold text-black md:text-lg">${service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white px-4 py-6 md:px-6 md:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 text-center">
            <h3 className="mb-1 text-sm font-normal uppercase tracking-[0.2em] text-black md:text-base">
              WHY CHOOSE US
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="w-[calc(33.333%-0.5rem)] rounded-xl bg-gray-50 p-4 text-center md:p-5">
              <h4 className="mb-2 text-xs font-semibold text-black md:text-sm">Expert Barbers</h4>
              <p className="text-[10px] leading-relaxed text-gray-600 md:text-xs">
                Skilled barbers delivering top-notch precision cuts and grooming.
              </p>
            </div>
            <div className="w-[calc(33.333%-0.5rem)] rounded-xl bg-gray-50 p-4 text-center md:p-5">
              <h4 className="mb-2 text-xs font-semibold text-black md:text-sm">On-Time Appointments</h4>
              <p className="text-[10px] leading-relaxed text-gray-600 md:text-xs">
                Punctual service ensuring you're never kept waiting for your haircut.
              </p>
            </div>
            <div className="w-[calc(33.333%-0.5rem)] rounded-xl bg-gray-50 p-4 text-center md:p-5">
              <h4 className="mb-2 text-xs font-semibold text-black md:text-sm">Premium Tools</h4>
              <p className="text-[10px] leading-relaxed text-gray-600 md:text-xs">
                We use only the finest, professional-grade tools and products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {homepageSections.length > 0 && (
        <section className="bg-gray-50 px-4 py-10 md:px-6 md:py-14">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-light uppercase tracking-[0.3em] text-black md:text-2xl">
                GALLERY
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {homepageSections.map((section) => (
                <div
                  key={section._id}
                  className="group aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={section.image.url}
                    alt={section.description || 'Gallery image'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Working Hours Section */}
      {settings?.workingHours && (
        <section className="bg-white px-4 py-10 md:px-6 md:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-light uppercase tracking-[0.3em] text-black md:text-2xl">
                OPENING HOURS
              </h3>
            </div>
            <div className="space-y-3">
              {settings.workingHours.map((day) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between border-b border-gray-200 pb-3"
                >
                  <span className="text-sm font-medium text-black md:text-base">{day.day}</span>
                  <span className={`text-sm md:text-base ${day.isOpen ? 'text-black' : 'text-gray-400'}`}>
                    {day.isOpen ? `${day.openTime} - ${day.closeTime}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
