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

### Frontend (Firebase Hosting / Vercel / Netlify)
1. Build the production assets:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy via Firebase CLI:
   ```bash
   firebase deploy --only hosting
   ```

### Backend (Render / Railway / Cloud Run)
1. Set the following environment variables in your cloud hosting provider:
   - `PORT`: `5000`
   - `JWT_SECRET`: `<secure-random-secret>`
   - `FIREBASE_PROJECT_ID`: `<project-id>`
   - `FIREBASE_CLIENT_EMAIL`: `<client-email>`
   - `FIREBASE_PRIVATE_KEY`: `<full-private-key-with-\n>`
2. Start command:
   ```bash
   npm start
   ```
