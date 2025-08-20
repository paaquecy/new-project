from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class VehicleType(str, Enum):
    PRIVATE = "private"
    COMMERCIAL = "commercial"
    MOTORCYCLE = "motorcycle"
    TRUCK = "truck"
    BUS = "bus"

class VehicleStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    STOLEN = "stolen"

class VehicleBase(BaseModel):
    plate_number: str
    vehicle_type: VehicleType
    make: str
    model: str
    year: int
    color: str
    engine_number: str
    chassis_number: str
    owner_name: str
    owner_phone: str
    owner_email: Optional[str] = None
    owner_address: str
    registration_date: datetime
    expiry_date: datetime
    insurance_expiry: Optional[datetime] = None
    road_worthiness_expiry: Optional[datetime] = None

class VehicleCreate(VehicleBase):
    pass

class Vehicle(VehicleBase):
    id: str
    status: VehicleStatus
    created_at: datetime
    updated_at: datetime
    registered_by: str  # User ID who registered the vehicle

    class Config:
        from_attributes = True 