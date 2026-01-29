import Barber from '../models/Barber.js';
import Admin from '../models/Admin.js';
import imagekit from '../utils/imagekit.js';
import { isValidObjectId, pickFields } from '../utils/validation.js';

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
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
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
      message: 'Server error',
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
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
    // Only allow specific fields to be updated (prevents mass assignment)
    const allowedFields = ['name', 'email', 'phone', 'role', 'isActive', 'avatar'];
    const updates = pickFields(req.body, allowedFields);
    
    const barber = await Barber.findByIdAndUpdate(
      req.params.id,
      updates,
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
      message: 'Server error',
    });
  }
};

// @desc    Delete barber
// @route   DELETE /api/barbers/:id
// @access  Private/Admin
export const deleteBarber = async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
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
      message: 'Server error',
    });
  }
};

// @desc    Update barber schedule (working hours)
// @route   PUT /api/barbers/:id/schedule
// @access  Private/Admin
export const updateBarberSchedule = async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
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
      message: 'Server error',
    });
  }
};

// @desc    Get barber schedule
// @route   GET /api/barbers/:id/schedule
// @access  Public
export const getBarberSchedule = async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
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
      message: 'Server error',
    });
  }
};

// @desc    Add day off for barber
// @route   POST /api/barbers/:id/dayoff
// @access  Private/Admin
export const addDayOff = async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
    const { date, reason } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }
    
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
    
    barber.daysOff.push({ date: String(date), reason: reason ? String(reason) : '' });
    await barber.save();
    
    res.json({
      success: true,
      message: 'Day off added successfully',
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Remove day off for barber
// @route   DELETE /api/barbers/:id/dayoff/:date
// @access  Private/Admin
export const removeDayOff = async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
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
      message: 'Server error',
    });
  }
};

// @desc    Update barber avatar
// @route   PUT /api/barbers/:id/avatar
// @access  Private/Admin
export const updateBarberAvatar = async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
    const { url, fileId } = req.body;
    
    if (!url || !fileId) {
      return res.status(400).json({
        success: false,
        message: 'URL and fileId are required',
      });
    }
    
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
        // Silent fail - old image cleanup is not critical
      }
    }
    
    // Update avatar
    barber.avatar = { url: String(url), fileId: String(fileId) };
    await barber.save();
    
    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
