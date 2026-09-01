# Chapter 7: REST API Reference

## 7.1 Authentication Header
All protected endpoints require an `Authorization` header containing the JWT bearer token:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 7.2 Auth Endpoints

### 1. Register Employee
`POST /api/auth/register`

#### Request Body:
```json
{
  "name": "Alex Johnson",
  "email": "alex@company.com",
  "password": "Password@123",
  "department": "Engineering",
  "position": "Frontend Developer",
  "role": "EMPLOYEE",
  "shiftStartTime": "09:00",
  "shiftEndTime": "17:00"
}
```

#### Response (201 Created):
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "usr_emp_05",
    "name": "Alex Johnson",
    "email": "alex@company.com",
    "role": "EMPLOYEE"
  }
}
```

### 2. Login
`POST /api/auth/login`

#### Request Body:
```json
{
  "email": "john.doe@company.com",
  "password": "Emp@123"
}
```

---

## 7.3 Attendance Endpoints

### 1. Check-In
`POST /api/attendance/check-in`

#### Request Body:
```json
{
  "workMode": "OFFICE",
  "location": "HQ Floor 4",
  "notes": "Arrived on time"
}
```

### 2. Check-Out
`POST /api/attendance/check-out`

#### Request Body:
```json
{
  "notes": "Completed daily sprints",
  "breakMinutes": 30
}
```

### 3. Get Today's Status
`GET /api/attendance/today`

#### Response:
```json
{
  "success": true,
  "date": "2026-08-31",
  "status": "CHECKED_IN",
  "attendance": {
    "checkInTime": "2026-08-31T09:05:00.000Z",
    "workMode": "OFFICE",
    "status": "PRESENT"
  }
}
```

### 4. HR Attendance Metrics
`GET /api/attendance/hr-metrics` *(Requires `HR_ADMIN` role)*

#### Response:
```json
{
  "success": true,
  "metrics": {
    "totalEmployees": 5,
    "checkedInCount": 3,
    "presentTodayCount": 4,
    "lateTodayCount": 1,
    "onLeaveTodayCount": 1,
    "absentTodayCount": 0
  }
}
```

### 5. Query Master Attendance Logs
`GET /api/attendance/all-logs?startDate=2026-08-01&endDate=2026-08-31&page=1&limit=20&department=Engineering` *(Requires `HR_ADMIN` role)*

#### Query Parameters:
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `startDate` | `string` | Filter records on or after `YYYY-MM-DD` |
| `endDate` | `string` | Filter records on or before `YYYY-MM-DD` |
| `department` | `string` | Filter by department (`Engineering`, `Design`, etc.) |
| `status` | `string` | Filter by status (`PRESENT`, `LATE`, `HALF_DAY`, `ON_LEAVE`, `ABSENT`) |
| `page` | `number` | Page index (default: `1`) |
| `limit` | `number` | Number of records per page (optional) |
| `search` | `string` | Search substring for employee name or ID |

#### Response:
```json
{
  "success": true,
  "count": 48,
  "page": 1,
  "totalPages": 3,
  "records": [
    {
      "id": "doc_123",
      "date": "2026-08-31",
      "employeeName": "John Doe",
      "workingHours": 8.5,
      "status": "PRESENT"
    }
  ]
}
```

---

## 7.4 Leave Endpoints

### 1. Submit Leave Request
`POST /api/leaves/apply`

#### Request Body:
```json
{
  "leaveType": "CASUAL",
  "startDate": "2026-09-10",
  "endDate": "2026-09-11",
  "isHalfDay": false,
  "reason": "Personal family event"
}
```

### 2. Approve Leave
`POST /api/leaves/:id/approve` *(Requires `HR_ADMIN` role)*

#### Request Body:
```json
{
  "comments": "Approved by HR management"
}
```

### 3. Reject Leave
`POST /api/leaves/:id/reject` *(Requires `HR_ADMIN` role)*

#### Request Body:
```json
{
  "rejectionReason": "Project release deadline during this window"
}
```
