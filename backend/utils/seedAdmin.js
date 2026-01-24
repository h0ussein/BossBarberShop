import Admin from '../models/Admin.js';

export const seedDefaultAdmin = async () => {
  try {
    // Check if the default admin exists
    const existingAdmin = await Admin.findOne({ email: 'admin@gmail.com' });

    if (!existingAdmin) {
      // Create default super admin
      const defaultAdmin = await Admin.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'super_admin',
      });

      console.log('✓ Default admin created:');
      console.log('  Email: admin@gmail.com');
      console.log('  Password: admin123');
      console.log('  Role: super_admin');
    } else {
      console.log('✓ Default admin already exists (admin@gmail.com)');
    }

    // Log total admin count
    const adminCount = await Admin.countDocuments();
    console.log(`✓ Total admins in database: ${adminCount}`);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};
