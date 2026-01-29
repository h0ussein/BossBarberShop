import Admin from '../models/Admin.js';
import Barber from '../models/Barber.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import { generateToken } from '../utils/generateToken.js';
import imagekit from '../utils/imagekit.js';
import { sendAppointmentConfirmationToCustomer, sendAppointmentCompletionToCustomer } from '../utils/email.js';

// @desc    Barber login
// @route   POST /api/barber-auth/login
// @access  Public
export const loginBarber = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find barber account
    const admin = await Admin.findOne({ email, role: 'barber' }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Get the linked barber record
    const barber = await Barber.findById(admin.barberId);

    const token = generateToken(admin._id, 'barber');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        barber: {
          _id: admin._id,
          barberId: admin.barberId,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          barberRole: barber?.role,
          phone: barber?.phone,
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

// @desc    Get barber profile (their own data)
// @route   GET /api/barber-auth/profile
// @access  Private/Barber
export const getBarberProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const barber = await Barber.findById(admin.barberId);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber record not found',
      });
    }

    res.json({
      success: true,
      data: {
        account: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
        },
        barber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update barber's own schedule
// @route   PUT /api/barber-auth/schedule
// @access  Private/Barber
export const updateOwnSchedule = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const barber = await Barber.findById(admin.barberId);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber record not found',
      });
    }

    const { workingHours, breakTime } = req.body;

    if (workingHours) barber.workingHours = workingHours;
    if (breakTime !== undefined) barber.breakTime = breakTime;

    await barber.save();

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: { barber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add day off for self
// @route   POST /api/barber-auth/dayoff
// @access  Private/Barber
export const addOwnDayOff = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const barber = await Barber.findById(admin.barberId);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber record not found',
      });
    }

    const { date, reason } = req.body;

    // Check if day off already exists
    const exists = barber.daysOff.some((d) => d.date === date);
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

// @desc    Remove day off for self
// @route   DELETE /api/barber-auth/dayoff/:date
// @access  Private/Barber
export const removeOwnDayOff = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const barber = await Barber.findById(admin.barberId);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber record not found',
      });
    }

    barber.daysOff = barber.daysOff.filter((d) => d.date !== req.params.date);
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

// @desc    Get barber's own bookings
// @route   GET /api/barber-auth/bookings
// @access  Private/Barber
export const getOwnBookings = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    const { status, date } = req.query;
    const filter = { barber: admin.barberId };

    if (status) filter.status = status;
    if (date) filter.date = date;

    const bookings = await Booking.find(filter)
      .populate('service', 'name price duration')
      .sort({ date: -1, time: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update booking status (by barber)
// @route   PUT /api/barber-auth/bookings/:id
// @access  Private/Barber
export const updateBookingStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const { status } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      barber: admin.barberId,
    }).populate('service', 'name price duration');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you',
      });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('service', 'name price duration')
      .populate('barber', 'name');

    // Send response immediately
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking },
    });

    // Send email notifications based on status change
    try {
      if (booking.customer.email) {
        const barber = await Barber.findById(admin.barberId);
        
        if (oldStatus === 'pending' && status === 'confirmed') {
          // Barber accepted the appointment - send confirmation to customer
          sendAppointmentConfirmationToCustomer(booking.customer.email, booking.customer.name, {
            barberName: barber.name,
            serviceName: booking.service.name,
            date: booking.date,
            time: booking.time,
            price: booking.service.price,
          }).catch(err => console.error('Failed to send confirmation email:', err));
        } 
        else if (oldStatus === 'confirmed' && status === 'completed') {
          // Barber completed the appointment - send completion email to customer
          sendAppointmentCompletionToCustomer(booking.customer.email, booking.customer.name, {
            barberName: barber.name,
            serviceName: booking.service.name,
            date: booking.date,
            time: booking.time,
            price: booking.service.price,
          }).catch(err => console.error('Failed to send completion email:', err));
        }
      }
    } catch (emailErr) {
      console.error('Email notification error:', emailErr);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Change barber's own password
// @route   PUT /api/barber-auth/password
// @access  Private/Barber
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id).select('+password');

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update barber's own avatar
// @route   PUT /api/barber-auth/avatar
// @access  Private/Barber
export const updateOwnAvatar = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const barber = await Barber.findById(admin.barberId);

    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber record not found',
      });
    }

    const { url, fileId } = req.body;

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
