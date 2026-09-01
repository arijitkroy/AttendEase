# Chapter 1: Architecture & System Overview

## 1.1 High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Client Tier ["Client Tier (React 18 + Vite)"]
        UI[Tailwind UI & Lucide Icons]
        Context[Auth & Session Context]
        AxiosClient[Axios API Client + Interceptors]
        UI --> Context
        Context --> AxiosClient
    end

    subgraph API Tier ["Backend Service Tier (Express REST API)"]
        Router[Express Router]
        AuthGuard[JWT & RBAC Middleware]
        CalcEngine[Working Hours & Overtime Engine]
        LeaveEngine[Leave Quota & Deduction Engine]
        DAO[Database Abstraction Layer]

        Router --> AuthGuard
        AuthGuard --> CalcEngine
        AuthGuard --> LeaveEngine
        CalcEngine --> DAO
        LeaveEngine --> DAO
    end

    subgraph Persistence Tier ["Data Layer (Google Cloud Firestore)"]
        UsersCol[(users)]
        AttCol[(attendance)]
        LeavesCol[(leaves)]
        AuditCol[(audit_logs)]

        DAO --> UsersCol
        DAO --> AttCol
        DAO --> LeavesCol
        DAO --> AuditCol
    end

    AxiosClient -- "REST HTTPS / JWT" --> Router
```

---

## 1.2 End-to-End Punch Lifecycle

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

---

## 1.3 Role-Based Access Control (RBAC) Matrix

| Feature / Resource | Route | `EMPLOYEE` | `HR_ADMIN` |
| :--- | :--- | :---: | :---: |
| **Self Attendance Punch In/Out** | `POST /api/attendance/check-in`, `check-out` | Full Access | Full Access |
| **Personal Attendance History** | `GET /api/attendance/my-history` | Own Records | Own Records |
| **Apply for Leave** | `POST /api/leaves/apply` | Own Quota | Own Quota |
| **View Personal Leave Quota** | `GET /api/leaves/my-leaves` | Own Quota | Own Quota |
| **Live Headcount Command Center** | `GET /api/attendance/hr-metrics` | Denied | Full Access |
| **Master Attendance Logs & Filters**| `GET /api/attendance/all-logs` | Denied | Full Access |
| **Manual Attendance Adjustments** | `PUT /api/attendance/adjust/:id` | Denied | Full Access |
| **Approve / Reject Leave Requests**| `POST /api/leaves/:id/approve`, `reject` | Denied | Full Access |
| **Employee Directory Management** | `POST/PUT/DELETE /api/employees` | Denied | Full Access |
| **CSV Export for Payroll** | `GET /api/attendance/all-logs` | Denied | Full Access |
