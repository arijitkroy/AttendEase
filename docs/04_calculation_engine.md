# Chapter 4: Working Hours & Overtime Calculation Engine

## 4.1 Attendance Status Determination Flowchart

```mermaid
flowchart TD
    StartCheckIn["Check-In Event (Timestamp)"] --> LateCheck{"Check-In Time > (Shift Start + Grace)?"}
    
    LateCheck -->|Yes| SetLate["Initial Status: LATE"]
    LateCheck -->|No| SetPresent["Initial Status: PRESENT"]
    
    SetLate --> ActiveShift["Active Shift Progress"]
    SetPresent --> ActiveShift
    
    ActiveShift --> CheckOutEvent["Check-Out Event (Timestamp)"]
    CheckOutEvent --> ComputeNet["Compute Net Duration = (Checkout - Checkin - Break)"]
    
    ComputeNet --> HoursCheck{"Evaluate Net Working Hours"}
    
    HoursCheck -->|< 4.0 Hours| MarkAbsent["Final Status: ABSENT"]
    HoursCheck -->|4.0 to 6.99 Hours| MarkHalfDay["Final Status: HALF_DAY"]
    HoursCheck -->|>= 7.0 Hours| KeepInitial["Final Status: Retain Initial (PRESENT / LATE)"]
    
    HoursCheck --> OvertimeCheck{"Net Hours > 8.0 Hours Standard?"}
    OvertimeCheck -->|Yes| CalcOT["Overtime = Net Hours - 8.0<br/>Shortfall = 0"]
    OvertimeCheck -->|No| CalcShortfall["Overtime = 0<br/>Shortfall = 8.0 - Net Hours"]
```

---

## 4.2 Working Hours Formula

Working hours are computed using high-precision millisecond timestamps from check-in and check-out events:

$$\text{Gross Minutes} = \left\lfloor \frac{T_{\text{checkout}} - T_{\text{checkin}}}{1000 \times 60} \right\rfloor$$

$$\text{Net Minutes} = \max(0, \text{Gross Minutes} - \text{Break Minutes})$$

$$\text{Duration Hours (Decimal)} = \text{round}\left(\frac{\text{Net Minutes}}{60}, 2\right)$$

$$\text{Formatted Duration} = \left\lfloor \frac{\text{Net Minutes}}{60} \right\rfloor \text{h } (\text{Net Minutes} \bmod 60)\text{m}$$

---

## 4.3 Overtime (OT) & Shortfall Calculations

Given a standard workday requirement of **8.0 hours**:

### Overtime (OT):
$$\text{Overtime Hours} = \begin{cases} \text{Duration Hours} - 8.0 & \text{if } \text{Duration Hours} > 8.0 \\ 0 & \text{otherwise} \end{cases}$$

### Shortfall:
$$\text{Shortfall Hours} = \begin{cases} 8.0 - \text{Duration Hours} & \text{if } \text{Duration Hours} < 8.0 \\ 0 & \text{otherwise} \end{cases}$$

---

## 4.4 Monthly Aggregate Metrics

1. **Punctuality Score (%)**:
   $$\text{Punctuality Score} = \text{round}\left( \frac{\text{Present Days} - \text{Late Days}}{\text{Present Days}} \times 100 \right)$$

2. **Effective Attendance Rate (%)**:
   $$\text{Effective Present Days} = \text{Present Days} + (0.5 \times \text{Half Days})$$
   $$\text{Attendance Rate} = \min\left(100, \text{round}\left( \frac{\text{Effective Present Days}}{\text{Workdays In Month}} \times 100 \right)\right)$$

3. **Average Daily Hours**:
   $$\text{Average Daily Hours} = \text{round}\left( \frac{\text{Total Working Hours}}{\text{Present Days} + \text{Half Days}}, 1 \right)$$
