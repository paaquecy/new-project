# Backend Supabase Integration

This folder contains the Supabase integration for the ANPR backend system.

## 📁 File Structure

```
backend/supabase/
├── README.md           # This file
├── schema.sql          # Database schema and setup
├── client.py           # Python Supabase client
├── config.py           # Configuration and constants
└── setup.py            # Setup and testing script
```

## 🚀 Quick Start

### 1. Install Dependencies

Add the Supabase Python client to your requirements:

```bash
pip install supabase
```

### 2. Set Environment Variables

Create a `.env` file in your backend directory:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Setup Script

```bash
cd backend
python supabase/setup.py
```

## 📋 Files Overview

### `schema.sql`
- Complete database schema for ANPR system
- Creates tables: users, vehicles, violations, pending_approvals
- Sets up Row Level Security (RLS) policies
- Includes indexes for performance
- Inserts sample data

### `client.py`
- Python client for Supabase operations
- CRUD operations for all entities
- Authentication helpers
- Analytics and reporting functions
- Error handling and logging

### `config.py`
- Configuration management
- Environment variable validation
- Constants for roles, statuses, and account types
- Type validation helpers

### `setup.py`
- Interactive setup script
- Environment validation
- Connection testing
- Sample data insertion
- Query testing

## 🔧 Usage Examples

### Basic Usage

```python
from supabase.client import supabase_client

# Get all users
users = supabase_client.get_users()

# Create a new vehicle
vehicle_data = {
    'plate_number': 'ABC123',
    'owner_name': 'John Doe',
    'owner_email': 'john@example.com',
    'vehicle_type': 'Sedan',
    'registration_date': '2024-01-15',
    'expiry_date': '2025-01-15',
    'status': 'active'
}
new_vehicle = supabase_client.create_vehicle(vehicle_data)
```

### Using Configuration

```python
from supabase.config import UserRoles, ViolationStatus

# Check if role is valid
if UserRoles.is_valid_role('police'):
    print("Valid role")

# Get all violation statuses
statuses = ViolationStatus.get_all_statuses()
```

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `username` (VARCHAR, Unique)
- `role` (VARCHAR, Enum: admin, police, dvla, supervisor)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Vehicles Table
- `id` (UUID, Primary Key)
- `plate_number` (VARCHAR, Unique)
- `owner_name` (VARCHAR)
- `owner_email` (VARCHAR)
- `vehicle_type` (VARCHAR)
- `registration_date` (DATE)
- `expiry_date` (DATE)
- `status` (VARCHAR, Enum: active, expired, suspended)
- `created_at` (TIMESTAMP)

### Violations Table
- `id` (UUID, Primary Key)
- `plate_number` (VARCHAR)
- `violation_type` (VARCHAR)
- `description` (TEXT)
- `location` (VARCHAR)
- `date_time` (TIMESTAMP)
- `officer_id` (UUID, Foreign Key to users)
- `status` (VARCHAR, Enum: pending, approved, rejected, paid)
- `fine_amount` (DECIMAL)
- `created_at` (TIMESTAMP)

### Pending Approvals Table
- `id` (UUID, Primary Key)
- `user_name` (VARCHAR)
- `email` (VARCHAR)
- `role` (VARCHAR)
- `request_date` (DATE)
- `account_type` (VARCHAR, Enum: police, dvla, supervisor)
- `additional_info` (JSONB)
- `status` (VARCHAR, Enum: pending, approved, rejected)
- `created_at` (TIMESTAMP)

## 🔐 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Role-based access control
- Users can only access data they're authorized to see

### Authentication
- Supabase Auth integration
- User management functions
- Password hashing and security

## 📊 Analytics Functions

The client includes built-in analytics functions:

```python
# Get violation statistics
stats = supabase_client.get_violation_stats()
# Returns: total_violations, pending_violations, approved_violations, paid_violations, total_fines

# Get vehicle statistics
vehicle_stats = supabase_client.get_vehicle_stats()
# Returns: total_vehicles, active_vehicles, expired_vehicles, suspended_vehicles
```

## 🧪 Testing

Run the setup script to test the integration:

```bash
python supabase/setup.py
```

This will:
1. Check environment variables
2. Validate configuration
3. Test database connection
4. Optionally insert sample data
5. Test all CRUD operations

## 🔄 Integration with Backend API

To integrate with your existing backend API:

1. **Import the client** in your API endpoints
2. **Replace existing database calls** with Supabase client calls
3. **Update error handling** to use Supabase error responses
4. **Test thoroughly** before deployment

### Example API Endpoint

```python
from fastapi import APIRouter, HTTPException
from supabase.client import supabase_client

router = APIRouter()

@router.get("/vehicles")
async def get_vehicles():
    try:
        vehicles = supabase_client.get_vehicles()
        return {"vehicles": vehicles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 🚨 Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Check your `.env` file exists
   - Verify variable names are correct

2. **"Connection failed"**
   - Verify your Supabase project is active
   - Check URL and service key are correct

3. **"Permission denied"**
   - Check RLS policies in Supabase dashboard
   - Verify user authentication

4. **"Table doesn't exist"**
   - Run the schema.sql file in Supabase SQL editor
   - Check table names match your code

### Debug Mode

Enable debug logging by setting the environment variable:

```env
SUPABASE_DEBUG=true
```

## 📚 Additional Resources

- [Supabase Python Documentation](https://supabase.com/docs/reference/python)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contributing

When adding new features:

1. Update the schema if needed
2. Add corresponding client methods
3. Update configuration constants
4. Add tests to setup script
5. Update this README

---

**Note**: This integration replaces the existing SQLite database with Supabase for better scalability and real-time features.
