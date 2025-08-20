from typing import Optional, List
from datetime import datetime
import uuid
from database.supabase_client import supabase
from models.vehicle import Vehicle, VehicleCreate, VehicleType, VehicleStatus

class VehicleService:
    def __init__(self):
        pass

    async def create_vehicle(self, vehicle_data: VehicleCreate, registered_by: str) -> Vehicle:
        """Create a new vehicle record"""
        try:
            # Check if vehicle with this plate number already exists
            existing_vehicle = supabase.table("vehicles").select("id").eq("plate_number", vehicle_data.plate_number).execute()
            if existing_vehicle.data:
                raise ValueError("Vehicle with this plate number already exists")
            
            # Create vehicle data
            vehicle_dict = {
                "id": str(uuid.uuid4()),
                "plate_number": vehicle_data.plate_number,
                "vehicle_type": vehicle_data.vehicle_type.value,
                "make": vehicle_data.make,
                "model": vehicle_data.model,
                "year": vehicle_data.year,
                "color": vehicle_data.color,
                "engine_number": vehicle_data.engine_number,
                "chassis_number": vehicle_data.chassis_number,
                "owner_name": vehicle_data.owner_name,
                "owner_phone": vehicle_data.owner_phone,
                "owner_email": vehicle_data.owner_email,
                "owner_address": vehicle_data.owner_address,
                "registration_date": vehicle_data.registration_date.isoformat(),
                "expiry_date": vehicle_data.expiry_date.isoformat(),
                "insurance_expiry": vehicle_data.insurance_expiry.isoformat() if vehicle_data.insurance_expiry else None,
                "road_worthiness_expiry": vehicle_data.road_worthiness_expiry.isoformat() if vehicle_data.road_worthiness_expiry else None,
                "status": "active",
                "registered_by": registered_by,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Insert into Supabase
            response = supabase.table("vehicles").insert(vehicle_dict).execute()
            
            if not response.data:
                raise ValueError("Failed to create vehicle")
            
            created_vehicle = response.data[0]
            
            # Return Vehicle object
            return Vehicle(
                id=created_vehicle["id"],
                plate_number=created_vehicle["plate_number"],
                vehicle_type=VehicleType(created_vehicle["vehicle_type"]),
                make=created_vehicle["make"],
                model=created_vehicle["model"],
                year=created_vehicle["year"],
                color=created_vehicle["color"],
                engine_number=created_vehicle["engine_number"],
                chassis_number=created_vehicle["chassis_number"],
                owner_name=created_vehicle["owner_name"],
                owner_phone=created_vehicle["owner_phone"],
                owner_email=created_vehicle.get("owner_email"),
                owner_address=created_vehicle["owner_address"],
                registration_date=datetime.fromisoformat(created_vehicle["registration_date"]),
                expiry_date=datetime.fromisoformat(created_vehicle["expiry_date"]),
                insurance_expiry=datetime.fromisoformat(created_vehicle["insurance_expiry"]) if created_vehicle.get("insurance_expiry") else None,
                road_worthiness_expiry=datetime.fromisoformat(created_vehicle["road_worthiness_expiry"]) if created_vehicle.get("road_worthiness_expiry") else None,
                status=VehicleStatus(created_vehicle["status"]),
                created_at=datetime.fromisoformat(created_vehicle["created_at"]),
                updated_at=datetime.fromisoformat(created_vehicle["updated_at"]),
                registered_by=created_vehicle["registered_by"]
            )
            
        except Exception as e:
            print(f"Vehicle creation error: {e}")
            raise e

    async def get_vehicle_by_plate(self, plate_number: str) -> Optional[Vehicle]:
        """Get vehicle information by plate number"""
        try:
            response = supabase.table("vehicles").select("*").eq("plate_number", plate_number).execute()
            
            if not response.data:
                return None
            
            vehicle_data = response.data[0]
            
            return Vehicle(
                id=vehicle_data["id"],
                plate_number=vehicle_data["plate_number"],
                vehicle_type=VehicleType(vehicle_data["vehicle_type"]),
                make=vehicle_data["make"],
                model=vehicle_data["model"],
                year=vehicle_data["year"],
                color=vehicle_data["color"],
                engine_number=vehicle_data["engine_number"],
                chassis_number=vehicle_data["chassis_number"],
                owner_name=vehicle_data["owner_name"],
                owner_phone=vehicle_data["owner_phone"],
                owner_email=vehicle_data.get("owner_email"),
                owner_address=vehicle_data["owner_address"],
                registration_date=datetime.fromisoformat(vehicle_data["registration_date"]),
                expiry_date=datetime.fromisoformat(vehicle_data["expiry_date"]),
                insurance_expiry=datetime.fromisoformat(vehicle_data["insurance_expiry"]) if vehicle_data.get("insurance_expiry") else None,
                road_worthiness_expiry=datetime.fromisoformat(vehicle_data["road_worthiness_expiry"]) if vehicle_data.get("road_worthiness_expiry") else None,
                status=VehicleStatus(vehicle_data["status"]),
                created_at=datetime.fromisoformat(vehicle_data["created_at"]),
                updated_at=datetime.fromisoformat(vehicle_data["updated_at"]),
                registered_by=vehicle_data["registered_by"]
            )
            
        except Exception as e:
            print(f"Get vehicle error: {e}")
            return None

    async def get_vehicles_by_owner(self, owner_name: str) -> List[Vehicle]:
        """Get all vehicles owned by a specific person"""
        try:
            response = supabase.table("vehicles").select("*").ilike("owner_name", f"%{owner_name}%").execute()
            
            vehicles = []
            for vehicle_data in response.data:
                vehicle = Vehicle(
                    id=vehicle_data["id"],
                    plate_number=vehicle_data["plate_number"],
                    vehicle_type=VehicleType(vehicle_data["vehicle_type"]),
                    make=vehicle_data["make"],
                    model=vehicle_data["model"],
                    year=vehicle_data["year"],
                    color=vehicle_data["color"],
                    engine_number=vehicle_data["engine_number"],
                    chassis_number=vehicle_data["chassis_number"],
                    owner_name=vehicle_data["owner_name"],
                    owner_phone=vehicle_data["owner_phone"],
                    owner_email=vehicle_data.get("owner_email"),
                    owner_address=vehicle_data["owner_address"],
                    registration_date=datetime.fromisoformat(vehicle_data["registration_date"]),
                    expiry_date=datetime.fromisoformat(vehicle_data["expiry_date"]),
                    insurance_expiry=datetime.fromisoformat(vehicle_data["insurance_expiry"]) if vehicle_data.get("insurance_expiry") else None,
                    road_worthiness_expiry=datetime.fromisoformat(vehicle_data["road_worthiness_expiry"]) if vehicle_data.get("road_worthiness_expiry") else None,
                    status=VehicleStatus(vehicle_data["status"]),
                    created_at=datetime.fromisoformat(vehicle_data["created_at"]),
                    updated_at=datetime.fromisoformat(vehicle_data["updated_at"]),
                    registered_by=vehicle_data["registered_by"]
                )
                vehicles.append(vehicle)
            
            return vehicles
            
        except Exception as e:
            print(f"Get vehicles by owner error: {e}")
            return []

    async def update_vehicle_status(self, plate_number: str, status: VehicleStatus) -> bool:
        """Update vehicle status"""
        try:
            response = supabase.table("vehicles").update({
                "status": status.value,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("plate_number", plate_number).execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            print(f"Update vehicle status error: {e}")
            return False

    async def get_expired_vehicles(self) -> List[Vehicle]:
        """Get all vehicles with expired registration"""
        try:
            current_date = datetime.utcnow().isoformat()
            response = supabase.table("vehicles").select("*").lt("expiry_date", current_date).execute()
            
            vehicles = []
            for vehicle_data in response.data:
                vehicle = Vehicle(
                    id=vehicle_data["id"],
                    plate_number=vehicle_data["plate_number"],
                    vehicle_type=VehicleType(vehicle_data["vehicle_type"]),
                    make=vehicle_data["make"],
                    model=vehicle_data["model"],
                    year=vehicle_data["year"],
                    color=vehicle_data["color"],
                    engine_number=vehicle_data["engine_number"],
                    chassis_number=vehicle_data["chassis_number"],
                    owner_name=vehicle_data["owner_name"],
                    owner_phone=vehicle_data["owner_phone"],
                    owner_email=vehicle_data.get("owner_email"),
                    owner_address=vehicle_data["owner_address"],
                    registration_date=datetime.fromisoformat(vehicle_data["registration_date"]),
                    expiry_date=datetime.fromisoformat(vehicle_data["expiry_date"]),
                    insurance_expiry=datetime.fromisoformat(vehicle_data["insurance_expiry"]) if vehicle_data.get("insurance_expiry") else None,
                    road_worthiness_expiry=datetime.fromisoformat(vehicle_data["road_worthiness_expiry"]) if vehicle_data.get("road_worthiness_expiry") else None,
                    status=VehicleStatus(vehicle_data["status"]),
                    created_at=datetime.fromisoformat(vehicle_data["created_at"]),
                    updated_at=datetime.fromisoformat(vehicle_data["updated_at"]),
                    registered_by=vehicle_data["registered_by"]
                )
                vehicles.append(vehicle)
            
            return vehicles
            
        except Exception as e:
            print(f"Get expired vehicles error: {e}")
            return []

    async def search_vehicles(self, query: str) -> List[Vehicle]:
        """Search vehicles by plate number, owner name, or make/model"""
        try:
            # Search by plate number
            plate_response = supabase.table("vehicles").select("*").ilike("plate_number", f"%{query}%").execute()
            
            # Search by owner name
            owner_response = supabase.table("vehicles").select("*").ilike("owner_name", f"%{query}%").execute()
            
            # Search by make/model
            make_response = supabase.table("vehicles").select("*").or_(f"make.ilike.%{query}%,model.ilike.%{query}%").execute()
            
            # Combine and deduplicate results
            all_vehicles = plate_response.data + owner_response.data + make_response.data
            unique_vehicles = {v["id"]: v for v in all_vehicles}.values()
            
            vehicles = []
            for vehicle_data in unique_vehicles:
                vehicle = Vehicle(
                    id=vehicle_data["id"],
                    plate_number=vehicle_data["plate_number"],
                    vehicle_type=VehicleType(vehicle_data["vehicle_type"]),
                    make=vehicle_data["make"],
                    model=vehicle_data["model"],
                    year=vehicle_data["year"],
                    color=vehicle_data["color"],
                    engine_number=vehicle_data["engine_number"],
                    chassis_number=vehicle_data["chassis_number"],
                    owner_name=vehicle_data["owner_name"],
                    owner_phone=vehicle_data["owner_phone"],
                    owner_email=vehicle_data.get("owner_email"),
                    owner_address=vehicle_data["owner_address"],
                    registration_date=datetime.fromisoformat(vehicle_data["registration_date"]),
                    expiry_date=datetime.fromisoformat(vehicle_data["expiry_date"]),
                    insurance_expiry=datetime.fromisoformat(vehicle_data["insurance_expiry"]) if vehicle_data.get("insurance_expiry") else None,
                    road_worthiness_expiry=datetime.fromisoformat(vehicle_data["road_worthiness_expiry"]) if vehicle_data.get("road_worthiness_expiry") else None,
                    status=VehicleStatus(vehicle_data["status"]),
                    created_at=datetime.fromisoformat(vehicle_data["created_at"]),
                    updated_at=datetime.fromisoformat(vehicle_data["updated_at"]),
                    registered_by=vehicle_data["registered_by"]
                )
                vehicles.append(vehicle)
            
            return vehicles
            
        except Exception as e:
            print(f"Search vehicles error: {e}")
            return [] 