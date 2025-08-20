# Unified FastAPI Backend Architecture

## Overview

This application has been updated to use **Python FastAPI** as the unified backend for all modules (Main App, DVLA, Police, and Supervisor). This provides a single, consistent API for all frontend applications.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main App      │    │   DVLA App      │    │   Police App    │    │  Supervisor App │
│   (React)       │    │   (React)       │    │   (React)       │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    Unified API Layer                        │
                    │              (src/lib/unified-api.ts)                      │
                    └─────────────────────────────────────────────────────────────┘
                                         │
                    ┌─────────────────────────────────────────────────────────────┐
                    │                Python FastAPI Backend                      │
                    │                (backend/main.py)                           │
                    └─────────────────────────────────────────────────────────────┘
                                         │
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    Supabase Database                       │
                    │                    (PostgreSQL)                            │
                    └─────────────────────────────────────────────────────────────┘
```

## 🔧 Backend Components

### 1. **FastAPI Application** (`backend/main.py`)
- **Port**: 8000
- **Framework**: FastAPI with Uvicorn
- **Features**:
  - RESTful API endpoints
  - JWT authentication
  - CORS middleware
  - Request/response validation
  - Automatic API documentation

### 2. **API Endpoints**

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /dvla/auth/login` - DVLA user login
- `POST /dvla/auth/register` - DVLA user registration

#### Vehicle Operations
- `GET /vehicles/{plate_number}` - Get vehicle by plate number
- `POST /plate-recognition` - Recognize plate from image

#### Violation Management
- `POST /violations` - Create violation
- `GET /violations` - Get violations (with filtering)
- `PUT /violations/{id}/approve` - Approve violation
- `PUT /violations/{id}/reject` - Reject violation

#### DVLA Operations
- `GET /dvla/vehicles` - Get DVLA vehicles
- `POST /dvla/vehicles` - Create DVLA vehicle
- `GET /dvla/vehicles/{id}` - Get vehicle by ID
- `PUT /dvla/vehicles/{id}` - Update vehicle
- `GET /dvla/renewals` - Get renewals
- `POST /dvla/renewals` - Create renewal
- `GET /dvla/fines` - Get fines
- `POST /dvla/fines` - Create fine
- `GET /dvla/analytics` - Get DVLA analytics

#### Supervisor Analytics
- `GET /analytics/violations` - Get violation statistics
- `GET /analytics/officers` - Get officer performance stats

### 3. **Services** (`backend/services/`)
- `auth_service.py` - Authentication and user management
- `vehicle_service.py` - Vehicle operations
- `violation_service.py` - Violation management
- `dvla_service.py` - DVLA-specific operations
- `plate_recognition_service.py` - OCR and image processing

### 4. **Models** (`backend/models/`)
- `user.py` - User data models
- `vehicle.py` - Vehicle data models
- `violation.py` - Violation data models
- `dvla.py` - DVLA-specific models

## 🚀 Frontend Integration

### 1. **Unified API Client** (`src/lib/unified-api.ts`)
- Single API client for all frontend modules
- Automatic fallback to mock data when backend is unavailable
- Consistent error handling
- TypeScript interfaces for all data types

### 2. **Module-Specific APIs**
- **Main App**: Uses `src/lib/api.ts` (wraps unified API)
- **DVLA App**: Uses `src/dvla/lib/api.ts` (wraps unified API)
- **Police App**: Uses `src/police/lib/api.ts` (wraps unified API)
- **Supervisor App**: Uses `src/supervisor/lib/api.ts` (wraps unified API)

## 📊 Database Schema

### Supabase Tables
1. **`officers`** - User accounts for all roles
2. **`vehicles`** - Vehicle registration data
3. **`violations`** - Traffic violation records
4. **`scans`** - Plate recognition scan logs
5. **`dvla_vehicles`** - DVLA-specific vehicle data
6. **`dvla_renewals`** - License renewal records
7. **`dvla_fines`** - Fine records

## 🔐 Authentication

### JWT-Based Authentication
- **Token Type**: JWT (JSON Web Tokens)
- **Algorithm**: HS256
- **Expiration**: 30 minutes (configurable)
- **Role-Based Access**: Different endpoints for different user roles

### User Roles
1. **Admin** - Full system access
2. **Police** - Violation reporting and vehicle lookup
3. **DVLA** - Vehicle registration and licensing
4. **Supervisor** - Violation review and approval

## 🛠️ Development Setup

### 1. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python start.py
```

### 2. **Frontend Setup**
```bash
npm install
npm run dev
```

### 3. **Environment Variables**
Create `.env` file in backend directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SECRET_KEY=your-secret-key
```

## 🔄 Migration from Node.js

### Removed Components
- ❌ `DVLA/server/` - Node.js Express server
- ❌ `Supervisor/server/` - Node.js Express server
- ❌ Multiple API endpoints

### Benefits of Unified Backend
- ✅ **Single Codebase** - All backend logic in one place
- ✅ **Consistent API** - Same endpoints for all modules
- ✅ **Better Performance** - Python FastAPI is faster than Node.js
- ✅ **Type Safety** - Pydantic models provide runtime validation
- ✅ **Auto Documentation** - FastAPI generates OpenAPI docs
- ✅ **Easier Maintenance** - One backend to maintain

## 📈 Performance

### FastAPI Advantages
- **High Performance** - Built on Starlette and Pydantic
- **Async Support** - Native async/await support
- **Automatic Validation** - Request/response validation
- **OpenAPI Documentation** - Auto-generated API docs
- **WebSocket Support** - Real-time features ready

## 🔍 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🧪 Testing

### Backend Testing
```bash
cd backend
python test_api.py
```

### Frontend Testing
```bash
npm test
```

## 🚀 Deployment

### Backend Deployment
- **Docker**: Use provided Dockerfile
- **Cloud Platforms**: Deploy to Heroku, Railway, or similar
- **VPS**: Deploy to any VPS with Python support

### Frontend Deployment
- **Netlify**: Automatic deployment from Git
- **Vercel**: Next.js-style deployment
- **Static Hosting**: Any static file hosting service

## 📝 Notes

- The application gracefully falls back to mock data when the backend is unavailable
- All frontend modules now use the same API client
- Authentication is handled consistently across all modules
- The backend provides comprehensive error handling and logging
