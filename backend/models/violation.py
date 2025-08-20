from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class ViolationType(str, Enum):
    SPEEDING = "speeding"
    RED_LIGHT = "red_light"
    ILLEGAL_PARKING = "illegal_parking"
    DRUNK_DRIVING = "drunk_driving"
    OVERLOADING = "overloading"
    NO_LICENSE = "no_license"
    EXPIRED_LICENSE = "expired_license"
    NO_INSURANCE = "no_insurance"
    OTHER = "other"

class ViolationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PAID = "paid"
    APPEALED = "appealed"

class ViolationSeverity(str, Enum):
    MINOR = "minor"
    MAJOR = "major"
    CRITICAL = "critical"

class ViolationBase(BaseModel):
    plate_number: str
    violation_type: ViolationType
    severity: ViolationSeverity
    location: str
    description: str
    fine_amount: float
    evidence_image: Optional[str] = None  # Base64 or URL
    officer_notes: Optional[str] = None

class ViolationCreate(ViolationBase):
    pass

class Violation(ViolationBase):
    id: str
    status: ViolationStatus
    reported_by: str  # User ID of the officer
    reported_at: datetime
    reviewed_by: Optional[str] = None  # User ID of the supervisor
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 