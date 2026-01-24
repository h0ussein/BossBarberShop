import mongoose from 'mongoose';

const workingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  openTime: {
    type: String,
    default: '09:00',
  },
  closeTime: {
    type: String,
    default: '18:00',
  },
});

const settingsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: 'BOSS Barbershop',
    },
    tagline: {
      type: String,
      default: 'Premium Grooming',
    },
    phone: {
      type: String,
      default: '+1 234 567 890',
    },
    email: {
      type: String,
      default: 'hello@bossbarbershop.com',
    },
    address: {
      type: String,
      default: '123 Main Street, Downtown, City 12345',
    },
    instagram: {
      type: String,
      default: '@bossbarbershop',
    },
    slotDuration: {
      type: Number,
      default: 30,
    },
    workingHours: [workingHoursSchema],
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
