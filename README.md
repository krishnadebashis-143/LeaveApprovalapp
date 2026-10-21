# Leave Approval App

Full-stack leave management app with a Spring Boot REST API and a React + TypeScript web frontend. Employees can request and track leave, managers can review requests for their department, and admins can manage approvals and search employee information.

## Requirements

- Java JDK 17+
- Node.js 20+ and npm (for the frontend)
- Docker Desktop (optional, only if using MySQL instead of the local H2 database)

## Run locally

Start the backend in one PowerShell terminal from the project root. The local profile uses a persistent, file-based H2 database, so Docker is not needed:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

Start the frontend in a second PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:5173`. It connects to the backend at `http://localhost:8080` by default. The backend allows the local Vite development origins; set `CORS_ALLOWED_ORIGINS` to a comma-separated list of trusted frontend origins when hosting the frontend elsewhere.

To use MySQL instead of H2, start the database and run the backend with its default profile:

```powershell
docker compose up -d mysql
.\mvnw.cmd spring-boot:run
```

The backend API and Swagger UI are also available at `http://localhost:8080` and `http://localhost:8080/swagger-ui.html`.

## Features

- English and Hindi interface toggle
- Employee dashboard with leave balance, leave applications, and request history
- Manager inbox for department leave approvals and rejections
- Admin approval inbox and employee directory with salary information
- Role-restricted backend endpoints; the UI hides features unavailable to the signed-in role
- Responsive layout for desktop and mobile screens

## Local demo accounts

These accounts are seeded automatically when the `prod` profile is not active. Use them only for local development.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin123!` |
| Manager | `manager@example.com` | `Manager123!` |
| Employee | `employee@example.com` | `Employee123!` |
| Employee | `employee2@example.com` | `Employee123!` |

Get a JWT:

```http
POST /api/auth/login
Content-Type: application/json

{"email":"employee@example.com","password":"Employee123!"}
```

Send the returned `accessToken` as `Authorization: Bearer <token>` for authenticated endpoints. Demo passwords and the development JWT signing key are not suitable for deployment.

## API overview

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/employees/me` | Any authenticated role | View own profile, without salary |
| `GET` | `/api/employees/me/leave-balance` | Any authenticated role | View remaining and pending leave balance |
| `GET` | `/api/employees` | Admin, Manager | Search employees by `name`, `department`, `joinedFrom`, and `joinedTo`; supports `page` and `size` |
| `GET` | `/api/admin/employees` | Admin | Same search with the Admin-only salary DTO |
| `POST` | `/api/leaves` | Any authenticated role | Apply for leave |
| `GET` | `/api/leaves/mine` | Any authenticated role | View own leave requests |
| `GET` | `/api/leaves/inbox` | Admin, Manager | List pending requests; managers see their department only |
| `POST` | `/api/leaves/{id}/decision` | Admin, Manager | Approve or reject a pending request |
| `GET` | `/actuator/health` | Public | Health check |

Example leave application:

```json
{
  "startDate": "2026-11-02",
  "endDate": "2026-11-04",
  "reason": "Family commitment"
}
```

Example decision:

```json
{
  "decision": "REJECT",
  "reviewerNote": "Please choose dates that work with the team schedule."
}
```

Rejection requires a note. Managers can review only requests from their department; Admins can review any department.

## Leave rules

- Leave days are counted inclusively and exclude Saturdays and Sundays. Public holidays are not currently configured.
- Requests must start today or later and contain at least one working day.
- Pending requests count against the balance available for new applications. Overlapping pending or approved requests are rejected.
- The remaining balance is deducted only on approval. Leave state changes and balance updates run transactionally.
- Insufficient-balance and overlap errors return HTTP `409` with a clear message; invalid dates and validation errors return HTTP `400`.

## Configuration

Local database settings can be overridden with `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`. The default local values match `docker-compose.yml`.

For deployment, activate the `prod` profile and provide all of `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and a strong Base64-encoded `JWT_SECRET` of at least 256 bits. The production profile validates the schema instead of modifying it, and demo accounts are not seeded.

## Test

```powershell
.\mvnw.cmd test
```
