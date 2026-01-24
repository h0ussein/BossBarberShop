import { useState, useEffect } from 'react';
import { barbersAPI, servicesAPI, settingsAPI, bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Booking = () => {
  const [step, setStep] = useState(1);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [barberSchedule, setBarberSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    barber: '',
    service: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Only fetch if we haven't fetched before
    if (!hasFetched) {
      fetchData();
    }
  }, [hasFetched]);

  // Fetch barber's schedule when barber is selected
  useEffect(() => {
    if (formData.barber) {
      fetchBarberSchedule(formData.barber);
    } else {
      setBarberSchedule(null);
    }
  }, [formData.barber]);

  const fetchData = async () => {
    if (hasFetched) return; // Prevent duplicate fetches
    
    try {
      const [barbersRes, servicesRes, settingsRes] = await Promise.all([
        barbersAPI.getAll(true),
        servicesAPI.getAll(true),
        settingsAPI.get(),
      ]);
      setBarbers(barbersRes.data.barbers);
      setServices(servicesRes.data.services);
      setSettings(settingsRes.data.settings);
      setHasFetched(true);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBarberSchedule = async (barberId) => {
    try {
      const res = await barbersAPI.getSchedule(barberId);
      setBarberSchedule(res.data);
    } catch (error) {
      console.error('Failed to load barber schedule');
    }
  };

  const selectedService = services.find((s) => s._id === formData.service);
  const selectedBarber = barbers.find((b) => b._id === formData.barber);

  // Generate time slots based on barber's working hours
  const generateTimeSlots = () => {
    if (!formData.date || !formData.barber) return [];
    
    const dayOfWeek = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if barber has a day off on this date
    if (barberSchedule?.daysOff?.some(d => d.date === formData.date)) {
      return [];
    }
    
    // Use barber's schedule if available, otherwise fall back to shop hours
    let daySettings;
    if (barberSchedule?.workingHours?.length > 0) {
      daySettings = barberSchedule.workingHours.find((d) => d.day === dayOfWeek);
      if (!daySettings || !daySettings.isWorking) return [];
    } else if (settings?.workingHours) {
      daySettings = settings.workingHours.find((d) => d.day === dayOfWeek);
      if (!daySettings || !daySettings.isOpen) return [];
    } else {
      return [];
    }
    
    const slots = [];
    const startTime = daySettings.startTime || daySettings.openTime;
    const endTime = daySettings.endTime || daySettings.closeTime;
    const [openHour, openMin] = startTime.split(':').map(Number);
    const [closeHour] = endTime.split(':').map(Number);
    
    // Break time handling
    const breakStart = barberSchedule?.breakTime?.enabled ? barberSchedule.breakTime.startTime : null;
    const breakEnd = barberSchedule?.breakTime?.enabled ? barberSchedule.breakTime.endTime : null;
    
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        // Skip if before opening time
        if (hour === openHour && min < openMin) continue;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        // Skip break time
        if (breakStart && breakEnd) {
          if (timeStr >= breakStart && timeStr < breakEnd) continue;
        }
        
        const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        slots.push(`${h}:${min.toString().padStart(2, '0')} ${period}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await bookingsAPI.create({
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
        },
        barber: formData.barber,
        service: formData.service,
        date: formData.date,
        time: formData.time,
        price: selectedService?.price || 0,
      });
      setSubmitted(true);
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const goNext = () => {
    if (step < 4) setStep(step + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  // Confirmation screen
  if (submitted) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-6 text-center md:p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-black">Booking Confirmed!</h2>
        <p className="mt-2 text-sm text-black/60">
          Thanks {formData.name}, your appointment is set.
        </p>
        <div className="mt-6 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-left text-sm">
          <div className="flex items-center gap-3 border-b border-black/10 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-semibold text-white">
              {selectedBarber?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-black">{selectedBarber?.name}</p>
              <p className="text-xs text-black/50">{selectedBarber?.role}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-black/50">Service</p>
              <p className="font-medium text-black">{selectedService?.name}</p>
            </div>
            <div>
              <p className="text-xs text-black/50">Price</p>
              <p className="font-medium text-black">${selectedService?.price}</p>
            </div>
            <div>
              <p className="text-xs text-black/50">Date</p>
              <p className="font-medium text-black">{formData.date}</p>
            </div>
            <div>
              <p className="text-xs text-black/50">Time</p>
              <p className="font-medium text-black">{formData.time}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-black/10 pt-4">
            <p className="text-xs text-black/50">Contact</p>
            <p className="font-medium text-black">{formData.phone}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setFormData({ barber: '', service: '', date: '', time: '', name: '', phone: '', email: '' });
          }}
          className="mt-6 w-full rounded-full border border-black/20 py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:border-black/40 hover:bg-black/5"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                step === s
                  ? 'bg-black text-white'
                  : step > s
                  ? 'bg-black/10 text-black'
                  : 'bg-black/5 text-black/40'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 4 && (
              <div className={`h-0.5 w-6 ${step > s ? 'bg-black/20' : 'bg-black/10'}`}></div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Select Barber */}
        {step === 1 && (
          <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Step 1</h2>
            <h3 className="mt-1 text-lg font-semibold text-black">Choose Your Barber</h3>
            <div className="mt-6 space-y-3">
              {barbers.map((barber) => (
                <label
                  key={barber._id}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                    formData.barber === barber._id
                      ? 'border-black bg-black/[0.02]'
                      : 'border-black/10 hover:border-black/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="barber"
                    value={barber._id}
                    checked={formData.barber === barber._id}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold transition ${
                      formData.barber === barber._id
                        ? 'bg-black text-white'
                        : 'bg-black/10 text-black'
                    }`}
                  >
                    {barber.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">{barber.name}</p>
                    <p className="text-xs text-black/50">{barber.role}</p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                      formData.barber === barber._id
                        ? 'border-black bg-black'
                        : 'border-black/20'
                    }`}
                  >
                    {formData.barber === barber._id && (
                      <span className="text-xs text-white">✓</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={goNext}
              disabled={!formData.barber}
              className="mt-6 w-full rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </section>
        )}

        {/* Step 2: Select Service */}
        {step === 2 && (
          <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
            <button
              type="button"
              onClick={goBack}
              className="mb-4 text-xs font-medium uppercase tracking-wide text-black/50 transition hover:text-black"
            >
              ← Back
            </button>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Step 2</h2>
            <h3 className="mt-1 text-lg font-semibold text-black">Select a Service</h3>
            <div className="mt-6 space-y-3">
              {services.map((svc) => (
                <label
                  key={svc._id}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition ${
                    formData.service === svc._id
                      ? 'border-black bg-black/[0.02]'
                      : 'border-black/10 hover:border-black/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="service"
                      value={svc._id}
                      checked={formData.service === svc._id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                        formData.service === svc._id
                          ? 'border-black bg-black'
                          : 'border-black/20'
                      }`}
                    >
                      {formData.service === svc._id && (
                        <span className="h-2 w-2 rounded-full bg-white"></span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-black">{svc.name}</p>
                      <p className="text-xs text-black/50">{svc.duration} minutes</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-black">${svc.price}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={goNext}
              disabled={!formData.service}
              className="mt-6 w-full rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </section>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
            <button
              type="button"
              onClick={goBack}
              className="mb-4 text-xs font-medium uppercase tracking-wide text-black/50 transition hover:text-black"
            >
              ← Back
            </button>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Step 3</h2>
            <h3 className="mt-1 text-lg font-semibold text-black">Pick Date & Time</h3>
            
            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-black/60">Select Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black/30"
              />
            </div>

            {formData.date && timeSlots.length === 0 && (
              <p className="mt-4 text-sm text-red-500">
                {barberSchedule?.daysOff?.some(d => d.date === formData.date)
                  ? `${selectedBarber?.name} is not available on this day. Please select another date.`
                  : `${selectedBarber?.name || 'Barber'} is not working on this day. Please select another date.`}
              </p>
            )}

            {formData.date && timeSlots.length > 0 && (
              <div className="mt-6">
                <label className="mb-2 block text-xs font-medium text-black/60">
                  Available Slots
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, time: slot }))}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                        formData.time === slot
                          ? 'border-black bg-black text-white'
                          : 'border-black/10 text-black/70 hover:border-black/20 hover:bg-black/[0.02]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={goNext}
              disabled={!formData.date || !formData.time}
              className="mt-6 w-full rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </section>
        )}

        {/* Step 4: Contact Info & Confirm */}
        {step === 4 && (
          <section className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
            <button
              type="button"
              onClick={goBack}
              className="mb-4 text-xs font-medium uppercase tracking-wide text-black/50 transition hover:text-black"
            >
              ← Back
            </button>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-black/50">Step 4</h2>
            <h3 className="mt-1 text-lg font-semibold text-black">Your Details</h3>

            {/* Summary */}
            <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-black/60">Barber</span>
                <span className="font-medium text-black">{selectedBarber?.name}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-black/60">Service</span>
                <span className="font-medium text-black">{selectedService?.name}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-black/60">Date & Time</span>
                <span className="font-medium text-black">{formData.date} at {formData.time}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2">
                <span className="font-medium text-black">Total</span>
                <span className="text-lg font-semibold text-black">${selectedService?.price}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="name">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-black/60" htmlFor="email">
                  Email (Optional - for booking confirmation)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black/30"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!formData.name || !formData.phone || submitting}
              className="mt-6 w-full rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </section>
        )}
      </form>
    </div>
  );
};

export default Booking;
