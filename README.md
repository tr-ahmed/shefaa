# Shefaa Smart Clinic Management System

> A diploma project at Cairo University — Institute of Statistical Studies and Research.

Shefaa is a web-based platform that digitises medical clinic operations:
patient appointment booking, doctor scheduling, electronic medical records,
notifications, reviews, and reporting.

This repository is a **mono-repo** containing:

| Folder | Stack | Purpose |
| --- | --- | --- |
| [`Shefaa.Api/`](Shefaa.Api/) | ASP.NET Core 9 Web API + EF Core + Identity + JWT | Backend HTTP API |
| [`shefaa-client/`](shefaa-client/) | Angular 18 + Material + Tailwind (RTL/EN) | Frontend SPA |

---

## 1. Project status

- ✅ **Phase 1 — Domain & database**
- ✅ **Phase 2 — Backend API surface** (auth, CRUD, business logic, notifications, reviews)
- ✅ **Phase 3 — Complete feature coverage**
  - Email service + password reset (forgot/reset flow)
  - File upload for medical-record attachments
  - Doctor time-off (vacation / sick leave)
  - Reporting & analytics (dashboard, top doctors, monthly revenue)
  - Global exception handler
  - Rate limiting (10/min/IP on auth endpoints, 200/min general)
  - Custom validation filter (uniform error envelope)
  - Static file serving (uploaded attachments)
  - Health endpoint
- ✅ **Phase 4 — Modern frontend (Angular 18)**
  - Public site (home, doctor & clinic directories)
  - Auth pages (login, register, forgot/reset password)
  - Patient portal (dashboard, 4-step booking wizard, records, profile)
  - Doctor portal (dashboard, appointments, schedule, time-off, records)
  - Admin portal (dashboard, appointments, full CRUD for specialties/clinics/doctors, reports)
  - RTL Arabic + LTR English with live toggle
  - Notification bell + dialogs
  - Material 18 + Tailwind 3 modern UI/UX

---

## 2. Architecture (Backend)

```
Shefaa.Api (clean architecture)
└── src/
    ├── Shefaa.Domain          # Entities, enums, base classes (no dependencies)
    ├── Shefaa.Application     # Service interfaces, DTOs, common helpers (no ASP.NET deps)
    ├── Shefaa.Infrastructure  # EF Core, Identity stores, JWT, services, email, attachments, reports
    │   ├── Persistence/Configurations (one file per aggregate)
    │   ├── Persistence/Migrations (EF Core migrations)
    │   ├── Identity (JwtTokenService)
    │   └── Services (Auth, Specialty, Clinic, Doctor, Patient, Appointment,
    │                 MedicalRecord, Notification, Review, Attachment, Reporting, Email)
    └── Shefaa.Api             # Controllers, middleware, filters, Program.cs
        ├── Controllers        # Auth, Specialties, Clinics, Doctors, Patients,
        │                       Appointments, MedicalRecords, Notifications, Reviews,
        │                       Attachments, Reports
        ├── Extensions         # ServiceCollection extensions (DB, Identity, JWT, Swagger, CORS, services, seed)
        ├── Middleware         # GlobalExceptionMiddleware
        ├── Filters            # ValidationFilter
        └── wwwroot/uploads    # Uploaded attachments (served as static files)
```

---

## 3. Tech stack

| | |
| --- | --- |
| Backend | ASP.NET Core 9 Web API |
| ORM | EF Core 9 (Code-First) |
| DB | SQL Server (LocalDB for dev) |
| Auth | ASP.NET Identity + JWT |
| Docs | Swashbuckle / Swagger UI |
| Rate limit | ASP.NET Core built-in rate limiter |
| Email | System.Net.Mail (SMTP) — disabled in dev (logged instead) |
| File upload | Multipart form-data to `wwwroot/uploads` |

---

## 4. Getting started

```powershell
cd Shefaa.Api
dotnet restore
dotnet ef database update --project src/Shefaa.Infrastructure --startup-project src/Shefaa.Api
dotnet run --project src/Shefaa.Api
```

Open:

- **Swagger UI**: <http://localhost:5xxx/swagger>
- **Health**: <http://localhost:5xxx/health>

### Default seeded credentials

| Role | Email | Password |
| --- | --- | --- |
| SystemAdmin | `admin@shefaa.local` | `Admin@1234` |

5 sample specialties are also seeded.

---

## 5. API Endpoints (46 routes)

See [`Shefaa.Api/README.md`](Shefaa.Api/README.md) for the full endpoint table.

Highlights:

- **Auth**: register, login, refresh, forgot/reset password, me, change-password, logout (rate-limited)
- **Specialties / Clinics / Doctors / Patients**: full CRUD + filtering, RBAC enforced
- **Doctor schedules**: weekly recurring slots
- **Doctor time-off**: blocks time for slots computation
- **Available slots**: dynamic computation respecting schedule + time-off + existing bookings
- **Appointments**: book / reschedule / cancel / status transitions (with status history)
- **Medical records**: diagnosis + prescriptions + attachments
- **Attachments**: upload (≤10 MB), download, delete
- **Notifications**: per-user, read/unread, mark all read
- **Reviews**: post-completion, rating recomputed for doctor
- **Reports**: dashboard, top doctors, monthly revenue

---

## 6. Response envelope

All endpoints return a uniform envelope:

```json
{
  "success": true,
  "message": "Specialty created.",
  "data": { ... },
  "errors": []
}
```

Validation errors return 400 with `success: false` and per-field errors.

---

## 7. Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": { "ShefaaConnection": "Server=...;Database=ShefaaDb;..." },
  "JwtSettings": {
    "SecretKey": "...",
    "Issuer": "Shefaa.Api",
    "Audience": "Shefaa.Client",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 14
  },
  "Cors": { "AllowedOrigins": ["http://localhost:4200"] },
  "Smtp": {
    "Enabled": false,
    "Host": "smtp.example.com",
    "Port": 587,
    "UseSsl": true,
    "UFrontend (`shefaa-client/`)

Modern Angular 18 SPA. See [`shefaa-client/README.md`](shefaa-client/README.md) for full details.

Quick start:

```powershell
cd shefaa-client
npm install
npm start          # http://localhost:4200
npm run build      # Production build
```

Update `src/environments/environment.ts` if backend is not on `http://localhost:5099/api`.

---10

## 9. sername": "...",
    "Password": "..."
  },
  "App": { "FrontendBaseUrl": "http://localhost:4200" }
}
```

---

## 8. Team

Cairo University — Institute of Statistical Studies and Research, Department of Computer and Information Sciences (January 2026).

---

## 9. License

Educational / diploma project. All rights reserved by the team members.