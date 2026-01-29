import Settings from '../models/Settings.js';
import { pickFields } from '../utils/validation.js';

// Default working hours
const defaultWorkingHours = [
  { day: 'Monday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
  { day: 'Tuesday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
  { day: 'Wednesday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
  { day: 'Thursday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
  { day: 'Friday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
  { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '21:00' },
  { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '18:00' },
];

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        workingHours: defaultWorkingHours,
      });
    }
    
    // Prevent browser caching to always get fresh data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    // Only allow specific fields (prevents mass assignment)
    const allowedFields = ['shopName', 'tagline', 'phone', 'email', 'address', 'instagram', 'slotDuration', 'workingHours'];
    const updates = pickFields(req.body, allowedFields);
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        ...updates,
        workingHours: updates.workingHours || defaultWorkingHours,
      });
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update working hours
// @route   PUT /api/settings/hours
// @access  Private/Admin
export const updateWorkingHours = async (req, res) => {
  try {
    const { workingHours, slotDuration } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        workingHours: workingHours || defaultWorkingHours,
        slotDuration: slotDuration || 30,
      });
    } else {
      if (workingHours) settings.workingHours = workingHours;
      if (slotDuration) settings.slotDuration = slotDuration;
      await settings.save();
    }
    
    res.json({
      success: true,
      message: 'Working hours updated successfully',
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
