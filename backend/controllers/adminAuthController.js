import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { passcode } = req.body;

    // Check if passcode provided
    if (!passcode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide passcode',
      });
    }

    // Find the admin (there should be only one admin record)
    const admin = await Admin.findOne({}).select('+passcode');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found. Please contact system administrator.',
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account has been deactivated',
      });
    }

    // Check passcode
    const isMatch = await admin.comparePasscode(passcode);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid passcode',
      });
    }

    const token = generateToken(admin._id, admin.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          role: admin.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          role: admin.role,
          createdAt: admin.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update admin passcode
// @route   PUT /api/admin/passcode
// @access  Private/Admin
export const updatePasscode = async (req, res) => {
  try {
    const { currentPasscode, newPasscode } = req.body;

    // Validate input
    if (!currentPasscode || !newPasscode) {
      return res.status(400).json({
        success: false,
        message: 'Both current and new passcode are required',
      });
    }

    if (newPasscode.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'New passcode must be at least 4 characters',
      });
    }

    // Find admin with current passcode
    const admin = await Admin.findById(req.admin._id).select('+passcode');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Verify current passcode
    const isCurrentMatch = await admin.comparePasscode(currentPasscode);

    if (!isCurrentMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current passcode is incorrect',
      });
    }

    // Update passcode
    admin.passcode = newPasscode;
    await admin.save();

    res.json({
      success: true,
      message: 'Passcode updated successfully',
    });

  } catch (error) {
    console.error('Update passcode error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Fix admin record (temporary diagnostic)
// @route   POST /api/admin/fix
// @access  Public (temporary)
export const fixAdminRecord = async (req, res) => {
  try {
    console.log('🔄 Checking admin records for issues...');
    
    // Find all admin records
    const admins = await Admin.find({}).select('+passcode +password +email');
    console.log(`Found ${admins.length} admin records`);
    
    if (admins.length === 0) {
      // No admins exist - create fresh one
      const newAdmin = await Admin.create({
        name: 'Admin',
        passcode: '301103',
        role: 'super_admin',
        isActive: true
      });
      
      return res.json({
        success: true,
        message: 'New admin created with passcode 301103',
        data: { adminId: newAdmin._id }
      });
    }
    
    // Check each admin record
    let fixedCount = 0;
    for (const admin of admins) {
      let needsUpdate = false;
      const updates = {};
      
      // Ensure required fields exist
      if (!admin.name) {
        updates.name = 'Admin';
        needsUpdate = true;
      }
      
      if (!admin.role) {
        updates.role = 'super_admin';
        needsUpdate = true;
      }
      
      if (admin.isActive === undefined || admin.isActive === null) {
        updates.isActive = true;
        needsUpdate = true;
      }
      
      // Handle passcode issues
      if (!admin.passcode) {
        updates.passcode = '301103';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        // Use findByIdAndUpdate to trigger middleware
        await Admin.findByIdAndUpdate(admin._id, updates);
        fixedCount++;
        console.log(`Fixed admin record: ${admin._id}`);
      }
    }
    
    res.json({
      success: true,
      message: `Admin records checked. ${fixedCount} record(s) fixed.`,
      data: { 
        totalAdmins: admins.length,
        fixedCount: fixedCount,
        defaultPasscode: '301103'
      }
    });
    
  } catch (error) {
    console.error('Fix admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Fix failed',
    });
  }
};

// @desc    Create new admin (super admin only)
// @route   POST /api/admin/create
// @access  Private/SuperAdmin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists with this email',
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all admins
// @route   GET /api/admin/all
// @access  Private/SuperAdmin
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');

    res.json({
      success: true,
      count: admins.length,
      data: { admins },
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update admin
// @route   PUT /api/admin/:id
// @access  Private/SuperAdmin
export const updateAdmin = async (req, res) => {
  try {
    const { name, role, isActive } = req.body;

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    if (name) admin.name = name;
    if (role) admin.role = role;
    if (typeof isActive === 'boolean') admin.isActive = isActive;

    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/:id
// @access  Private/SuperAdmin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    await admin.deleteOne();

    res.json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
