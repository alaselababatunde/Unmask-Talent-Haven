import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import passport from './config/oauth.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import userRoutes from './routes/userRoutes.js';
import balanceRoutes from './routes/balanceRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';

dotenv.config();

const app = express();

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'UTH API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

