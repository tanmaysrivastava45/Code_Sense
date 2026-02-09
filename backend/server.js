import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/mongodb.js';
import { initializeJWTSecret } from './utils/secretManager.js';


// Import routes with error handling
let authRoutes, analysisRoutes, collaborationRoutes, initializeSocket;

try {
  const authModule = await import('./routes/auth.js');
  authRoutes = authModule.default;
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

try {
  const analysisModule = await import('./routes/analysis.js');
  analysisRoutes = analysisModule.default;
  console.log('✅ Analysis routes loaded');
} catch (error) {
  console.error('❌ Failed to load analysis routes:', error.message);
}

try {
  const collabModule = await import('./routes/collaboration.js');
  collaborationRoutes = collabModule.default;
  console.log('✅ Collaboration routes loaded');
} catch (error) {
  console.error('❌ Failed to load collaboration routes:', error.message);
}

try {
  const socketModule = await import('./socket/socketServer.js');
  initializeSocket = socketModule.initializeSocket;
  console.log('✅ Socket module loaded');
} catch (error) {
  console.error('❌ Failed to load socket module:', error.message);
}

dotenv.config({ path: '../.env' });
initializeJWTSecret();
await connectDB();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://code-sense-mu.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize Socket.io
if (initializeSocket) {
  try {
    initializeSocket(httpServer);
    console.log('✅ Socket.io initialized');
  } catch (error) {
    console.error('❌ Socket.io init failed:', error.message);
  }
}

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'CodeSense API - By Tanmay Srivastava',
    status: 'running',
    version: '1.0.0'
  });
});

// API health check
app.get('/api', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'CodeSense API is running',
    version: '1.0.0'
  });
});

// Register API routes
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered at /api/auth');
} else {
  console.error('❌ Auth routes not registered');
}

if (analysisRoutes) {
  app.use('/api/analysis', analysisRoutes);
  console.log('✅ Analysis routes registered at /api/analysis');
} else {
  console.error('❌ Analysis routes not registered');
}

if (collaborationRoutes) {
  app.use('/api/collaboration', collaborationRoutes);
  console.log('✅ Collaboration routes registered at /api/collaboration');
} else {
  console.error('❌ Collaboration routes not registered');
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    availableRoutes: [
      'GET /',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/analysis/analyze',
      'POST /api/analysis/analyze-all',
      'GET /api/analysis/history'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 CodeSense Server Started');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌐 CORS: ${allowedOrigins.length} origins allowed\n`);
});
