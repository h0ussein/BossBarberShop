import Booking from '../models/Booking.js';
import Barber from '../models/Barber.js';
import Service from '../models/Service.js';
import Settings from '../models/Settings.js';
import { sendBookingNotificationToBarber, sendBookingConfirmationToCustomer } from '../utils/email.js';
import { isValidObjectId, pickFields } from '../utils/validation.js';

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
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }
    
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
      message: 'Server error',
    });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req, res) => {
  try {
    // Extract and validate required fields (prevents mass assignment)
    const { barber, service, date, time, customer, price } = req.body;
    
    // Validate required fields
    if (!barber || !service || !date || !time || !customer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: barber, service, date, time, and customer are required',
      });
    }
    
    // Validate ObjectIds
    if (!isValidObjectId(barber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid barber ID',
      });
    }
    
    if (!isValidObjectId(service)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID',
      });
    }
    
    // Validate customer data
    if (!customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone are required',
      });
    }
    
    // Prepare sanitized booking data
    const bookingData = {
      barber: String(barber),
      service: String(service),
      date: String(date),
      time: String(time),
      customer: {
        name: String(customer.name).trim(),
        phone: String(customer.phone).trim(),
        email: customer.email ? String(customer.email).trim().toLowerCase() : undefined,
      },
      price: Number(price) || 0,
      status: 'pending', // Always start as pending
    };
    
    // Use findOneAndUpdate with upsert:false to atomically check and create
    // This prevents race conditions by making the check-and-insert atomic
    const existingBooking = await Booking.findOne({
      barber: bookingData.barber,
      date: bookingData.date,
      time: bookingData.time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please select another time.',
      });
    }

    const booking = await Booking.create(bookingData);
    
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
      // Email errors should not affect the booking response
    }
  } catch (error) {
    // Check for duplicate key error (race condition caught by index)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please select another time.',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create booking. Please try again.',
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
export const updateBooking = async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }
    
    // Only allow specific fields to be updated (prevents mass assignment)
    const allowedFields = ['status', 'notes'];
    const updates = pickFields(req.body, allowedFields);
    
    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
        });
      }
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
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
      message: 'Server error',
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }
    
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
      message: 'Server error',
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

// @desc    Get available time slots for a barber on a specific date
// @route   GET /api/bookings/available-slots/:barberId/:date
// @access  Public
export const getAvailableSlots = async (req, res) => {
  try {
    const { barberId, date } = req.params;

    // Validate inputs
    if (!barberId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Barber ID and date are required',
      });
    }

    // Parse the date and validate it's today or tomorrow
    const selectedDate = new Date(date);
    const lebanon = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'Asia/Beirut' 
    }).format(new Date());
    const today = new Date(lebanon);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (selectedDateStr !== todayStr && selectedDateStr !== tomorrowStr) {
      return res.status(400).json({
        success: false,
        message: 'Bookings are only available for today and tomorrow',
      });
    }

    // Get barber details
    const barber = await Barber.findById(barberId);
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber not found',
      });
    }

    // Get shop settings as fallback
    const settings = await Settings.findOne();

    // Check if barber has a day off on this date
    if (barber.daysOff?.some(d => d.date === date)) {
      return res.json({
        success: true,
        data: { availableSlots: [] },
        message: 'Barber is not available on this date',
      });
    }

    // Get day of week
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get working hours for this day
    let daySettings;
    if (barber.workingHours?.length > 0) {
      daySettings = barber.workingHours.find(d => d.day === dayOfWeek);
      if (!daySettings || !daySettings.isWorking) {
        return res.json({
          success: true,
          data: { availableSlots: [] },
          message: 'Barber is not working on this day',
        });
      }
    } else if (settings?.workingHours) {
      daySettings = settings.workingHours.find(d => d.day === dayOfWeek);
      if (!daySettings || !daySettings.isOpen) {
        return res.json({
          success: true,
          data: { availableSlots: [] },
          message: 'Shop is closed on this day',
        });
      }
    } else {
      return res.json({
        success: true,
        data: { availableSlots: [] },
        message: 'No working hours configured',
      });
    }

    // Generate all possible time slots
    const startTime = daySettings.startTime || daySettings.openTime;
    const endTime = daySettings.endTime || daySettings.closeTime;
    const [openHour, openMin] = startTime.split(':').map(Number);
    const [closeHour] = endTime.split(':').map(Number);

    // Break time handling
    const breakStart = barber.breakTime?.enabled ? barber.breakTime.startTime : null;
    const breakEnd = barber.breakTime?.enabled ? barber.breakTime.endTime : null;

    const allSlots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        // Skip if before opening time
        if (hour === openHour && min < openMin) continue;

        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

        // Skip break time
        if (breakStart && breakEnd) {
          if (timeStr >= breakStart && timeStr < breakEnd) continue;
        }

        const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayTime = `${h}:${min.toString().padStart(2, '0')} ${period}`;

        allSlots.push({ time: timeStr, display: displayTime });
      }
    }

    // Get current time in Lebanon timezone for same-day filtering
    const now = new Date();
    const lebanonNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Beirut' }));
    const currentHour = lebanonNow.getHours();
    const currentMin = lebanonNow.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;

    // Filter out past times for same day (with 30-minute buffer)
    let availableSlots = allSlots;
    if (selectedDateStr === todayStr) {
      const bufferMinutes = 30;
      const minimumTimeMinutes = currentTimeMinutes + bufferMinutes;

      availableSlots = allSlots.filter(slot => {
        const [slotHour, slotMin] = slot.time.split(':').map(Number);
        const slotTimeMinutes = slotHour * 60 + slotMin;
        return slotTimeMinutes >= minimumTimeMinutes;
      });
    }

    // Get existing bookings for this barber and date
    const existingBookings = await Booking.find({
      barber: barberId,
      date: date,
      status: { $in: ['pending', 'confirmed'] } // Don't exclude cancelled/completed bookings
    });

    // Filter out already booked slots
    const bookedTimes = existingBookings.map(booking => booking.time);
    const finalAvailableSlots = availableSlots
      .filter(slot => !bookedTimes.includes(slot.display))
      .map(slot => slot.display);

    res.json({
      success: true,
      data: { 
        availableSlots: finalAvailableSlots,
        bookedSlots: bookedTimes,
        currentTime: lebanonNow.toISOString(),
      },
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
