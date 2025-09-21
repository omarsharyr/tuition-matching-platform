# MERN Project Deployment Guide

This guide will walk you through deploying your tuition matching platform using Vercel for the frontend and Render for the backend.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- MongoDB Atlas account for database (or use your existing MongoDB)

## Part 1: Backend Deployment on Render

### Step 1: Prepare Your Backend Code

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**:
   - Visit [render.com](https://render.com)
   - Sign up/login with your GitHub account

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository: `tuition-matching-platform`

3. **Configure the Service**:
   - **Name**: `tuition-platform-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**:
   Add these environment variables in Render:
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=https://your-app-name.vercel.app
   UPLOADS_DIR=uploads
   ADMIN_EMAIL=admin@tuition.local
   ADMIN_PASSWORD=Admin123!
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL: `https://your-service-name.onrender.com`

### Step 3: MongoDB Setup

If using MongoDB Atlas:
1. Create a new cluster at [mongodb.com](https://cloud.mongodb.com)
2. Get your connection string
3. Update the `MONGO_URI` environment variable in Render

## Part 2: Frontend Deployment on Vercel

### Step 1: Update Frontend Configuration

1. **Update your frontend environment variables**:
   Create/update `frontend/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

2. **Update vercel.json** (already done):
   - The `vercel.json` file has been configured for your React app
   - Make sure to update the backend URL in the env section

### Step 2: Deploy on Vercel

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account

2. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

3. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Set Environment Variables**:
   In Vercel project settings → Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL: `https://your-app-name.vercel.app`

### Step 3: Update Backend CORS Configuration

1. **Update Backend Environment Variables**:
   In Render, update the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   ```

2. **Update server.js CORS configuration**:
   The CORS configuration has been updated to include your Vercel domain.
   Make sure to replace `"https://your-app-name.vercel.app"` with your actual Vercel URL.

## Part 3: Final Configuration

### Step 1: Update URLs

1. **In backend/server.js**:
   - Replace `"https://your-app-name.vercel.app"` with your actual Vercel URL

2. **In frontend/vercel.json**:
   - Replace `"https://your-backend-url.onrender.com/api"` with your actual Render URL

### Step 2: Test Your Deployment

1. **Test Backend**:
   - Visit `https://your-backend-url.onrender.com/api/health`
   - Should return `{"ok": true}`

2. **Test Frontend**:
   - Visit your Vercel URL
   - Test user registration, login, and other features

### Step 3: Set Up Automatic Deployments

Both Vercel and Render will automatically redeploy when you push to your main branch on GitHub.

## Environment Variables Summary

### Backend (Render)
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=https://your-app-name.vercel.app
UPLOADS_DIR=uploads
ADMIN_EMAIL=admin@tuition.local
ADMIN_PASSWORD=Admin123!
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Make sure your Vercel URL is added to the CORS configuration in server.js
   - Update the `FRONTEND_URL` environment variable in Render

2. **Build Failures**:
   - Check that all dependencies are in package.json
   - Ensure build commands are correct

3. **Database Connection Issues**:
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0 for Render
   - Check connection string format

4. **File Upload Issues**:
   - Note that Render's free tier has ephemeral storage
   - Consider using cloud storage (AWS S3, Cloudinary) for production

## Security Notes

- Change default admin credentials before going live
- Use strong JWT secrets
- Regularly update dependencies
- Consider rate limiting for production

## Monitoring

- Render provides logs and metrics
- Vercel provides analytics and performance monitoring
- Set up error tracking (Sentry, LogRocket, etc.)

## Cost Considerations

- **Render Free Tier**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Vercel Free Tier**: 100GB bandwidth, unlimited sites
- **MongoDB Atlas**: 512MB free tier

For production, consider upgrading to paid tiers for better performance and uptime.
