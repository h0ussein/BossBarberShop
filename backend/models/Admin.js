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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true, // Allow null/undefined, but must be unique if present (single index)
      // Only required for barbers, not for super_admin
    },
    passcode: {
      type: String,
      // Only required for super_admin/admin, not for barbers
      minlength: [4, 'Passcode must be at least 4 characters'],
      select: false,
    },
    password: {
      type: String,
      // Only required for barbers, not for super_admin
      minlength: [6, 'Password must be at least 6 characters'],
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

// Hash passcode/password before saving (Mongoose 8+ - no next() with async)
adminSchema.pre('save', async function () {
  // Hash passcode if modified (for super_admin)
  if (this.isModified('passcode') && this.passcode) {
    this.passcode = await bcrypt.hash(this.passcode, 12);
  }
  
  // Hash password if modified (for barbers)
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// Compare passcode method (for super_admin)
adminSchema.methods.comparePasscode = async function (candidatePasscode) {
  return await bcrypt.compare(candidatePasscode, this.passcode);
};

// Compare password method (for barbers)
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes for better query performance (email index from field unique+sparse)
adminSchema.index({ role: 1 });
adminSchema.index({ barberId: 1 }, { sparse: true });
adminSchema.index({ isActive: 1 });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
