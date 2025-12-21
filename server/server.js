import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import passport from './config/oauth.js';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

// Routes
import authRoutes from './routes/authRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import userRoutes from './routes/userRoutes.js';
import balanceRoutes from './routes/balanceRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';


dotenv.config();

// Check for required Cloudinary environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.warn('\x1b[33m%s\x1b[0m', '⚠️  WARNING: Missing Cloudinary configuration. Video/Image uploads will fail.');
  console.warn('\x1b[33m%s\x1b[0m', `   Missing variables: ${missingEnvVars.join(', ')}`);
  console.warn('\x1b[33m%s\x1b[0m', '   Please add them to your server/.env file.');
}

const app = express();
const httpServer = http.createServer(app);

// CORS: allow configured origin, localhost, and this project's Vercel preview domains
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps, curl

    const explicitAllowed = [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_2,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:3000',
      'https://localhost:5173',
    ].filter(Boolean);

    const isExplicit = explicitAllowed.includes(origin);
    const isVercelPreviewForApp = /vercel\.app$/i.test(origin) && origin.includes('unmask-talent-haven-client');

    if (isExplicit || isVercelPreviewForApp) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/user', userRoutes);
app.use('/api/balance', balanceRoutes);

import notificationRoutes from './routes/notificationRoutes.js';
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'UTH API is running' });
});

const PORT = process.env.PORT || 5000;

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, cb) => {
      // reuse CORS policy
      if (!origin) return cb(null, true);
      const ok = /vercel\.app$/i.test(origin) && origin.includes('unmask-talent-haven-client');
      const explicit = [process.env.FRONTEND_URL, process.env.FRONTEND_URL_2, 'http://localhost:3000', 'http://localhost:5173', 'https://localhost:3000', 'https://localhost:5173'].filter(Boolean);
      if (ok || explicit.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
  },
});

// expose io to request handlers via app.locals
app.set('io', io);

io.on('connection', (socket) => {
  // join creators room by default
  const room = 'creators';
  socket.join(room);

  // allow clients to join their personal room for direct notifications
  socket.on('join', (payload) => {
    try {
      const userId = payload?.userId;
      if (userId) {
        socket.join(`user:${userId}`);
      }
    } catch (e) {
      // ignore
    }
  });

  socket.on('join_live', (payload) => {
    try {
      const streamId = payload?.streamId;
      if (streamId) {
        const room = `live:${streamId}`;
        socket.join(room);
        const count = io.sockets.adapter.rooms.get(room)?.size || 0;
        io.to(room).emit('viewer_count', { count });
      }
    } catch (e) {
      // ignore
    }
  });

  socket.on('leave_live', (payload) => {
    try {
      const streamId = payload?.streamId;
      if (streamId) {
        const room = `live:${streamId}`;
        socket.leave(room);
        const count = io.sockets.adapter.rooms.get(room)?.size || 0;
        io.to(room).emit('viewer_count', { count });
      }
    } catch (e) {
      // ignore
    }
  });

  socket.on('message', (payload) => {
    // expect { text, userId, username, room? }
    const out = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: String(payload?.text || ''),
      userId: String(payload?.userId || ''),
      username: String(payload?.username || 'anon'),
      room: payload?.room || room,
      createdAt: new Date().toISOString(),
    };
    io.to(out.room).emit('message', out);
  });

  socket.on('disconnect', () => {
    // no-op
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global error handler for JSON responses
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.code || err.name || null;
  res.status(status).json({ message, details });
});

