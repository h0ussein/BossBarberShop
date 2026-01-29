import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      default: 'Admin',
    },
    passcode: {
      type: String,
      required: [true, 'Passcode is required'],
      minlength: [4, 'Passcode must be at least 4 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'barber'],
      default: 'admin',
    },
    // Link to Barber record (only for role: 'barber')
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash passcode before saving (Mongoose 8+ - no next() with async)
adminSchema.pre('save', async function () {
  if (!this.isModified('passcode')) return;
  this.passcode = await bcrypt.hash(this.passcode, 12);
});

// Compare passcode method
adminSchema.methods.comparePasscode = async function (candidatePasscode) {
  return await bcrypt.compare(candidatePasscode, this.passcode);
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
