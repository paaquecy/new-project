import os
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from typing import Optional
import uuid
from database.supabase_client import supabase
from models.user import User, UserCreate, UserLogin, UserRole, UserStatus

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
    def __init__(self):
        self.pwd_context = pwd_context

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        try:
            # Query user from Supabase
            response = supabase.table("users").select("*").eq("username", username).execute()
            
            if not response.data:
                return None
            
            user_data = response.data[0]
            
            # Verify password
            if not self.verify_password(password, user_data["password_hash"]):
                return None
            
            # Check if user is active
            if user_data["status"] != "active":
                return None
            
            # Convert to User model
            user = User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                role=UserRole(user_data["role"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                phone_number=user_data.get("phone_number"),
                status=UserStatus(user_data["status"]),
                created_at=datetime.fromisoformat(user_data["created_at"]),
                updated_at=datetime.fromisoformat(user_data["updated_at"]),
                badge_number=user_data.get("badge_number"),
                rank=user_data.get("rank"),
                station=user_data.get("station"),
                id_number=user_data.get("id_number"),
                position=user_data.get("position")
            )
            
            return user
            
        except Exception as e:
            print(f"Authentication error: {e}")
            return None

    async def create_user(self, user_data: UserCreate) -> User:
        try:
            # Check if username already exists
            existing_user = supabase.table("users").select("id").eq("username", user_data.username).execute()
            if existing_user.data:
                raise ValueError("Username already exists")
            
            # Check if email already exists
            existing_email = supabase.table("users").select("id").eq("email", user_data.email).execute()
            if existing_email.data:
                raise ValueError("Email already exists")
            
            # Hash password
            hashed_password = self.get_password_hash(user_data.password)
            
            # Create user data
            user_dict = {
                "id": str(uuid.uuid4()),
                "username": user_data.username,
                "email": user_data.email,
                "password_hash": hashed_password,
                "role": user_data.role.value,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "phone_number": user_data.phone_number,
                "status": "pending",  # New users start as pending
                "badge_number": user_data.badge_number,
                "rank": user_data.rank,
                "station": user_data.station,
                "id_number": user_data.id_number,
                "position": user_data.position,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Insert into Supabase
            response = supabase.table("users").insert(user_dict).execute()
            
            if not response.data:
                raise ValueError("Failed to create user")
            
            created_user = response.data[0]
            
            # Return User object
            return User(
                id=created_user["id"],
                username=created_user["username"],
                email=created_user["email"],
                role=UserRole(created_user["role"]),
                first_name=created_user["first_name"],
                last_name=created_user["last_name"],
                phone_number=created_user.get("phone_number"),
                status=UserStatus(created_user["status"]),
                created_at=datetime.fromisoformat(created_user["created_at"]),
                updated_at=datetime.fromisoformat(created_user["updated_at"]),
                badge_number=created_user.get("badge_number"),
                rank=created_user.get("rank"),
                station=created_user.get("station"),
                id_number=created_user.get("id_number"),
                position=created_user.get("position")
            )
            
        except Exception as e:
            print(f"User creation error: {e}")
            raise e

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        try:
            response = supabase.table("users").select("*").eq("id", user_id).execute()
            
            if not response.data:
                return None
            
            user_data = response.data[0]
            
            return User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                role=UserRole(user_data["role"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                phone_number=user_data.get("phone_number"),
                status=UserStatus(user_data["status"]),
                created_at=datetime.fromisoformat(user_data["created_at"]),
                updated_at=datetime.fromisoformat(user_data["updated_at"]),
                badge_number=user_data.get("badge_number"),
                rank=user_data.get("rank"),
                station=user_data.get("station"),
                id_number=user_data.get("id_number"),
                position=user_data.get("position")
            )
            
        except Exception as e:
            print(f"Get user error: {e}")
            return None 