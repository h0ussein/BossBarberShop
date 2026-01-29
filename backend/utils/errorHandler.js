// Centralized error handler - prevents exposing sensitive info in production

const genericErrors = {
  auth: 'Authentication failed',
  server: 'Server error',
  notFound: 'Resource not found',
  validation: 'Validation error',
  forbidden: 'Access denied',
};

export const handleError = (res, error, type = 'server', statusCode = 500) => {
  console.error(`[${type.toUpperCase()}] Error:`, error.message);
  
  // In production, return generic message; in development, return actual error
  const message = process.env.NODE_ENV === 'production' 
    ? genericErrors[type] || genericErrors.server
    : error.message || genericErrors.server;
  
  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default handleError;
