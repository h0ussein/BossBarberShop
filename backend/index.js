import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import conn from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import barberRoutes from './routes/barberRoutes.js';
import barberAuthRoutes from './routes/barberAuthRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import homepageSectionRoutes from './routes/homepageSectionRoutes.js';
import { seedDefaultAdmin } from './utils/seedAdmin.js';
import { seedInitialData } from './utils/seedData.js';

// Load env vars
dotenv.config();

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - required for rate limiting behind reverse proxy (e.g., Render.com)
app.set('trust proxy', 1);

// Middleware - Only use CORS in development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
}
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/barber-auth', barberAuthRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/homepage-sections', homepageSectionRoutes);

// Health check (API)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BOSS Barbershop API is running',
    version: '1.0.0',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Serve React app for all non-API routes
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  // In development, redirect root to frontend
  app.get('/', (req, res) => {
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  });
}

// Connect to DB and start server
conn()
  .then(async () => {
    // Seed default admin
    await seedDefaultAdmin();
    // Seed initial data (barbers, services, settings)
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API URL: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });
