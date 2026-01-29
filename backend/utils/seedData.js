import Barber from '../models/Barber.js';
import Service from '../models/Service.js';
import Settings from '../models/Settings.js';
import Deal from '../models/Deal.js';

export const seedInitialData = async () => {
  try {
    // Seed Barbers
    const barberCount = await Barber.countDocuments();
    if (barberCount === 0) {
      const barbers = [
        { name: 'Ahmed', email: 'ahmed@boss.com', phone: '+1234567890', role: 'Senior Barber', isActive: true },
        { name: 'Omar', email: 'omar@boss.com', phone: '+1234567891', role: 'Barber', isActive: true },
        { name: 'Khalid', email: 'khalid@boss.com', phone: '+1234567892', role: 'Junior Barber', isActive: true },
      ];
      await Barber.insertMany(barbers);
      console.log('✓ Default barbers created');
    }

    // Seed Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const services = [
        { name: 'Classic Haircut', description: 'Traditional haircut with scissors and clippers', price: 25, duration: 30, isActive: true },
        { name: 'Beard Trim', description: 'Shape and trim your beard', price: 15, duration: 20, isActive: true },
        { name: 'Hair + Beard Combo', description: 'Complete grooming package', price: 35, duration: 45, isActive: true },
        { name: 'Kids Cut', description: 'Haircut for children under 12', price: 18, duration: 25, isActive: true },
        { name: 'Skin Fade', description: 'Modern fade haircut', price: 30, duration: 40, isActive: true },
      ];
      await Service.insertMany(services);
      console.log('✓ Default services created');
    }

    // Seed Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      const settings = {
        shopName: 'BOSS Barbershop',
        tagline: 'Premium Grooming',
        phone: '+1 234 567 890',
        email: 'hello@bossbarbershop.com',
        address: '123 Main Street, Downtown, City 12345',
        instagram: '@bossbarbershop',
        slotDuration: 30,
        workingHours: [
          { day: 'Monday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
          { day: 'Tuesday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
          { day: 'Wednesday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
          { day: 'Thursday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
          { day: 'Friday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
          { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '21:00' },
          { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '18:00' },
        ],
      };
      await Settings.create(settings);
      console.log('✓ Default settings created');
    }

    // Seed Deals (for Deals & Promotions page)
    const dealCount = await Deal.countDocuments();
    if (dealCount === 0) {
      const deals = [
        { title: 'First Visit Discount', description: 'Get 20% off your first haircut when you book online.', code: 'WELCOME20', validUntil: 'Mar 31, 2026' },
        { title: 'Combo Deal', description: 'Hair + Beard combo for just $30 (save $5).', code: 'COMBO5', validUntil: 'Feb 28, 2026' },
        { title: 'Refer a Friend', description: 'Refer a friend and both get $10 off your next visit.', code: 'REFER10', validUntil: 'Ongoing' },
      ];
      await Deal.insertMany(deals);
      console.log('✓ Default deals created');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error.message);
  }
};
