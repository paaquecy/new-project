from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

class DVLAUser(BaseModel):
    id: Optional[int] = None
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "user"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DVLAUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "user"

class DVLAVehicle(BaseModel):
    id: Optional[int] = None
    reg_number: str
    manufacturer: str
    model: str
    vehicle_type: str
    chassis_number: str
    year_of_manufacture: int
    vin: str
    license_plate: str
    color: str
    use_type: str
    date_of_entry: date
    length_cm: Optional[int] = None
    width_cm: Optional[int] = None
    height_cm: Optional[int] = None
    number_of_axles: Optional[int] = None
    number_of_wheels: Optional[int] = None
    tyre_size_front: Optional[str] = None
    tyre_size_middle: Optional[str] = None
    tyre_size_rear: Optional[str] = None
    axle_load_front_kg: Optional[int] = None
    axle_load_middle_kg: Optional[int] = None
    axle_load_rear_kg: Optional[int] = None
    weight_kg: Optional[int] = None
    engine_make: Optional[str] = None
    engine_number: Optional[str] = None
    number_of_cylinders: Optional[int] = None
    engine_cc: Optional[int] = None
    horse_power: Optional[int] = None
    owner_name: str
    owner_address: str
    owner_phone: str
    owner_email: EmailStr
    status: str = "active"
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DVLAVehicleCreate(BaseModel):
    reg_number: str
    manufacturer: str
    model: str
    vehicle_type: str
    chassis_number: str
    year_of_manufacture: int
    vin: str
    license_plate: str
    color: str
    use_type: str
    date_of_entry: date
    length_cm: Optional[int] = None
    width_cm: Optional[int] = None
    height_cm: Optional[int] = None
    number_of_axles: Optional[int] = None
    number_of_wheels: Optional[int] = None
    tyre_size_front: Optional[str] = None
    tyre_size_middle: Optional[str] = None
    tyre_size_rear: Optional[str] = None
    axle_load_front_kg: Optional[int] = None
    axle_load_middle_kg: Optional[int] = None
    axle_load_rear_kg: Optional[int] = None
    weight_kg: Optional[int] = None
    engine_make: Optional[str] = None
    engine_number: Optional[str] = None
    number_of_cylinders: Optional[int] = None
    engine_cc: Optional[int] = None
    horse_power: Optional[int] = None
    owner_name: str
    owner_address: str
    owner_phone: str
    owner_email: EmailStr

class DVLARenewal(BaseModel):
    id: Optional[int] = None
    vehicle_id: int
    renewal_date: date
    expiry_date: date
    status: str = "pending"
    amount_paid: Optional[Decimal] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    processed_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DVLARenewalCreate(BaseModel):
    vehicle_id: int
    renewal_date: date
    expiry_date: date
    amount_paid: Optional[Decimal] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class DVLAFine(BaseModel):
    id: Optional[int] = None
    fine_id: str
    vehicle_id: int
    offense_description: str
    offense_date: datetime
    offense_location: str
    amount: Decimal
    payment_status: str = "unpaid"
    payment_method: Optional[str] = None
    payment_proof_path: Optional[str] = None
    marked_as_cleared: bool = False
    notes: Optional[str] = None
    evidence_paths: Optional[str] = None
    created_by: Optional[int] = None
    verified_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DVLAFineCreate(BaseModel):
    fine_id: str
    vehicle_id: int
    offense_description: str
    offense_date: datetime
    offense_location: str
    amount: Decimal
    payment_method: Optional[str] = None
    payment_proof_path: Optional[str] = None
    notes: Optional[str] = None
    evidence_paths: Optional[str] = None

class DVLAAnalytics(BaseModel):
    total_vehicles: int
    total_renewals: int
    total_fines: int
    pending_renewals: int
    unpaid_fines: int
    revenue_this_month: Decimal
    renewal_rate: float
    fine_payment_rate: float
