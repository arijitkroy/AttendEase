# Chapter 8: Setup, Environment & Deployment Guide

## 8.1 Local Development Setup

### 1. Install All Dependencies
```bash
npm run install:all
```

### 2. Configure Backend `.env`
Create `backend/.env` with your JWT secret and Firebase Service Account key path:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/adminsdk-fbsvc-550da03604.json
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Single-Command Launch
```bash
npm run dev
```
*(Runs backend on port 5000 and frontend on port 3000 concurrently).*

---

## 8.2 Production Deployment

### Backend Deployment (Node.js Server / Cloud Platform)
1. Install production dependencies:
   ```bash
   npm install --production --prefix backend
   ```
2. Set environment variables:
   - `PORT`: `5000`
   - `JWT_SECRET`: `<secure_jwt_secret>`
   - `FIREBASE_PROJECT_ID`: `<project_id>`
   - `FIREBASE_CLIENT_EMAIL`: `<client_email>`
   - `FIREBASE_PRIVATE_KEY`: `<private_key>`
3. Run the start command:
   ```bash
   npm run server
   ```

### Frontend Deployment (Static Hosting)
1. Build production static bundle:
   ```bash
   npm run build
   ```
2. Serve the generated `frontend/dist` directory using any static web server (Firebase Hosting, NGINX, Apache, AWS S3 / CloudFront).
