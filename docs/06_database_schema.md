# Chapter 6: Database Schema & Firestore Design

## 6.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ ATTENDANCE : "logs daily"
    USERS ||--o{ LEAVES : "submits"
    USERS ||--o{ AUDIT_LOGS : "performs changes"

    USERS {
        string id PK "Unique User Key (usr_...)"
        string employeeId "Company ID (EMP-1001)"
        string name "Full Name"
        string email "Unique Login Email"
        string password "Bcrypt Hash"
        string role "HR_ADMIN | EMPLOYEE"
        string department "Engineering, Design, etc."
        string position "Job Title"
        string shiftStartTime "e.g. 09:00"
        string shiftEndTime "e.g. 17:00"
        map leaveBalances "Annual, Casual, Sick, Unpaid"
        boolean isActive "Active account status"
    }

    ATTENDANCE {
        string id PK "Unique Document Key"
        string userId FK "References USERS.id"
        string employeeId "Company ID"
        string date "Date (YYYY-MM-DD)"
        string checkInTime "ISO 8601 Timestamp"
        string checkOutTime "ISO 8601 Timestamp"
        string workMode "OFFICE | WORK_FROM_HOME | ON_FIELD"
        float workingHours "Net Working Hours"
        float overtimeHours "Hours > 8.0"
        float shortfallHours "Hours < 8.0"
        int breakMinutes "Deducted Break"
        string status "PRESENT | LATE | HALF_DAY | ABSENT | ON_LEAVE"
        string notes "Punch description"
    }

    LEAVES {
        string id PK "Unique Document Key"
        string userId FK "References USERS.id"
        string leaveType "ANNUAL | CASUAL | SICK | UNPAID"
        string startDate "Start Date (YYYY-MM-DD)"
        string endDate "End Date (YYYY-MM-DD)"
        boolean isHalfDay "0.5 Day flag"
        float requestedDays "Calculated Workdays"
        string status "PENDING | APPROVED | REJECTED"
        string reason "Employee justification"
        string approvedBy "HR Reviewer name"
        string reviewComments "Feedback notes"
    }

    AUDIT_LOGS {
        string id PK "Unique Document Key"
        string action "e.g. ADJUST_ATTENDANCE"
        string recordId "Modified Record Key"
        string performedBy "Admin email"
        map changes "Modified fields payload"
        string timestamp "ISO 8601 Timestamp"
    }
```

---

## 6.2 Schema Definitions

### 1. Collection: `/users`
Stores employee profiles, credentials, shift parameters, and leave allowances.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g. `usr_emp_01`) |
| `employeeId` | `string` | Human-readable company ID (e.g. `EMP-1002`) |
| `name` | `string` | Full Name |
| `email` | `string` | Login email (unique, lowercase) |
| `password` | `string` | Bcrypt password hash (10 salt rounds) |
| `role` | `string` | `HR_ADMIN` or `EMPLOYEE` |
| `department` | `string` | Engineering, Design, Product, QA, HR, etc. |
| `position` | `string` | Job Title / Designation |
| `shiftStartTime` | `string` | Scheduled start time in 24h format (e.g. `09:00`) |
| `shiftEndTime` | `string` | Scheduled end time in 24h format (e.g. `17:00`) |
| `joinDate` | `string` | Date of joining (`YYYY-MM-DD`) |
| `isActive` | `boolean` | Account active state |
| `leaveBalances` | `map` | `{ ANNUAL: number, CASUAL: number, SICK: number, UNPAID: number }` |

---

### 2. Collection: `/attendance`
Stores daily attendance records, punch timestamps, and calculated hours.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique document ID |
| `userId` | `string` | Reference to `/users/{userId}` |
| `employeeId` | `string` | Employee ID |
| `employeeName`| `string` | Employee Name |
| `department` | `string` | Department |
| `date` | `string` | Date of shift (`YYYY-MM-DD`) |
| `checkInTime` | `string` | ISO 8601 Timestamp of check-in |
| `checkOutTime`| `string` | ISO 8601 Timestamp of check-out (or `null`) |
| `workMode` | `string` | `OFFICE`, `WORK_FROM_HOME`, or `ON_FIELD` |
| `location` | `string` | Location tag or office floor |
| `workingHours`| `number` | Net hours worked (decimal) |
| `overtimeHours`| `number`| Hours exceeding 8.0 standard shift |
| `shortfallHours`| `number`| Hours under 8.0 standard shift |
| `breakMinutes`| `number` | Break duration deducted from gross time |
| `status` | `string` | `PRESENT`, `LATE`, `HALF_DAY`, `ABSENT`, `ON_LEAVE` |
| `notes` | `string` | Check-in or check-out notes |

---

### 3. Collection: `/leaves`
Stores leave applications and review decisions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique document ID |
| `userId` | `string` | Reference to `/users/{userId}` |
| `employeeId` | `string` | Employee ID |
| `employeeName`| `string` | Employee Name |
| `department` | `string` | Department |
| `leaveType` | `string` | `CASUAL`, `SICK`, `ANNUAL`, `UNPAID` |
| `startDate` | `string` | Start date (`YYYY-MM-DD`) |
| `endDate` | `string` | End date (`YYYY-MM-DD`) |
| `isHalfDay` | `boolean`| Whether request is for half-day (0.5 day) |
| `requestedDays`| `number`| Total business days requested |
| `reason` | `string` | Employee reason |
| `status` | `string` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `appliedAt` | `string` | ISO 8601 creation timestamp |
| `approvedBy` | `string` | Reviewer name |
| `reviewComments`| `string`| HR approval/rejection feedback |
