const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const renewalRoutes = require('./routes/renewals');
const finesRoutes = require('./routes/fines');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');

// Replace SQLite database with Supabase
const { database } = require('./config/supabase');
const { storageSetup } = require('./config/setup-storage');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co"],
    },
  },
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.FRONTEND_URL,
    /^https:\/\/.*\.netlify\.app$/,
    /^https:\/\/.*\.fly\.dev$/
  ].filter(Boolean),
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint with Supabase status
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const connectionTest = await database.testConnection();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        type: 'Supabase',
        status: connectionTest ? 'connected' : 'disconnected'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        type: 'Supabase',
        status: 'error',
        error: error.message
      }
    });
  }
});

// Database status endpoint
app.get('/api/status', authenticateToken, async (req, res) => {
  try {
    const connectionTest = await database.testConnection();
    
    // Get basic statistics
    const { data: userCount, error: userError } = await database.client
      .from('dvla_users')
      .select('id', { count: 'exact', head: true });

    const { data: vehicleCount, error: vehicleError } = await database.client
      .from('dvla_vehicles')
      .select('id', { count: 'exact', head: true });

    const { data: fineCount, error: fineError } = await database.client
      .from('dvla_fines')
      .select('id', { count: 'exact', head: true });

    res.json({
      success: true,
      data: {
        database: {
          connected: connectionTest,
          type: 'Supabase',
          url: process.env.SUPABASE_URL ? 'configured' : 'not configured'
        },
        statistics: {
          users: userError ? 0 : userCount,
          vehicles: vehicleError ? 0 : vehicleCount,
          fines: fineError ? 0 : fineCount
        },
        storage: {
          enabled: true,
          type: 'Supabase Storage'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message
    });
  }
});

// Setup endpoint for initial configuration
app.post('/api/setup', async (req, res) => {
  try {
    // Only allow setup if no admin user exists
    const { data: adminUser, error } = await database.client
      .from('dvla_users')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (adminUser && !error) {
      return res.status(400).json({
        success: false,
        message: 'System is already set up'
      });
    }

    // Run setup script
    const { setupInstance } = require('./scripts/setup-supabase');
    const setupResult = await setupInstance.setup();

    if (setupResult) {
      res.json({
        success: true,
        message: 'System setup completed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'System setup failed'
      });
    }
  } catch (error) {
    console.error('Setup endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', authenticateToken, vehicleRoutes);
app.use('/api/renewals', authenticateToken, renewalRoutes);
app.use('/api/fines', authenticateToken, finesRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/users', authenticateToken, userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize Supabase connection and start server
async function startServer() {
  try {
    console.log('🔧 Initializing DVLA server with Supabase...');

    // Test Supabase connection
    const connectionTest = await database.testConnection();
    
    if (!connectionTest) {
      console.warn('⚠️ Supabase connection failed, but starting server anyway');
      console.warn('   Please check your environment variables:');
      console.warn('   - SUPABASE_URL');
      console.warn('   - SUPABASE_SERVICE_KEY');
      console.warn('   - SUPABASE_ANON_KEY');
    } else {
      console.log('✅ Supabase connection successful');
    }

    // Initialize storage buckets (non-blocking)
    storageSetup.setup()
      .then(() => {
        console.log('✅ Storage buckets initialized');
      })
      .catch((error) => {
        console.warn('⚠️ Storage bucket initialization failed:', error.message);
      });

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 DVLA Dashboard API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Database: Supabase (${connectionTest ? 'connected' : 'disconnected'})`);
      console.log(`📁 Storage: Supabase Storage`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (!connectionTest) {
        console.log('\n🔧 To fix database connection:');
        console.log('1. Set up your Supabase project');
        console.log('2. Add environment variables to .env file');
        console.log('3. Run the schema in Supabase SQL editor');
        console.log('4. Restart the server');
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your .env file exists with Supabase credentials');
    console.error('2. Verify your Supabase project is active');
    console.error('3. Ensure proper network connectivity');
    
    // Still start the server even if Supabase is not configured
    app.listen(PORT, () => {
      console.log(`🚀 DVLA Server started on port ${PORT} (with errors)`);
      console.log(`⚠️ Database functionality may not work properly`);
    });
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
