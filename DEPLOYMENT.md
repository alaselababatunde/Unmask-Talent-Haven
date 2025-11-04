# Deployment Guide

## Frontend Deployment (Vercel)

1. **Prepare the frontend:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Deploy to Vercel:**
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel` from the `client` directory
   - Follow the prompts and set environment variables:
     - `VITE_API_URL`: Your backend API URL (e.g., `https://your-api.railway.app/api`)

3. **Alternative: Connect GitHub repository:**
   - Push code to GitHub
   - Import project in Vercel dashboard
   - Set root directory to `client`
   - Add environment variables

## Backend Deployment (Railway/Render)

### Railway

1. **Create a new project:**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure the project:**
   - Select your repository
   - Set root directory to `server`
   - Add environment variables from `.env.example`

3. **Set environment variables:**
   - `PORT`: Auto-set by Railway
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a secure secret
   - `FRONTEND_URL`: Your Vercel frontend URL
   - OAuth credentials (Google, GitHub, Facebook)
   - Cloudinary credentials

4. **Deploy:**
   - Railway will automatically deploy on push
   - Get your API URL from Railway dashboard

### Render

1. **Create a new Web Service:**
   - Connect your GitHub repository
   - Set build command: (leave empty or `cd server && npm install`)
   - Set start command: `cd server && npm start`
   - Set root directory: `server`

2. **Add environment variables:**
   - Same as Railway configuration

3. **Deploy:**
   - Render will build and deploy automatically

## MongoDB Setup

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP addresses (or use 0.0.0.0/0 for development)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/uth-app`

### Local MongoDB

```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB
mongod

# Connection string: mongodb://localhost:27017/uth-app
```

## Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get your credentials from the dashboard:
   - Cloud name
   - API Key
   - API Secret
3. Add these to your backend `.env` file

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-backend.com/api/auth/google/callback`
6. Copy Client ID and Secret

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `https://your-backend.com/api/auth/github/callback`
4. Copy Client ID and Secret

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs: `https://your-backend.com/api/auth/facebook/callback`
5. Copy App ID and Secret

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] MongoDB connected
- [ ] Cloudinary configured
- [ ] OAuth callbacks working
- [ ] Environment variables set correctly
- [ ] CORS configured for frontend URL
- [ ] API endpoints responding
- [ ] File uploads working
- [ ] Authentication working

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check CORS configuration in `server.js`

### OAuth Redirect Issues
- Verify callback URLs match exactly in OAuth provider settings
- Check that `FRONTEND_URL` is set correctly

### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure Cloudinary account is active

### Database Connection
- Verify MongoDB connection string
- Check network access (IP whitelist for Atlas)
- Ensure database user has correct permissions

