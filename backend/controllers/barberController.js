import Barber from '../models/Barber.js';
import Admin from '../models/Admin.js';
import imagekit from '../utils/imagekit.js';

// Helper function to generate a random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// @desc    Get all barbers
// @route   GET /api/barbers
// @access  Public
export const getBarbers = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = active === 'true' ? { isActive: true } : {};
    
    const barbers = await Barber.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: barbers.length,
      data: { barbers },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single barber
// @route   GET /api/barbers/:id
// @access  Public
export const getBarber = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }
    
    res.json({
      success: true,
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create barber
// @route   POST /api/barbers
// @access  Private/Admin
export const createBarber = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    
    // Check if email already exists in Admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }
    
    // Create the barber record
    const barber = await Barber.create({ name, email, phone, role });
    
    // Generate a password for the barber's login account
    const password = req.body.password || generatePassword();
    
    // Create login account for the barber
    const adminAccount = await Admin.create({
      name,
      email,
      password,
      role: 'barber',
      barberId: barber._id,
    });
    
    res.status(201).json({
      success: true,
      message: 'Barber created successfully',
      data: { 
        barber,
        // Return the generated password so admin can share it with the barber
        credentials: {
          email,
          password,
          loginUrl: '/barber',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update barber
// @route   PUT /api/barbers/:id
// @access  Private/Admin
export const updateBarber = async (req, res) => {
  try {
    const barber = await Barber.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Barber updated successfully',
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete barber
// @route   DELETE /api/barbers/:id
// @access  Private/Admin
export const deleteBarber = async (req, res) => {
  try {
    const barber = await Barber.findByIdAndDelete(req.params.id);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }
    
    // Also delete the barber's login account
    await Admin.findOneAndDelete({ barberId: req.params.id });
    
    res.json({
      success: true,
      message: 'Barber deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update barber schedule (working hours)
// @route   PUT /api/barbers/:id/schedule
// @access  Private/Admin
export const updateBarberSchedule = async (req, res) => {
  try {
    const { workingHours, breakTime, daysOff } = req.body;
    
    const barber = await Barber.findById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }
    
    if (workingHours) barber.workingHours = workingHours;
    if (breakTime !== undefined) barber.breakTime = breakTime;
    if (daysOff !== undefined) barber.daysOff = daysOff;
    
    await barber.save();
    
    res.json({
      success: true,
      message: 'Barber schedule updated successfully',
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get barber schedule
// @route   GET /api/barbers/:id/schedule
// @access  Public
export const getBarberSchedule = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id).select('name workingHours breakTime daysOff');
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }
    
    res.json({
      success: true,
      data: {
        name: barber.name,
        workingHours: barber.workingHours,
        breakTime: barber.breakTime,
        daysOff: barber.daysOff,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add day off for barber
// @route   POST /api/barbers/:id/dayoff
// @access  Private/Admin
export const addDayOff = async (req, res) => {
  try {
    const { date, reason } = req.body;
    
    const barber = await Barber.findById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }
    
    // Check if day off already exists
    const exists = barber.daysOff.some(d => d.date === date);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Day off already added for this date',
      });
    }
    
    barber.daysOff.push({ date, reason });
    await barber.save();
    
    res.json({
      success: true,
      message: 'Day off added successfully',
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove day off for barber
// @route   DELETE /api/barbers/:id/dayoff/:date
// @access  Private/Admin
export const removeDayOff = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }
    
    barber.daysOff = barber.daysOff.filter(d => d.date !== req.params.date);
    await barber.save();
    
    res.json({
      success: true,
      message: 'Day off removed successfully',
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update barber avatar
// @route   PUT /api/barbers/:id/avatar
// @access  Private/Admin
export const updateBarberAvatar = async (req, res) => {
  try {
    const { url, fileId } = req.body;
    
    const barber = await Barber.findById(req.params.id);
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }
    
    // Delete old image from ImageKit if exists
    if (barber.avatar?.fileId) {
      try {
        await imagekit.deleteFile(barber.avatar.fileId);
      } catch (err) {
        console.log('Failed to delete old avatar:', err.message);
      }
    }
    
    // Update avatar
    barber.avatar = { url, fileId };
    await barber.save();
    
    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
