import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const conn = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  barberId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
}, { timestamps: true });

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const Admin = mongoose.model('Admin', adminSchema);

const resetBarberPassword = async () => {
  try {
    await conn();

    const barberEmail = 'houssein.ibrahim.3@gmail.com'; // Change this email
    const newPassword = 'NewPass123'; // Change this password

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 RESET BARBER PASSWORD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`🔍 Looking for barber: ${barberEmail}\n`);

    // Find barber's admin account
    const barberAdmin = await Admin.findOne({ email: barberEmail, role: 'barber' });

    if (!barberAdmin) {
      console.log('❌ Barber account not found!\n');
      console.log('   Make sure the email is correct and the barber exists.\n');
      process.exit(1);
    }

    console.log('✅ Barber found!');
    console.log(`   Name: ${barberAdmin.name}`);
    console.log(`   Email: ${barberAdmin.email}\n`);

    // Update password
    barberAdmin.password = newPassword;
    await barberAdmin.save();

    console.log('✅ Password reset successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 NEW LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Login URL: /barber`);
    console.log(`   Email: ${barberAdmin.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  Share these credentials with the barber.\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetBarberPassword();
