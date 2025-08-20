from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
import bcrypt
from database.supabase_client import supabase
from models.dvla import (
    DVLAUser, DVLAUserCreate, DVLAVehicle, DVLAVehicleCreate, 
    DVLARenewal, DVLARenewalCreate, DVLAFine, DVLAFineCreate, DVLAAnalytics
)

class DVLAService:
    def __init__(self):
        self.supabase = supabase

    # User Management
    async def create_dvla_user(self, user_data: DVLAUserCreate) -> DVLAUser:
        """Create new DVLA user"""
        hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
        
        result = self.supabase.table("dvla_users").insert({
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": hashed_password.decode('utf-8'),
            "full_name": user_data.full_name,
            "phone": user_data.phone,
            "role": user_data.role
        }).execute()
        
        if result.data:
            return DVLAUser(**result.data[0])
        raise Exception("Failed to create user")

    async def authenticate_dvla_user(self, username: str, password: str) -> Optional[DVLAUser]:
        """Authenticate DVLA user"""
        result = self.supabase.table("dvla_users").select("*").eq("username", username).execute()
        
        if result.data:
            user_data = result.data[0]
            if bcrypt.checkpw(password.encode('utf-8'), user_data['password_hash'].encode('utf-8')):
                return DVLAUser(**user_data)
        return None

    async def get_dvla_users(self) -> List[DVLAUser]:
        """Get all DVLA users"""
        result = self.supabase.table("dvla_users").select("*").execute()
        return [DVLAUser(**user) for user in result.data]

    # Vehicle Management
    async def create_vehicle(self, vehicle_data: DVLAVehicleCreate, created_by: int) -> DVLAVehicle:
        """Create new vehicle record"""
        vehicle_dict = vehicle_data.dict()
        vehicle_dict["created_by"] = created_by
        
        result = self.supabase.table("dvla_vehicles").insert(vehicle_dict).execute()
        
        if result.data:
            return DVLAVehicle(**result.data[0])
        raise Exception("Failed to create vehicle")

    async def get_vehicles(self, search: Optional[str] = None, limit: int = 100) -> List[DVLAVehicle]:
        """Get vehicles with optional search"""
        query = self.supabase.table("dvla_vehicles").select("*")
        
        if search:
            query = query.or_(f"reg_number.ilike.%{search}%,license_plate.ilike.%{search}%,owner_name.ilike.%{search}%")
        
        result = query.limit(limit).execute()
        return [DVLAVehicle(**vehicle) for vehicle in result.data]

    async def get_vehicle_by_id(self, vehicle_id: int) -> Optional[DVLAVehicle]:
        """Get vehicle by ID"""
        result = self.supabase.table("dvla_vehicles").select("*").eq("id", vehicle_id).execute()
        
        if result.data:
            return DVLAVehicle(**result.data[0])
        return None

    async def get_vehicle_by_reg(self, reg_number: str) -> Optional[DVLAVehicle]:
        """Get vehicle by registration number"""
        result = self.supabase.table("dvla_vehicles").select("*").eq("reg_number", reg_number).execute()
        
        if result.data:
            return DVLAVehicle(**result.data[0])
        return None

    async def update_vehicle(self, vehicle_id: int, vehicle_data: dict) -> DVLAVehicle:
        """Update vehicle record"""
        vehicle_data["updated_at"] = datetime.utcnow()
        
        result = self.supabase.table("dvla_vehicles").update(vehicle_data).eq("id", vehicle_id).execute()
        
        if result.data:
            return DVLAVehicle(**result.data[0])
        raise Exception("Failed to update vehicle")

    # Renewal Management
    async def create_renewal(self, renewal_data: DVLARenewalCreate, processed_by: int) -> DVLARenewal:
        """Create new renewal record"""
        renewal_dict = renewal_data.dict()
        renewal_dict["processed_by"] = processed_by
        
        result = self.supabase.table("dvla_renewals").insert(renewal_dict).execute()
        
        if result.data:
            return DVLARenewal(**result.data[0])
        raise Exception("Failed to create renewal")

    async def get_renewals(self, vehicle_id: Optional[int] = None, status: Optional[str] = None) -> List[DVLARenewal]:
        """Get renewals with optional filtering"""
        query = self.supabase.table("dvla_renewals").select("*")
        
        if vehicle_id:
            query = query.eq("vehicle_id", vehicle_id)
        if status:
            query = query.eq("status", status)
        
        result = query.execute()
        return [DVLARenewal(**renewal) for renewal in result.data]

    async def update_renewal_status(self, renewal_id: int, status: str) -> DVLARenewal:
        """Update renewal status"""
        result = self.supabase.table("dvla_renewals").update({
            "status": status,
            "updated_at": datetime.utcnow()
        }).eq("id", renewal_id).execute()
        
        if result.data:
            return DVLARenewal(**result.data[0])
        raise Exception("Failed to update renewal")

    # Fine Management
    async def create_fine(self, fine_data: DVLAFineCreate, created_by: int) -> DVLAFine:
        """Create new fine record"""
        fine_dict = fine_data.dict()
        fine_dict["created_by"] = created_by
        
        result = self.supabase.table("dvla_fines").insert(fine_dict).execute()
        
        if result.data:
            return DVLAFine(**result.data[0])
        raise Exception("Failed to create fine")

    async def get_fines(self, vehicle_id: Optional[int] = None, payment_status: Optional[str] = None) -> List[DVLAFine]:
        """Get fines with optional filtering"""
        query = self.supabase.table("dvla_fines").select("*")
        
        if vehicle_id:
            query = query.eq("vehicle_id", vehicle_id)
        if payment_status:
            query = query.eq("payment_status", payment_status)
        
        result = query.execute()
        return [DVLAFine(**fine) for fine in result.data]

    async def update_fine_payment(self, fine_id: str, payment_data: dict) -> DVLAFine:
        """Update fine payment status"""
        payment_data["updated_at"] = datetime.utcnow()
        
        result = self.supabase.table("dvla_fines").update(payment_data).eq("fine_id", fine_id).execute()
        
        if result.data:
            return DVLAFine(**result.data[0])
        raise Exception("Failed to update fine payment")

    async def clear_fine(self, fine_id: str, cleared_by: int) -> DVLAFine:
        """Clear/dismiss a fine"""
        result = self.supabase.table("dvla_fines").update({
            "marked_as_cleared": True,
            "verified_by": cleared_by,
            "updated_at": datetime.utcnow()
        }).eq("fine_id", fine_id).execute()
        
        if result.data:
            return DVLAFine(**result.data[0])
        raise Exception("Failed to clear fine")

    # Analytics
    async def get_analytics(self) -> DVLAAnalytics:
        """Get DVLA system analytics"""
        # Get totals
        vehicles_result = self.supabase.table("dvla_vehicles").select("id", count="exact").execute()
        renewals_result = self.supabase.table("dvla_renewals").select("id", count="exact").execute()
        fines_result = self.supabase.table("dvla_fines").select("id", count="exact").execute()
        
        # Get pending renewals
        pending_renewals = self.supabase.table("dvla_renewals").select("id", count="exact").eq("status", "pending").execute()
        
        # Get unpaid fines
        unpaid_fines = self.supabase.table("dvla_fines").select("id", count="exact").eq("payment_status", "unpaid").execute()
        
        # Calculate revenue this month
        current_month = datetime.now().strftime("%Y-%m")
        revenue_result = self.supabase.table("dvla_renewals").select("amount_paid").gte("created_at", f"{current_month}-01").execute()
        revenue_this_month = sum(Decimal(str(r['amount_paid'] or 0)) for r in revenue_result.data)
        
        # Calculate rates
        total_renewals = renewals_result.count or 1
        total_fines = fines_result.count or 1
        completed_renewals = self.supabase.table("dvla_renewals").select("id", count="exact").eq("status", "completed").execute()
        paid_fines = self.supabase.table("dvla_fines").select("id", count="exact").eq("payment_status", "paid").execute()
        
        renewal_rate = (completed_renewals.count or 0) / total_renewals * 100
        fine_payment_rate = (paid_fines.count or 0) / total_fines * 100
        
        return DVLAAnalytics(
            total_vehicles=vehicles_result.count or 0,
            total_renewals=renewals_result.count or 0,
            total_fines=fines_result.count or 0,
            pending_renewals=pending_renewals.count or 0,
            unpaid_fines=unpaid_fines.count or 0,
            revenue_this_month=revenue_this_month,
            renewal_rate=renewal_rate,
            fine_payment_rate=fine_payment_rate
        )
