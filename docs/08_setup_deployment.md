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

---

## 8.3 Troubleshooting & FAQ

### 1. Port Collision (`EADDRINUSE: port 5000 or 3000`)
If another service is using port 5000 or 3000:
- **Windows (PowerShell)**:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
- **macOS / Linux**:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

### 2. Firebase Credentials Not Found
If the service account JSON key is missing or improperly placed:
- The server will log a warning and automatically fall back to the built-in persistent storage adapter so all functionality continues working seamlessly offline.

### 3. Session Expiration & Automatic Redirection
If a JWT token expires after 7 days, the Axios response interceptor in `frontend/src/api/client.js` automatically clears local storage credentials and redirects the user to `/login`.
