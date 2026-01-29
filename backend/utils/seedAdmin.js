import Admin from '../models/Admin.js';

export const seedDefaultAdmin = async () => {
  try {
    // Check if any admin exists (since we now use passcode system)
    const existingAdmin = await Admin.findOne({});

    if (!existingAdmin) {
      // Create default admin with passcode
      const defaultAdmin = await Admin.create({
        name: 'Admin',
        passcode: '301103',
        role: 'super_admin',
      });

      console.log('✓ Default admin created:');
      console.log('  Name: Admin');
      console.log('  Passcode: 301103');
      console.log('  Role: super_admin');
    } else {
      console.log('✓ Admin already exists');
    }

    // Log total admin count
    const adminCount = await Admin.countDocuments();
    console.log(`✓ Total admins in database: ${adminCount}`);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};
