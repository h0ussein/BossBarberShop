import Booking from '../models/Booking.js';
import Barber from '../models/Barber.js';
import Service from '../models/Service.js';
import { sendBookingNotificationToBarber, sendBookingConfirmationToCustomer } from '../utils/email.js';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = async (req, res) => {
  try {
    const { status, date, barber } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (date) filter.date = date;
    if (barber) filter.barber = barber;
    
    const bookings = await Booking.find(filter)
      .populate('barber', 'name')
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

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('barber', 'name')
      .populate('service', 'name price duration');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('barber', 'name email')
      .populate('service', 'name price duration');
    
    // Send response immediately
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: populatedBooking },
    });
    
    // Send email notifications in background (after response sent)
    try {
      const barber = await Barber.findById(booking.barber);
      const service = await Service.findById(booking.service);
      
      if (barber && service) {
        // Send notification to barber
        sendBookingNotificationToBarber(barber.email, barber.name, {
          customerName: booking.customer.name,
          customerPhone: booking.customer.phone,
          serviceName: service.name,
          date: booking.date,
          time: booking.time,
          price: service.price,
          bookingId: booking._id,
        }).catch(err => console.error('Failed to send barber notification:', err));
        
        // Send confirmation to customer if they provided email
        if (booking.customer.email) {
          sendBookingConfirmationToCustomer(booking.customer.email, booking.customer.name, {
            barberName: barber.name,
            serviceName: service.name,
            date: booking.date,
            time: booking.time,
            price: service.price,
          }).catch(err => console.error('Failed to send customer confirmation:', err));
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

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('barber', 'name')
      .populate('service', 'name price duration');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get available time slots
// @route   GET /api/bookings/slots
// @access  Public
export const getAvailableSlots = async (req, res) => {
  try {
    const { date, barber, duration } = req.query;
    
    if (!date || !barber) {
      return res.status(400).json({
        success: false,
        message: 'Date and barber are required',
      });
    }
    
    // Get existing bookings for that date and barber
    const existingBookings = await Booking.find({
      date,
      barber,
      status: { $ne: 'cancelled' },
    }).populate('service', 'duration');
    
    // Return booked times
    const bookedSlots = existingBookings.map((b) => ({
      time: b.time,
      duration: b.service?.duration || 30,
    }));
    
    res.json({
      success: true,
      data: { bookedSlots },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get booking stats
// @route   GET /api/bookings/stats
// @access  Private/Admin
export const getBookingStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [total, pending, confirmed, completed, todayBookings] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ date: today }),
    ]);
    
    // Revenue calculation
    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((acc, b) => acc + (b.price || 0), 0);
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        completed,
        todayBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
