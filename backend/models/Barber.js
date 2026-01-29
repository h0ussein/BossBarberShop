import mongoose from 'mongoose';

const barberWorkingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  isWorking: {
    type: Boolean,
    default: true,
  },
  startTime: {
    type: String,
    default: '09:00',
  },
  endTime: {
    type: String,
    default: '18:00',
  },
});

const barberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['Junior Barber', 'Barber', 'Senior Barber'],
      default: 'Barber',
    },
    avatar: {
      url: {
        type: String,
        default: '',
      },
      fileId: {
        type: String,
        default: '',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Barber's personal schedule
    workingHours: [barberWorkingHoursSchema],
    // Break time
    breakTime: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startTime: {
        type: String,
        default: '13:00',
      },
      endTime: {
        type: String,
        default: '14:00',
      },
    },
    // Days off (specific dates)
    daysOff: [{
      date: String,
      reason: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Set default working hours when creating a new barber
barberSchema.pre('save', function () {
  if (this.isNew && (!this.workingHours || this.workingHours.length === 0)) {
    this.workingHours = [
      { day: 'Monday', isWorking: true, startTime: '11:00', endTime: '20:00' },
      { day: 'Tuesday', isWorking: true, startTime: '11:00', endTime: '20:00' },
      { day: 'Wednesday', isWorking: true, startTime: '11:00', endTime: '20:00' },
      { day: 'Thursday', isWorking: true, startTime: '11:00', endTime: '20:00' },
      { day: 'Friday', isWorking: true, startTime: '11:00', endTime: '20:00' },
      { day: 'Saturday', isWorking: true, startTime: '10:00', endTime: '21:00' },
      { day: 'Sunday', isWorking: false, startTime: '10:00', endTime: '18:00' },
    ];
  }
});

// Indexes for better query performance
barberSchema.index({ email: 1 }, { unique: true });
barberSchema.index({ isActive: 1 });
barberSchema.index({ createdAt: -1 });

const Barber = mongoose.model('Barber', barberSchema);

export default Barber;
