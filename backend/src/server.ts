import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import routes from './routes';
import { setupSocketIO } from './config/socket';
import prisma from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Setup Socket.IO
export const io = setupSocketIO(httpServer);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Task Collaboration Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      boards: '/api/boards',
      lists: '/api/boards/:boardId/lists',
      tasks: '/api/lists/:listId/tasks',
      activities: '/api/boards/:boardId/activities',
      search: '/api/search',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\nShutting down gracefully...');

  // Close database connection
  await prisma.$disconnect();

  // Close HTTP server
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` Socket.IO is ready for connections`);
  console.log(` Database connected`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
