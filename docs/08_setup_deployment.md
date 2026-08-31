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

## 8.2 Full-Stack Deployment to Vercel (Frontend + Backend)

You can host **both the React frontend and Node.js Express backend together on a single Vercel project**.

### Step 1: Import Repository on Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
2. Select your GitHub repository (`arijitkroy/AttendEase`).
3. Leave Framework Preset as **Vite** (or Other).
4. The repository includes [`vercel.json`](../vercel.json) and [`api/index.js`](../api/index.js) which automatically configures the build and routes `/api/*` to the serverless backend function.

### Step 2: Set Environment Variables in Vercel
In the Vercel Dashboard under **Project Settings > Environment Variables**, add:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `JWT_SECRET` | `041e8df85a9...` | Secret key for signing JWT tokens |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | `{"type":"service_account",...}` | Paste the entire content of your Firebase service account JSON as a single-line string |
| *(Alternative)* `FIREBASE_PROJECT_ID` | `your-firebase-project-id` | Firebase Project ID |
| *(Alternative)* `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...` | Service Account Client Email |
| *(Alternative)* `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n..."` | Service Account Private Key |

### Step 3: Deploy
Click **Deploy**. Vercel will build the frontend into `frontend/dist` and deploy the Express API as a serverless function at `/api/*`.

---

## 8.3 Alternative Deployments

### Standalone Backend (Render / Railway / Google Cloud Run)
1. Set start command to `npm start --prefix backend`.
2. Provide environment variables (`PORT`, `JWT_SECRET`, and Firebase credentials).

### Standalone Frontend (Firebase Hosting / Netlify)
1. Build assets: `npm run build --prefix frontend`.
2. Deploy using `firebase deploy --only hosting`.
