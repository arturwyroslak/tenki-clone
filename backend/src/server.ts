import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import workspaceRoutes from './routes/workspaces';
import projectRoutes from './routes/projects';
import runnerRoutes from './routes/runners';
import githubRoutes from './routes/github';
import billingRoutes from './routes/billing';
import analyticsRoutes from './routes/analytics';
import migrationRoutes from './routes/migration';
import webhookRoutes from './routes/webhooks';

// Import middleware
import { errorHandler } from './middleware/error';
import { authenticateToken } from './middleware/auth';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Initialize databases
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Make databases available globally
app.set('prisma', prisma);
app.set('redis', redis);
app.set('io', io);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', authenticateToken, workspaceRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/runners', authenticateToken, runnerRoutes);
app.use('/api/github', authenticateToken, githubRoutes);
app.use('/api/billing', authenticateToken, billingRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/migration', authenticateToken, migrationRoutes);
app.use('/api/webhooks', webhookRoutes); // No auth for webhooks

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);
    logger.info(`Client ${socket.id} joined workspace ${workspaceId}`);
  });
  
  socket.on('leave-workspace', (workspaceId) => {
    socket.leave(`workspace:${workspaceId}`);
    logger.info(`Client ${socket.id} left workspace ${workspaceId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

export { app, prisma, redis, io };