# Backend Description and Frontend Integration

## Overview

The backend is a unified Python FastAPI service providing REST APIs for authentication, plate recognition, vehicle records, violations lifecycle, and DVLA operations. It serves all frontends (Main, DVLA, Police, Supervisor) through a single API base: `http://localhost:8000` (configurable).

## Architecture

- Framework: FastAPI + Uvicorn
- Entry: `backend/main.py`
- Business logic: `backend/services/`
- Data models: `backend/models/`
- Database: Supabase (PostgreSQL) via `backend/database/supabase_client.py`
- Auth: JWT (HS256) with role claims
- CORS: Allows localhost dev and Netlify origin

```text
Frontends ──▶ src/lib/unified-api.ts ──▶ FastAPI (backend/main.py) ──▶ Supabase (Postgres)
```

### Runtime Components

- FastAPI application instance in `backend/main.py` wires CORS, security (`HTTPBearer`), and endpoint routing.
- Each endpoint delegates to a focused service class (auth, vehicles, violations, dvla, plate recognition).
- Supabase client (`database/supabase_client.py`) centralizes DB access and error handling.
- Pydantic models in `backend/models/*` validate inputs/outputs and enforce consistent contracts across services and frontends.

## Key Modules

- `services/auth_service.py`: User login/registration, password hashing, JWT issuance
- `services/plate_recognition_service.py`: OCR pipeline (EasyOCR/OpenCV) for plate detection
- `services/vehicle_service.py`: Vehicle CRUD/query against Supabase tables
- `services/violation_service.py`: Violation CRUD, filtering, stats, approvals
- `services/dvla_service.py`: DVLA users, vehicles, renewals, fines, analytics

### Notable Model Contracts

- `models/user.py` defines `User`, `UserCreate`, `UserLogin`, enums for `UserRole`, `UserStatus`.
- `models/vehicle.py` defines `Vehicle`, `VehicleCreate`, enums for `VehicleType`, `VehicleStatus`.
- `models/violation.py` defines `Violation`, `ViolationCreate`, enums for `ViolationType`, `ViolationStatus`, `ViolationSeverity`.
- `models/dvla.py` defines DVLA-specific objects (`DVLAUser`, `DVLAVehicle`, `DVLARenewal`, `DVLAFine`, `DVLAAnalytics`).

## API Endpoints (selected)

- Auth
  - POST `/auth/login`
  - POST `/auth/register`
- Plate recognition
  - POST `/plate-recognition` (Bearer token required)
- Vehicles
  - GET `/vehicles/{plate_number}` (Bearer token)
- Violations
  - GET `/violations` (filters: `plate_number`, `status`)
  - POST `/violations`
  - PUT `/violations/{id}/approve`
  - PUT `/violations/{id}/reject`
- DVLA
  - POST `/dvla/auth/login`, `/dvla/auth/register`
  - GET `/dvla/vehicles`, GET `/dvla/vehicles/{id}`, GET `/dvla/vehicles/reg/{reg_number}`
  - POST `/dvla/vehicles`, PUT `/dvla/vehicles/{id}`
  - GET `/dvla/renewals`, POST `/dvla/renewals`, PUT `/dvla/renewals/{id}/status`
  - GET `/dvla/fines`, POST `/dvla/fines`, PUT `/dvla/fines/{fine_id}/payment`, PUT `/dvla/fines/{fine_id}/clear`
  - GET `/dvla/analytics`
- Supervisor analytics
  - GET `/analytics/violations`, GET `/analytics/officers`

All protected routes use `HTTPBearer` auth. `get_current_user` decodes JWT and supplies `sub` (user id) to handlers.

### Request/Response Examples

#### Authentication

- Request
```bash
curl -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"4231220075","password":"Wattaddo020"}'
```
- Response
```json
{ "access_token": "<jwt>", "token_type": "bearer", "user_role": "admin" }
```

Use the returned token in `Authorization: Bearer <jwt>` for protected endpoints.

#### Vehicle Lookup

- Request
```bash
curl -H "Authorization: Bearer $TOKEN" "$API/vehicles/GR%201234%20-%2023"
```
- Response (example)
```json
{
  "id": "...",
  "plate_number": "GR 1234 - 23",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "owner_name": "Kwame Asante",
  "status": "active",
  "expiry_date": "2025-01-15T00:00:00Z"
}
```

#### Create Violation

- Request
```bash
curl -X POST "$API/violations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "plate_number": "GR 1234 - 23",
    "violation_type": "speeding",
    "severity": "major",
    "location": "Ring Road Central, Accra",
    "description": "Exceeded by 20km/h",
    "fine_amount": 200
  }'
```
- Response (201)
```json
{ "id": "...", "plate_number": "GR 1234 - 23", "status": "pending" }
```

#### DVLA Analytics

- Request
```bash
curl -H "Authorization: Bearer $TOKEN" "$API/dvla/analytics"
```
- Response (example)
```json
{
  "total_vehicles": 1250,
  "total_renewals": 850,
  "total_fines": 125,
  "pending_renewals": 45,
  "unpaid_fines": 23,
  "revenue_this_month": 12500.0,
  "renewal_rate": 95.5,
  "fine_payment_rate": 78.2
}
```

## Data Flow and Storage

- Supabase tables used include: `users`, `vehicles`, `violations`, `dvla_users`, `dvla_vehicles`, `dvla_renewals`, `dvla_fines`, and `pending_approvals`.
- Services interact with Supabase via `database/supabase_client.py` using the service key `SUPABASE_SERVICE_KEY`.

### Supabase Access Pattern

- Read: `supabase.table("<name>").select("*").<filters>().execute()`
- Create: `supabase.table("<name>").insert(payload).execute()`
- Update: `supabase.table("<name>").update(changes).eq("id", key).execute()`
- Count: pass `count="exact"` to `select` when tallying records

All timestamps are ISO strings; services convert to/from `datetime` as needed.

## Frontend Integration

- Unified client: `src/lib/unified-api.ts`
  - Base URL from `VITE_API_BASE_URL` (defaults to `http://localhost:8000`).
  - Attaches `Authorization: Bearer <token>` from `localStorage('auth_token')`.
  - Mirrors backend routes (auth, vehicles, violations, DVLA, analytics).
  - Provides robust mock responses when backend is unavailable or during localhost dev.

- App-specific adapters:
  - Root admin app uses `src/lib/api.ts` to wrap `unifiedAPI` for auth and workflow helpers.
  - Other frontends (DVLA/Police/Supervisor) also rely on the unified client for consistency.

### Typical Flows

- Login
  1) Frontend calls `unifiedAPI.login()` → POST `/auth/login` or `/dvla/auth/login`.
  2) Backend validates user (Supabase), issues JWT with role.
  3) Frontend stores token and role in localStorage.

- Vehicle lookup
  1) Frontend calls `GET /vehicles/{plate}` via `unifiedAPI.getVehicleByPlate()`.
  2) Backend queries Supabase and returns a unified `Vehicle` payload.

- Violation lifecycle
  1) Police submits via `POST /violations`.
  2) Supervisor reviews via `GET /violations` and takes action: `PUT /violations/{id}/approve|reject`.
  3) DVLA may create/clear fines; analytics aggregate via `/dvla/analytics`.

### Integration Notes per Frontend

- Main (root `src/`): Uses `unifiedAPI` for dashboard data, violations table, user flows. Mock data supports dev mode when backend is off.
- DVLA (`DVLA/src/`): Reads and writes DVLA vehicles, renewals, fines via `/dvla/*` endpoints. Analytics page consumes `/dvla/analytics`.
- Police (`police/src/`): Scanner UI calls `unifiedAPI.lookupVehicle` and submits violations. Auth commonly via main app or Supabase depending on configuration.
- Supervisor (`Supervisor/src/`): Dashboards consume `/analytics/violations` and `/analytics/officers`; pending queue manipulates `/violations/*` actions.

## Configuration

- Env vars (backend): `.env`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
  - `SECRET_KEY` (JWT)
- CORS: `allow_origins` includes `http://localhost:5173`, `http://localhost:3000`, and Netlify host.

### Authentication and Roles

- JWT created by `AuthService.create_access_token` with claims: `sub` (user id), `role`.
- Token expiry defaults to 30 minutes; configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`.
- Roles supported: `admin`, `police`, `dvla`, `supervisor`. Endpoint handlers can branch on `role` when needed.

### Error Handling

- Endpoints raise `HTTPException` with appropriate statuses:
  - 400 for validation/business errors (e.g., duplicates)
  - 401 for auth issues (invalid/expired token)
  - 404 for missing resources
  - 500 for unexpected errors
- Frontend `unified-api.ts` automatically falls back to mock responses on network/HTTP failures to ensure UX continuity.

## Local Development

1) Backend
```bash
cd backend
pip install -r requirements.txt
python start.py
```
API docs at `/docs` and `/redoc`.

2) Frontend
```bash
npm install
npm run dev
```
Set `VITE_API_BASE_URL` if not using default.

## Notes

- `unified-api.ts` intentionally falls back to mock data for reliability during development.
- The Node.js servers under `DVLA/server` are deprecated; FastAPI is the single backend.

### Operational Guidance

- Health check: `GET /` returns `{ message: "ANPR Backend API is running" }`.
- API docs: Swagger at `/docs`, ReDoc at `/redoc`.
- Testing: `python backend/test_api.py` exercises login, plate recognition, vehicle, and violations.
- Deploy: Run via `uvicorn main:app --host 0.0.0.0 --port 8000` or Dockerfile in README.



