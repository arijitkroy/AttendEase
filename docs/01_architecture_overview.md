# Chapter 1: Architecture & System Overview

## 1.1 High-Level Architecture

AttendEase is built as a decoupled, multi-tier Web Application composed of an Express.js REST API backend, a Vite + React.js Single Page Application (SPA), and a Google Cloud Firebase Firestore database layer.

```mermaid
graph TB
    subgraph ClientLayer["Client Layer (React 18 SPA)"]
        direction TB
        EmpPortal["Employee Self-Service<br/>• Real-Time Punch Clock<br/>• Monthly Visual Calendar<br/>• Personal Leave Portal"]
        HRConsole["HR Administrative Console<br/>• Live Headcount Monitor<br/>• Leave Approval Desk<br/>• Employee Directory"]
    end

    subgraph APILayer["Backend REST API (Node.js & Express)"]
        direction TB
        AuthMiddleware["JWT Authentication & RBAC Guard<br/>(requireAuth, requireHR)"]
        
        subgraph Services["Core Calculation & Business Engines"]
            AttService["Attendance Engine<br/>(Hours, Overtime, Shortfalls, Punctuality)"]
            LeaveService["Leave Deduction Engine<br/>(Quota Math, 3-Late Penalties)"]
            DBService["Data Access Service<br/>(Firestore DAO & Local Adapter)"]
        end
        
        AuthMiddleware --> AttService
        AuthMiddleware --> LeaveService
        AuthMiddleware --> DBService
    end

    subgraph DataLayer["Google Cloud Firebase Firestore"]
        direction TB
        ColUsers[("Collection: /users")]
        ColAttendance[("Collection: /attendance")]
        ColLeaves[("Collection: /leaves")]
        ColSettings[("Collection: /settings")]
        ColAudit[("Collection: /audit_logs")]
    end

    EmpPortal -->|HTTP / HTTPS + Bearer JWT| AuthMiddleware
    HRConsole -->|HTTP / HTTPS + Bearer JWT| AuthMiddleware
    DBService -->|Firebase Admin SDK| ColUsers
    DBService -->|Firebase Admin SDK| ColAttendance
    DBService -->|Firebase Admin SDK| ColLeaves
    DBService -->|Firebase Admin SDK| ColSettings
    DBService -->|Firebase Admin SDK| ColAudit
```

---

## 1.2 Core Design Principles

1. **Deterministic Business Rules**: All timestamp math, working hours computations, overtime calculations, and leave deductions execute centrally on the server to prevent client-side clock tampering.
2. **Role-Based Access Control (RBAC)**: Distinct permissions for `HR_ADMIN` (company-wide governance, employee creation, attendance adjustment, leave approvals) and `EMPLOYEE` (self-service punches, personal history, time-off requests).
3. **Dual Persistence Mode**: The application runs natively on live Google Cloud Firestore when configured with a Firebase service account, and features a local JSON persistence fallback for instant out-of-the-box local evaluations.
4. **Sub-second UI Feedback**: Client-side state updates instantly with visual alerts, live stopwatch counters, and toast notifications.

---

## 1.3 Request Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Employee / HR
    participant Client as React Client (Axios)
    participant Server as Express Server
    participant Auth as Auth & RBAC Middleware
    participant Controller as Attendance / Leave Controller
    participant Engine as Calculation Service
    participant DB as Firestore Database

    User->>Client: Clicks "Punch In / Start Shift"
    Client->>Server: POST /api/attendance/check-in (Bearer Token)
    Server->>Auth: Verify JWT & extract user
    Auth->>DB: Validate User status
    DB-->>Auth: User Record
    Auth-->>Server: Injects req.user
    Server->>Controller: checkIn(req, res)
    Controller->>Engine: determineAttendanceStatus(timestamp, shiftRules)
    Engine-->>Controller: Status (PRESENT / LATE)
    Controller->>DB: Write /attendance document
    DB-->>Controller: Confirmed Record
    Controller-->>Client: 200 OK (Attendance JSON)
    Client-->>User: Starts live session stopwatch & shows badge
```
