import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

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

// Admin schema
const adminSchema = new mongoose.Schema({
  name: String,
  passcode: String,
  role: String,
  barberId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// Barber schema
const barberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const Barber = mongoose.model('Barber', barberSchema);

// Check status
const checkStatus = async () => {
  try {
    await conn();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ADMIN STATUS CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check admins
    const admins = await Admin.find({}).select('+passcode');
    console.log(`📊 Total Admins: ${admins.length}\n`);

    if (admins.length === 0) {
      console.log('⚠️  NO ADMIN FOUND IN DATABASE!\n');
    } else {
      for (const admin of admins) {
        console.log('👤 Admin Found:');
        console.log(`   ID: ${admin._id}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Created: ${admin.createdAt}`);
        
        // Test passcode
        if (admin.passcode) {
          const isMatch = await bcrypt.compare('123456', admin.passcode);
          console.log(`   Passcode "123456" works: ${isMatch ? '✅ YES' : '❌ NO'}`);
        }
        console.log('');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 BARBER EMAIL CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check for duplicate email
    const duplicateEmail = 'houssein.ibrahim.3@gmail.com';
    const barbersWithEmail = await Barber.find({ email: duplicateEmail });
    
    console.log(`🔍 Searching for: ${duplicateEmail}`);
    console.log(`📊 Found: ${barbersWithEmail.length} barber(s)\n`);

    if (barbersWithEmail.length > 0) {
      console.log('⚠️  DUPLICATE FOUND! Details:\n');
      for (const barber of barbersWithEmail) {
        console.log(`   Name: ${barber.name}`);
        console.log(`   Email: ${barber.email}`);
        console.log(`   Phone: ${barber.phone}`);
        console.log(`   ID: ${barber._id}`);
        console.log(`   Active: ${barber.isActive}`);
        console.log('   ---');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkStatus();
