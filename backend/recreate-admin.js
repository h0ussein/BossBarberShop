import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const conn = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Admin schema (inline to avoid import issues)
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Admin' },
  passcode: { type: String, required: true, select: false },
  role: { type: String, enum: ['super_admin', 'admin', 'barber'], default: 'admin' },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

adminSchema.pre('save', async function () {
  if (!this.isModified('passcode')) return;
  this.passcode = await bcrypt.hash(this.passcode, 12);
});

const Admin = mongoose.model('Admin', adminSchema);

// Recreate admin
const recreateAdmin = async () => {
  try {
    await conn();

    // Delete all existing admins
    const deletedCount = await Admin.deleteMany({});
    console.log(`✓ Deleted ${deletedCount.deletedCount} existing admin(s)`);

    // Get passcode from environment
    const passcode = process.env.DEFAULT_ADMIN_PASSCODE || '123456';

    // Create new admin
    const admin = await Admin.create({
      name: 'Admin',
      passcode: passcode,
      role: 'super_admin',
      isActive: true,
    });

    console.log('\n✓ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Name:', admin.name);
    console.log('  Role:', admin.role);
    console.log('  Passcode:', passcode);
    console.log('  Login URL: /adminR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the passcode after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error recreating admin:', error);
    process.exit(1);
  }
};

recreateAdmin();
