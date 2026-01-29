import Admin from '../models/Admin.js';

export const seedDefaultAdmin = async () => {
  try {
    // Check if any admin exists (since we now use passcode system)
    const existingAdmin = await Admin.findOne({});

    if (!existingAdmin) {
      // Get passcode from environment variable
      const defaultPasscode = process.env.DEFAULT_ADMIN_PASSCODE;
      
      if (!defaultPasscode) {
        console.error('⚠ DEFAULT_ADMIN_PASSCODE not set in .env - skipping admin creation');
        console.error('  Add DEFAULT_ADMIN_PASSCODE to your .env file (min 6 characters)');
        return;
      }
      
      if (defaultPasscode.length < 6) {
        console.error('⚠ DEFAULT_ADMIN_PASSCODE must be at least 6 characters');
        return;
      }
      
      // Create default admin with passcode from env
      const defaultAdmin = await Admin.create({
        name: 'Admin',
        passcode: defaultPasscode,
        role: 'super_admin',
      });

      console.log('✓ Default admin created');
      console.log('  Name: Admin');
      console.log('  Role: super_admin');
      console.log('  ⚠ Change the passcode after first login!');
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
