# Vercel Deployment Guide for UTH Client

## Quick Deploy

### Option 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to client directory:
   ```bash
   cd client
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts and set environment variables when asked.

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

### Required:
- `VITE_API_URL` - Your backend API URL (e.g., `https://your-backend.railway.app/api`)

### Production Setup:
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your deployed backend URL (e.g., `https://uth-app-backend.railway.app/api`)
   - **Environment**: Production, Preview, Development

## Build Settings

Vercel will automatically detect Vite, but if needed, configure:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Post-Deployment

1. **Update Backend CORS**: 
   - In your backend `.env`, set `FRONTEND_URL` to your Vercel URL
   - Example: `FRONTEND_URL=https://uth-app.vercel.app`

2. **Test OAuth Callbacks**:
   - Update OAuth provider callback URLs to your Vercel domain
   - Google: `https://your-app.vercel.app/auth/callback`
   - GitHub: `https://your-app.vercel.app/auth/callback`
   - Facebook: `https://your-app.vercel.app/auth/callback`

3. **Verify API Connection**:
   - Test that frontend can reach backend API
   - Check browser console for any CORS errors

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### API Not Working
- Verify `VITE_API_URL` is set correctly
- Check backend CORS configuration
- Ensure backend is deployed and accessible

### OAuth Not Working
- Verify callback URLs in OAuth providers match Vercel URL
- Check that `FRONTEND_URL` is set in backend

## Custom Domain

1. Add custom domain in Vercel Dashboard
2. Update DNS records as instructed
3. Update `FRONTEND_URL` in backend with new domain
4. Update OAuth callback URLs


