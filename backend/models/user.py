from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    POLICE = "police"
    DVLA = "dvla"
    SUPERVISOR = "supervisor"

class UserStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole
    first_name: str
    last_name: str
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    badge_number: Optional[str] = None
    rank: Optional[str] = None
    station: Optional[str] = None
    id_number: Optional[str] = None
    position: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: str
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    badge_number: Optional[str] = None
    rank: Optional[str] = None
    station: Optional[str] = None
    id_number: Optional[str] = None
    position: Optional[str] = None

    class Config:
        from_attributes = True 