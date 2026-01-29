import { useState, useEffect } from 'react';
import BarberLayout from '../../components/barber/BarberLayout';
import { barberAuthAPI } from '../../services/api';
import { useBarberAuth } from '../../contexts/BarberAuthContext';
import toast from 'react-hot-toast';

const BarberSchedule = () => {
  const { barber, refreshBarberProfile } = useBarberAuth();
  const [schedule, setSchedule] = useState([]);
  const [breakTime, setBreakTime] = useState({ enabled: false, startTime: '13:00', endTime: '14:00' });
  const [daysOff, setDaysOff] = useState([]);
  const [newDayOff, setNewDayOff] = useState({ date: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await barberAuthAPI.getProfile();
      const barberData = res.data.barber;
      setSchedule(barberData.workingHours || []);
      setBreakTime(barberData.breakTime || { enabled: false, startTime: '13:00', endTime: '14:00' });
      setDaysOff(barberData.daysOff || []);
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleDay = (day, field, value) => {
    setSchedule((prev) =>
      prev.map((s) => (s.day === day ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await barberAuthAPI.updateSchedule({ workingHours: schedule, breakTime });
      toast.success('Schedule saved successfully');
      refreshBarberProfile();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDayOff = async () => {
    if (!newDayOff.date) {
      toast.error('Please select a date');
      return;
    }
    try {
      await barberAuthAPI.addDayOff(newDayOff);
      toast.success('Day off added');
      setNewDayOff({ date: '', reason: '' });
      fetchProfile();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemoveDayOff = async (date) => {
    try {
      await barberAuthAPI.removeDayOff(date);
      toast.success('Day off removed');
      fetchProfile();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const timeOptions = [];
  for (let h = 6; h <= 23; h++) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
    timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
  }

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">My Schedule</h1>
            <p className="text-xs text-white/50 sm:text-sm">Set your working hours and days off</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>

        {/* Working Hours */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-medium text-white">Working Hours</h3>
          <p className="mt-0.5 text-xs text-white/50">Set your availability for each day</p>

          <div className="mt-4 space-y-3">
            {schedule.map((day) => (
              <div
                key={day.day}
                className={`rounded-xl border p-3 ${
                  day.isWorking ? 'border-white/10 bg-white/[0.02]' : 'border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateScheduleDay(day.day, 'isWorking', !day.isWorking)}
                      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                        day.isWorking ? 'bg-green-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                          day.isWorking ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-white">{day.day}</span>
                  </div>
                  {!day.isWorking && (
                    <span className="text-xs text-white/60">Day Off</span>
                  )}
                </div>

                {day.isWorking && (
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={day.startTime}
                      onChange={(e) => updateScheduleDay(day.day, 'startTime', e.target.value)}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time} className="bg-zinc-900">
                          {time}
                        </option>
                      ))}
                    </select>
                    <span className="text-white/30">to</span>
                    <select
                      value={day.endTime}
                      onChange={(e) => updateScheduleDay(day.day, 'endTime', e.target.value)}
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

        {/* Break Time */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Break Time</h3>
              <p className="mt-0.5 text-xs text-white/50">Set a daily break period</p>
            </div>
            <button
              onClick={() => setBreakTime((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                breakTime.enabled ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                  breakTime.enabled ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {breakTime.enabled && (
            <div className="mt-4 flex items-center gap-2">
              <select
                value={breakTime.startTime}
                onChange={(e) => setBreakTime((prev) => ({ ...prev, startTime: e.target.value }))}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time} className="bg-zinc-900">
                    {time}
                  </option>
                ))}
              </select>
              <span className="text-white/30">to</span>
              <select
                value={breakTime.endTime}
                onChange={(e) => setBreakTime((prev) => ({ ...prev, endTime: e.target.value }))}
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

        {/* Days Off */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-medium text-white">Days Off</h3>
          <p className="mt-0.5 text-xs text-white/50">Add vacation or sick days</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={newDayOff.date}
              onChange={(e) => setNewDayOff((prev) => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={newDayOff.reason}
              onChange={(e) => setNewDayOff((prev) => ({ ...prev, reason: e.target.value }))}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              onClick={handleAddDayOff}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Add
            </button>
          </div>

          {daysOff.length > 0 && (
            <div className="mt-4 space-y-2">
              {daysOff.map((dayOff, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{dayOff.date}</p>
                    {dayOff.reason && (
                      <p className="text-xs text-white/50">{dayOff.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveDayOff(dayOff.date)}
                    className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {daysOff.length === 0 && (
            <p className="mt-4 text-center text-xs text-white/60">No days off scheduled</p>
          )}
        </div>
      </div>
    </BarberLayout>
  );
};

export default BarberSchedule;
