import mongoose from 'mongoose';
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

const barberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const Barber = mongoose.model('Barber', barberSchema);

const removeDuplicateBarber = async () => {
  try {
    await conn();

    const duplicateEmail = 'houssein.ibrahim.3@gmail.com';
    const barberId = '697b56f5e16e3490f1f19909';

    console.log('\n⚠️  About to delete barber:');
    console.log(`   Email: ${duplicateEmail}`);
    console.log(`   ID: ${barberId}\n`);

    // Find and delete
    const result = await Barber.findByIdAndDelete(barberId);

    if (result) {
      console.log('✅ Barber deleted successfully!');
      console.log(`   Name: ${result.name}`);
      console.log(`   Email: ${result.email}\n`);
      console.log('You can now add a new barber with this email.\n');
    } else {
      console.log('❌ Barber not found with that ID.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

removeDuplicateBarber();
