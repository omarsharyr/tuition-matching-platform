# MERN Stack Deployment Guide

This guide will help you deploy your tuition matching platform using Vercel (frontend) and Render (backend).

## Prerequisites

1. GitHub account with your code pushed to a repository
2. Vercel account (free tier available)
3. Render account (free tier available)
4. MongoDB Atlas database (should already be set up based on your .env)

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account and Service

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Select your repository and branch (main)

### Step 2: Configure Render Service

**Build & Deploy Settings:**
- **Name:** `tuition-platform-backend` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free` (for testing)

### Step 3: Set Environment Variables

In Render dashboard, go to your service > Environment tab and add:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://tuition_user:MyPassword123!@cluster0.tjjdq6p.mongodb.net/tuitionPlatform?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=some_long_random_string
PORT=10000
FRONTEND_URL=https://your-frontend-name.vercel.app
ADMIN_EMAIL=admin@tuition.local
ADMIN_PASSWORD=Admin123!
```

**Important:** Replace `your-frontend-name` with your actual Vercel deployment URL (you'll get this in Part 2).

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your backend
3. Note the URL (e.g., `https://your-backend-name.onrender.com`)

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account and Project

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and click "Import"

### Step 2: Configure Vercel Project

**Project Settings:**
- **Framework Preset:** `Create React App`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (default)
- **Output Directory:** `build` (default)
- **Install Command:** `npm install` (default)

### Step 3: Set Environment Variables

In Vercel dashboard, go to your project > Settings > Environment Variables and add:

```
REACT_APP_API_URL=https://your-backend-name.onrender.com/api
```

**Important:** Replace `your-backend-name` with your actual Render service URL.

### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Note the URL (e.g., `https://your-frontend-name.vercel.app`)

## Part 3: Update Cross-Origin Configuration

### Step 1: Update Backend CORS

Go back to Render dashboard and update the `FRONTEND_URL` environment variable:

```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

### Step 2: Redeploy Backend

In Render dashboard, go to your service and click "Manual Deploy" > "Deploy latest commit"

## Part 4: Testing Your Deployment

### Backend Health Check

Visit: `https://your-backend-name.onrender.com/api/health`

You should see: `{"ok":true}`

### Frontend Test

Visit: `https://your-frontend-name.vercel.app`

Your application should load and be able to communicate with the backend.

## Common Issues and Solutions

### Issue 1: CORS Errors

**Symptoms:** Browser console shows CORS errors
**Solution:** 
- Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
- Redeploy backend after updating environment variables

### Issue 2: API Not Found (404)

**Symptoms:** Frontend can't reach backend APIs
**Solution:**
- Verify `REACT_APP_API_URL` in Vercel environment variables
- Check backend health endpoint works
- Ensure backend is deployed and running

### Issue 3: Database Connection Issues

**Symptoms:** Backend fails to start or database operations fail
**Solution:**
- Verify `MONGO_URI` is correct in Render environment variables
- Check MongoDB Atlas allows connections from all IPs (0.0.0.0/0)

### Issue 4: Build Failures

**Frontend Build Issues:**
- Check for TypeScript errors
- Ensure all dependencies are in package.json
- Check build logs in Vercel dashboard

**Backend Build Issues:**
- Ensure package.json has correct start script
- Check for missing dependencies
- Review build logs in Render dashboard

## Environment Variables Summary

### Render (Backend)
```
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=10000
FRONTEND_URL=https://your-vercel-app.vercel.app
ADMIN_EMAIL=admin@tuition.local
ADMIN_PASSWORD=Admin123!
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-render-app.onrender.com/api
```

## Custom Domains (Optional)

### For Vercel (Frontend)
1. Go to project Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed

### For Render (Backend)
1. Go to service Settings > Custom Domains
2. Add your custom domain
3. Configure DNS as instructed

## Monitoring and Logs

### Vercel
- **Functions tab:** Monitor serverless functions
- **Deployments tab:** View build logs and deployment history

### Render
- **Logs tab:** View application logs
- **Metrics tab:** Monitor performance
- **Events tab:** View deployment events

## Scaling Considerations

### Free Tier Limitations

**Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30+ seconds
- 750 hours/month limit

**Vercel Free Tier:**
- 100GB bandwidth/month
- 1000 serverless function invocations/day

### Upgrading for Production

**Render Paid Plans:**
- Starter: $7/month - Always on, faster builds
- Standard: $25/month - More resources, auto-scaling

**Vercel Paid Plans:**
- Pro: $20/month - More bandwidth and functions
- Team: $99/month - Team features and analytics

This completes your MERN stack deployment! Your application should now be accessible worldwide through the provided URLs.