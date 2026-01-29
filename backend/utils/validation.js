import mongoose from 'mongoose';

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id;
};

/**
 * Middleware to validate ObjectId in route params
 * @param {string} paramName - The parameter name to validate (default: 'id')
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }
    
    next();
  };
};

/**
 * Extract only allowed fields from an object (prevents mass assignment)
 * @param {Object} source - Source object (e.g., req.body)
 * @param {string[]} allowedFields - Array of allowed field names
 * @returns {Object} - Object with only allowed fields
 */
export const pickFields = (source, allowedFields) => {
  const result = {};
  
  for (const field of allowedFields) {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  }
  
  return result;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Validate phone number format (international)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Allow international format: +1234567890 or local: 1234567890
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {boolean} - True if valid date format
 */
export const isValidDate = (date) => {
  if (!date || typeof date !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Check if it's a valid date
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

/**
 * Validate time format (HH:MM AM/PM)
 * @param {string} time - Time string to validate
 * @returns {boolean} - True if valid time format
 */
export const isValidTime = (time) => {
  if (!time || typeof time !== 'string') return false;
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
  return timeRegex.test(time.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 50) {
    return { isValid: false, message: 'Password must be less than 50 characters' };
  }
  
  // Optional: Add complexity requirements
  // if (!/[A-Z]/.test(password)) {
  //   return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  // }
  
  return { isValid: true, message: 'Password is valid' };
};

/**
 * Sanitize string input (trim and limit length)
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input, maxLength = 255) => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
};
