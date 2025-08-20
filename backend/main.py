from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import uvicorn
import os
try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv():
        pass  # No-op if dotenv not available
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
from passlib.context import CryptContext

# Import our modules
from database.supabase_client import supabase
from models.user import User, UserCreate, UserLogin
from models.vehicle import Vehicle, VehicleCreate
from models.violation import Violation, ViolationCreate
from models.dvla import (
    DVLAUser, DVLAUserCreate, DVLAVehicle, DVLAVehicleCreate,
    DVLARenewal, DVLARenewalCreate, DVLAFine, DVLAFineCreate, DVLAAnalytics
)
from services.auth_service import AuthService
from services.plate_recognition_service import PlateRecognitionService
from services.vehicle_service import VehicleService
from services.violation_service import ViolationService
from services.dvla_service import DVLAService

# Load environment variables
load_dotenv()

app = FastAPI(
    title="ANPR Backend API",
    description="Backend API for Automatic Number Plate Recognition System",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://your-netlify-domain.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Initialize services
auth_service = AuthService()
plate_recognition_service = PlateRecognitionService()
vehicle_service = VehicleService()
violation_service = ViolationService()
dvla_service = DVLAService()

# Models
class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: str

class PlateRecognitionRequest(BaseModel):
    image_data: str  # Base64 encoded image
    user_id: str

class PlateRecognitionResponse(BaseModel):
    plate_number: str
    confidence: float
    vehicle_data: Optional[Vehicle] = None
    processing_time: float

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return {"message": "ANPR Backend API is running"}

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login endpoint for all user types"""
    try:
        user = await auth_service.authenticate_user(user_credentials.username, user_credentials.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = auth_service.create_access_token(data={"sub": user.id, "role": user.role})
        return Token(access_token=access_token, token_type="bearer", user_role=user.role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    """Register new user (pending approval)"""
    try:
        user = await auth_service.create_user(user_data)
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/plate-recognition", response_model=PlateRecognitionResponse)
async def recognize_plate(request: PlateRecognitionRequest, current_user: str = Depends(get_current_user)):
    """Recognize license plate from image and return vehicle data"""
    try:
        # Process the image and extract plate number
        plate_number, confidence, processing_time = await plate_recognition_service.recognize_plate(request.image_data)
        
        # Get vehicle data from database
        vehicle_data = await vehicle_service.get_vehicle_by_plate(plate_number)
        
        return PlateRecognitionResponse(
            plate_number=plate_number,
            confidence=confidence,
            vehicle_data=vehicle_data,
            processing_time=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/violations", response_model=Violation)
async def create_violation(violation_data: ViolationCreate, current_user: str = Depends(get_current_user)):
    """Create a new violation record"""
    try:
        violation = await violation_service.create_violation(violation_data, current_user)
        return violation
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/vehicles/{plate_number}", response_model=Vehicle)
async def get_vehicle(plate_number: str, current_user: str = Depends(get_current_user)):
    """Get vehicle information by plate number"""
    try:
        vehicle = await vehicle_service.get_vehicle_by_plate(plate_number)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return vehicle
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/violations", response_model=List[Violation])
async def get_violations(
    plate_number: Optional[str] = None,
    status: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """Get violations with optional filtering"""
    try:
        violations = await violation_service.get_violations(plate_number, status, current_user)
        return violations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/violations/{violation_id}/approve")
async def approve_violation(violation_id: str, current_user: str = Depends(get_current_user)):
    """Approve a violation (supervisor only)"""
    try:
        result = await violation_service.approve_violation(violation_id, current_user)
        return {"message": "Violation approved successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/violations/{violation_id}/reject")
async def reject_violation(violation_id: str, reason: str, current_user: str = Depends(get_current_user)):
    """Reject a violation (supervisor only)"""
    try:
        result = await violation_service.reject_violation(violation_id, reason, current_user)
        return {"message": "Violation rejected successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# DVLA Endpoints
@app.post("/dvla/auth/register", response_model=DVLAUser)
async def register_dvla_user(user_data: DVLAUserCreate):
    """Register new DVLA user"""
    try:
        user = await dvla_service.create_dvla_user(user_data)
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/dvla/auth/login", response_model=Token)
async def login_dvla_user(user_credentials: UserLogin):
    """Login DVLA user"""
    try:
        user = await dvla_service.authenticate_dvla_user(user_credentials.username, user_credentials.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        access_token = auth_service.create_access_token(data={"sub": str(user.id), "role": user.role})
        return Token(access_token=access_token, token_type="bearer", user_role=user.role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dvla/users", response_model=List[DVLAUser])
async def get_dvla_users(current_user: str = Depends(get_current_user)):
    """Get all DVLA users"""
    try:
        users = await dvla_service.get_dvla_users()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dvla/vehicles", response_model=DVLAVehicle)
async def create_dvla_vehicle(vehicle_data: DVLAVehicleCreate, current_user: str = Depends(get_current_user)):
    """Create new vehicle record"""
    try:
        vehicle = await dvla_service.create_vehicle(vehicle_data, int(current_user))
        return vehicle
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dvla/vehicles", response_model=List[DVLAVehicle])
async def get_dvla_vehicles(search: Optional[str] = None, limit: int = 100, current_user: str = Depends(get_current_user)):
    """Get vehicles with optional search"""
    try:
        vehicles = await dvla_service.get_vehicles(search, limit)
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dvla/vehicles/{vehicle_id}", response_model=DVLAVehicle)
async def get_dvla_vehicle(vehicle_id: int, current_user: str = Depends(get_current_user)):
    """Get vehicle by ID"""
    try:
        vehicle = await dvla_service.get_vehicle_by_id(vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return vehicle
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dvla/vehicles/reg/{reg_number}", response_model=DVLAVehicle)
async def get_dvla_vehicle_by_reg(reg_number: str, current_user: str = Depends(get_current_user)):
    """Get vehicle by registration number"""
    try:
        vehicle = await dvla_service.get_vehicle_by_reg(reg_number)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return vehicle
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/dvla/vehicles/{vehicle_id}", response_model=DVLAVehicle)
async def update_dvla_vehicle(vehicle_id: int, vehicle_data: dict, current_user: str = Depends(get_current_user)):
    """Update vehicle record"""
    try:
        vehicle = await dvla_service.update_vehicle(vehicle_id, vehicle_data)
        return vehicle
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/dvla/renewals", response_model=DVLARenewal)
async def create_dvla_renewal(renewal_data: DVLARenewalCreate, current_user: str = Depends(get_current_user)):
    """Create new renewal record"""
    try:
        renewal = await dvla_service.create_renewal(renewal_data, int(current_user))
        return renewal
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dvla/renewals", response_model=List[DVLARenewal])
async def get_dvla_renewals(vehicle_id: Optional[int] = None, status: Optional[str] = None, current_user: str = Depends(get_current_user)):
    """Get renewals with optional filtering"""
    try:
        renewals = await dvla_service.get_renewals(vehicle_id, status)
        return renewals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/dvla/renewals/{renewal_id}/status")
async def update_dvla_renewal_status(renewal_id: int, status: str, current_user: str = Depends(get_current_user)):
    """Update renewal status"""
    try:
        renewal = await dvla_service.update_renewal_status(renewal_id, status)
        return renewal
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/dvla/fines", response_model=DVLAFine)
async def create_dvla_fine(fine_data: DVLAFineCreate, current_user: str = Depends(get_current_user)):
    """Create new fine record"""
    try:
        fine = await dvla_service.create_fine(fine_data, int(current_user))
        return fine
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dvla/fines", response_model=List[DVLAFine])
async def get_dvla_fines(vehicle_id: Optional[int] = None, payment_status: Optional[str] = None, current_user: str = Depends(get_current_user)):
    """Get fines with optional filtering"""
    try:
        fines = await dvla_service.get_fines(vehicle_id, payment_status)
        return fines
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/dvla/fines/{fine_id}/payment")
async def update_dvla_fine_payment(fine_id: str, payment_data: dict, current_user: str = Depends(get_current_user)):
    """Update fine payment status"""
    try:
        fine = await dvla_service.update_fine_payment(fine_id, payment_data)
        return fine
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/dvla/fines/{fine_id}/clear")
async def clear_dvla_fine(fine_id: str, current_user: str = Depends(get_current_user)):
    """Clear/dismiss a fine"""
    try:
        fine = await dvla_service.clear_fine(fine_id, int(current_user))
        return fine
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/dvla/analytics", response_model=DVLAAnalytics)
async def get_dvla_analytics(current_user: str = Depends(get_current_user)):
    """Get DVLA system analytics"""
    try:
        analytics = await dvla_service.get_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Supervisor Analytics Endpoints
@app.get("/analytics/violations")
async def get_violation_stats(current_user: str = Depends(get_current_user)):
    """Get violation statistics for supervisor dashboard"""
    try:
        stats = await violation_service.get_violation_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/officers")
async def get_officer_stats(current_user: str = Depends(get_current_user)):
    """Get officer performance statistics"""
    try:
        stats = await violation_service.get_officer_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
