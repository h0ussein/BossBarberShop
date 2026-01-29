import crypto from 'crypto';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { generateToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      // If user exists but not verified, allow resending verification
      if (!userExists.isEmailVerified) {
        const verificationToken = userExists.generateVerificationToken();
        await userExists.save();

        // Send verification email (don't fail registration if email fails)
        try {
          const emailResult = await sendVerificationEmail(email, userExists.name, verificationToken);
          
          if (!emailResult.success) {
            console.error('Failed to resend verification email:', emailResult.error);
            // Still return success, user can use resend verification button
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // Still return success, user can use resend verification button
        }

        return res.status(200).json({
          success: true,
          message: 'Verification email sent. Please check your inbox. If you don\'t receive it, use the resend button.',
          requiresVerification: true,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      isEmailVerified: false,
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(email, name, verificationToken);

      if (!emailResult.success) {
        console.error('Failed to send verification email:', emailResult.error);
        // Still return success but log the error
        // User can use resend verification if email fails
      }
    } catch (emailError) {
      console.error('Email sending error during registration:', emailError);
      // Still allow registration to succeed, user can resend verification
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token and check if not expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Generate auth token
    const authToken = generateToken(user._id, 'user');

    res.json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: true,
        },
        token: authToken,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    try {
      const emailResult = await sendVerificationEmail(email, user.name, verificationToken);

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please check your email configuration or try again later.',
          error: process.env.NODE_ENV === 'development' ? emailResult.error?.message : undefined,
        });
      }

      res.json({
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
      });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id, 'user');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset email has been sent.',
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(email, user.name, resetToken);

      if (!emailResult.success) {
        // Clear the reset token if email fails
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        console.error('Password reset email failed:', emailResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send reset email. Please try again later.',
          error: process.env.NODE_ENV === 'development' ? emailResult.error?.message : undefined,
        });
      }

      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset email has been sent.',
      });
    } catch (emailError) {
      // Clear the reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error('Password reset email error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token and check if not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Set new password (will be hashed by the pre-save middleware)
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate auth token
    const authToken = generateToken(user._id, 'user');

    res.json({
      success: true,
      message: 'Password reset successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
        },
        token: authToken,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during password reset',
    });
  }
};

// @desc    Get user appointments
// @route   GET /api/auth/appointments
// @access  Private
export const getUserAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: 'User email not found',
      });
    }

    // Find all bookings for this user's email
    const bookings = await Booking.find({
      'customer.email': user.email,
    })
      .populate('barber', 'name')
      .populate('service', 'name duration')
      .sort({ date: -1, time: -1 }); // Most recent first

    // Separate upcoming and past appointments based on current date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const upcomingAppointments = [];
    const pastAppointments = [];

    bookings.forEach(booking => {
      // Parse booking date
      const bookingDate = new Date(booking.date);
      const bookingDateStr = booking.date;

      // If booking is today or in the future, it's upcoming
      if (bookingDateStr >= todayStr) {
        // For today's appointments, also check if time has passed
        if (bookingDateStr === todayStr) {
          // Parse time and check if it's still upcoming
          const [timeStr, period] = booking.time.split(' ');
          const [hours, minutes] = timeStr.split(':').map(Number);
          let bookingHours = hours;
          
          if (period === 'PM' && hours !== 12) {
            bookingHours += 12;
          } else if (period === 'AM' && hours === 12) {
            bookingHours = 0;
          }
          
          const bookingTime = new Date();
          bookingTime.setHours(bookingHours, minutes, 0, 0);
          
          if (bookingTime > today) {
            upcomingAppointments.push(booking);
          } else {
            pastAppointments.push(booking);
          }
        } else {
          upcomingAppointments.push(booking);
        }
      } else {
        pastAppointments.push(booking);
      }
    });

    // Sort upcoming appointments by date/time (earliest first)
    upcomingAppointments.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(a.date) - new Date(b.date);
      }
      // Same date, sort by time
      return a.time.localeCompare(b.time);
    });

    // Sort past appointments by date/time (most recent first)
    pastAppointments.sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      // Same date, sort by time (most recent first)
      return b.time.localeCompare(a.time);
    });

    res.json({
      success: true,
      data: {
        upcomingAppointments,
        pastAppointments,
        totalBookings: bookings.length,
      },
    });

  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
