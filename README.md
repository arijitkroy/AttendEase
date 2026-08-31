# AttendEase - Employee Attendance Management System

A full-stack **Employee Attendance Management System** built with **Node.js (Express)**, **React.js**, and **Firebase / Firestore** database services.

---

## Documentation Chapters

Comprehensive technical documentation is organized in the [`docs/`](./docs/) directory:

| Chapter | Document | Description |
| :--- | :--- | :--- |
| **Chapter 1** | [Architecture & System Overview](./docs/01_architecture_overview.md) | High-level architecture, design principles, request lifecycles. |
| **Chapter 2** | [Backend Implementation Guide](./docs/02_backend_guide.md) | Express server, controllers, middlewares, services, DAO. |
| **Chapter 3** | [Frontend Component Guide](./docs/03_frontend_guide.md) | React component breakdown, AuthContext, PunchCard, Calendar. |
| **Chapter 4** | [Working Hours & Overtime Engine](./docs/04_calculation_engine.md) | Mathematical models for duration, overtime, shortfall, and late scoring. |
| **Chapter 5** | [Automated Leave Deduction System](./docs/05_leave_deduction_system.md) | Leave quotas, workday math, 3-late penalty, approval workflows. |
| **Chapter 6** | [Database Schema & Firestore Design](./docs/06_database_schema.md) | Collections, document field schemas, indexes, security rules. |
| **Chapter 7** | [REST API Reference](./docs/07_api_reference.md) | Full endpoint contracts, request/response bodies, auth headers. |
| **Chapter 8** | [Setup, Environment & Deployment](./docs/08_setup_deployment.md) | Localhost start scripts, Firebase setup, production deployment. |

---

## Core Features

1. **Employee Login & Registration**: Role-based access control (`HR_ADMIN` vs `EMPLOYEE`) with secure JWT authentication and password hashing.
2. **Attendance Check-In / Check-Out**:
   - One-click punch in / out with Work Mode tagging (`Office`, `Remote / WFH`, `On Field`).
   - Active shift live stopwatch & 8-hour shift progress tracker.
   - Break deduction and work location notes.
3. **Working Hours & Overtime Engine**:
   - Precise gross/net duration calculations.
   - Automatic Overtime (`+OT`) calculation when working beyond standard 8-hour shift.
   - Shortfall detection when working under standard shift hours.
4. **Automated Leave Deduction Engine**:
   - Multi-type quota tracking: **Annual (15)**, **Casual (10)**, **Sick (10)**, and **Unpaid / Loss of Pay**.
   - Automated deduction on HR approval.
   - Half-day option support (0.5 day deduction).
   - Late penalty policy tracking (e.g. accumulated late check-ins).
5. **Interactive HR Console**:
   - Live Headcount Command Bar (Present, Active Clocked-In, Late, On Leave, Absent).
   - Department-wise attendance health progress.
   - Quick leave approvals / rejections with feedback comments.
   - Master Attendance logs with date range & employee search filters.
   - Manual Attendance Adjustment modal with audit logging.
   - CSV export for payroll & attendance reporting.
6. **Employee Self-Service Portal**:
   - Live Punch Card with real-time session duration stopwatch.
   - Visual monthly attendance calendar with color-coded daily status badges.
   - Personal leave allowance cards and leave application workflow.
   - Complete punch history with hours breakdown.
7. **Attendance Status Tracking**:
   - Status indicators: `Present`, `Late`, `Half-Day`, `Absent`, `On Leave`, `Active Shift`, `Completed`.

---

## Demo Test Credentials

| Role | Email | Password | Pre-seeded Details |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `hr@company.com` | `Admin@123` | HR Director (Full Admin Access) |
| **Employee 1** | `john.doe@company.com` | `Emp@123` | Senior Frontend Engineer, Engineering |
| **Employee 2** | `sarah.smith@company.com` | `Emp@123` | Product Designer, Design |
| **Employee 3** | `alex.turner@company.com` | `Emp@123` | Technical Product Manager, Product |
| **Employee 4** | `emily.davis@company.com` | `Emp@123` | QA Automation Engineer, QA |

*(A one-click credential selector is also provided directly on the login screen for evaluation.)*

---

## Technology Stack

- **Backend**: Node.js, Express.js, JWT, bcryptjs, Firebase Admin SDK (`firebase-admin`)
- **Frontend**: React 18 (JavaScript), Vite, Tailwind CSS, Lucide React Icons, Firebase Web SDK (`firebase`)
- **Database**: Firebase Firestore (`users`, `attendance`, `leaves`, `settings`, `audit_logs`)

---

## Localhost Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

---

### Method A: Quick Start (Single Command)

#### 1. Clone & Install Dependencies
From the project root directory, install all packages:
```bash
npm run install:all
```

#### 2. Configure Environment Variables
Ensure `backend/.env` points to your Firebase Service Account JSON key:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/adminsdk-fbsvc-550da03604.json
```

#### 3. Seed Database
Populate starter employees, leave requests, and 30 days of attendance history:
```bash
npm run seed
```

#### 4. Launch Both Frontend and Backend Together
Run the single start script:
```bash
npm run dev
```
*(Or double-click `start-dev.bat` on Windows or run `./start-dev.sh` on Mac/Linux)*

Both services will run concurrently:
- **Frontend Web Portal**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000`

---

### Method B: Manual Separate Terminals Setup

#### 1. Setup Backend
```bash
cd backend
npm install
npm run seed
npm start
```

#### 2. Setup Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
