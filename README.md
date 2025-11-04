# UTH – Unmask Talent Haven

A full-stack web application for showcasing talents, earning global support, and connecting with mentors. Built with React, TypeScript, Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication**: Email/password and social login (Google, GitHub, Facebook)
- **Video Feed**: TikTok-style feed for watching talent videos
- **Upload**: Support for video, audio, poetry, and sign language content
- **Balance**: Track earnings and manage withdrawals
- **AI Chat**: Motivational AI assistant (mock UI)
- **Profile**: User profiles with achievements and badges
- **Supporters**: View and manage supporters/donors

## 🛠️ Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Router

**Backend:**
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- OAuth (Passport.js)
- Cloudinary (Media Storage)

## 📁 Project Structure

```
uth-app/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── api/
│   │   └── App.tsx
│   └── package.json
├── server/          # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
└── package.json
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Cloudinary account (for media uploads)
- OAuth credentials (Google, GitHub, Facebook)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd uth-app
```

2. Install dependencies:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. Set up environment variables:

**Server (.env):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/uth-app
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Client (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development servers:

```bash
# From root directory
npm run dev

# Or separately:
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

5. Open your browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎨 Design

The app uses a dark theme with:
- **Deep Purple**: #5A2A83
- **Rich Brown**: #7B4B27
- **Matte Black**: #1C1C1C
- **Accent Beige**: #F5F5DC

## 📡 API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth
- `GET /api/auth/facebook` - Facebook OAuth

### Feed
- `GET /api/feed` - Get all posts
- `POST /api/feed` - Create new post
- `POST /api/feed/:id/like` - Like/unlike post
- `POST /api/feed/:id/comment` - Add comment

### User
- `GET /api/user/:id` - Get user profile
- `PUT /api/user/:id` - Update user profile

### Balance
- `GET /api/balance` - Get user balance
- `POST /api/balance/withdraw` - Withdraw funds
- `GET /api/balance/supporters` - Get supporters list

## 🚢 Deployment

### Frontend (Vercel)

1. Build the frontend:
```bash
cd client && npm run build
```

2. Deploy to Vercel:
```bash
vercel deploy
```

### Backend (Render/Railway)

1. Set environment variables in your hosting platform
2. Deploy the server directory
3. Update `FRONTEND_URL` in server `.env` to your Vercel URL

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

