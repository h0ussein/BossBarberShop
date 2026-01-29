import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminHours = () => {
  const [schedule, setSchedule] = useState([]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get();
      const settings = res.data.settings;
      if (settings.workingHours) {
        setSchedule(settings.workingHours);
      }
      if (settings.slotDuration) {
        setSlotDuration(settings.slotDuration);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = (day, field, value) => {
    setSchedule((prev) =>
      prev.map((s) => (s.day === day ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateHours({ workingHours: schedule, slotDuration });
      toast.success('Schedule saved successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const timeOptions = [];
  for (let h = 6; h <= 23; h++) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
    timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
  }

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">Working Hours</h1>
            <p className="text-xs text-white/50 sm:text-sm">Configure your shop's schedule</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Slot Duration */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-medium text-white">Slot Duration</h3>
          <p className="mt-0.5 text-xs text-white/50">How long each booking slot should be</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[15, 30, 45, 60].map((duration) => (
              <button
                key={duration}
                onClick={() => setSlotDuration(duration)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  slotDuration === duration
                    ? 'bg-white text-black'
                    : 'border border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                }`}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-medium text-white">Weekly Schedule</h3>
          <p className="mt-0.5 text-xs text-white/50">Set opening and closing times</p>

          <div className="mt-4 space-y-3">
            {schedule.map((day) => (
              <div
                key={day.day}
                className={`rounded-xl border p-3 ${
                  day.isOpen ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSchedule(day.day, 'isOpen', !day.isOpen)}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                        day.isOpen ? 'bg-green-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                          day.isOpen ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-white">{day.day}</span>
                  </div>
                  {!day.isOpen && (
                    <span className="text-xs text-white/60">Closed</span>
                  )}
                </div>

                {day.isOpen && (
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={day.openTime}
                      onChange={(e) => updateSchedule(day.day, 'openTime', e.target.value)}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time} className="bg-zinc-900">
                          {time}
                        </option>
                      ))}
                    </select>
                    <span className="text-white/30">—</span>
                    <select
                      value={day.closeTime}
                      onChange={(e) => updateSchedule(day.day, 'closeTime', e.target.value)}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time} className="bg-zinc-900">
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-medium text-white">Preview</h3>
          <p className="mt-0.5 text-xs text-white/50">How customers will see your hours</p>
          <div className="mt-3 space-y-1.5">
            {schedule.map((day) => (
              <div key={day.day} className="flex items-center justify-between text-xs">
                <span className="text-white/70">{day.day}</span>
                <span className={day.isOpen ? 'text-white' : 'text-white/60'}>
                  {day.isOpen
                    ? `${day.openTime} - ${day.closeTime}`
                    : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHours;
