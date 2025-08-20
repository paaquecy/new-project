# ANPR Backend API

This is the Python FastAPI backend for the Automatic Number Plate Recognition (ANPR) system. It provides RESTful APIs for plate recognition, vehicle management, violation tracking, and user authentication.

## Features

- **Plate Recognition**: ML-powered OCR to extract license plate numbers from images
- **Vehicle Management**: CRUD operations for vehicle registration and data
- **Violation Tracking**: Complete violation lifecycle management
- **User Authentication**: JWT-based authentication with role-based access
- **Real-time Processing**: Fast image processing and plate recognition
- **Database Integration**: Supabase for scalable data storage

## Tech Stack

- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens
- **Image Processing**: OpenCV, EasyOCR
- **ML/AI**: TensorFlow, PyTorch (for advanced models)
- **Validation**: Pydantic models

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- Supabase account and project
- Tesseract OCR (for better text recognition)

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

1. Copy `env_example.txt` to `.env`
2. Fill in your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SECRET_KEY=your-secret-key-change-this-in-production
   ```

### 4. Database Setup

1. Create a Supabase project
2. Create the required tables using the SQL schemas provided in `setup_database.py`
3. Run the setup script:
   ```bash
   python setup_database.py
   ```

### 5. Run the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Plate Recognition
- `POST /plate-recognition` - Recognize license plate from image

### Vehicles
- `GET /vehicles/{plate_number}` - Get vehicle by plate number
- `POST /vehicles` - Create new vehicle (DVLA only)

### Violations
- `GET /violations` - Get violations with filtering
- `POST /violations` - Create new violation
- `PUT /violations/{id}/approve` - Approve violation (Supervisor)
- `PUT /violations/{id}/reject` - Reject violation (Supervisor)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL CHECK (role IN ('admin', 'police', 'dvla', 'supervisor')),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    phone_number VARCHAR,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    badge_number VARCHAR,
    rank VARCHAR,
    station VARCHAR,
    id_number VARCHAR,
    position VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Vehicles Table
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number VARCHAR UNIQUE NOT NULL,
    vehicle_type VARCHAR NOT NULL CHECK (vehicle_type IN ('private', 'commercial', 'motorcycle', 'truck', 'bus')),
    make VARCHAR NOT NULL,
    model VARCHAR NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR NOT NULL,
    engine_number VARCHAR NOT NULL,
    chassis_number VARCHAR NOT NULL,
    owner_name VARCHAR NOT NULL,
    owner_phone VARCHAR NOT NULL,
    owner_email VARCHAR,
    owner_address VARCHAR NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    insurance_expiry TIMESTAMP WITH TIME ZONE,
    road_worthiness_expiry TIMESTAMP WITH TIME ZONE,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'stolen')),
    registered_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Violations Table
```sql
CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate_number VARCHAR NOT NULL,
    violation_type VARCHAR NOT NULL CHECK (violation_type IN ('speeding', 'red_light', 'illegal_parking', 'drunk_driving', 'overloading', 'no_license', 'expired_license', 'no_insurance', 'other')),
    severity VARCHAR NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
    location VARCHAR NOT NULL,
    description TEXT NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL,
    evidence_image TEXT,
    officer_notes TEXT,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'appealed')),
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Plate Recognition

The system uses a combination of:
1. **OpenCV** for image preprocessing and plate region detection
2. **EasyOCR** for text extraction from detected regions
3. **Regex patterns** for Ghana license plate format validation
4. **Confidence scoring** for result reliability

### Supported Plate Formats
- `AB 1234 C` (Standard format)
- `AB1234C` (No spaces)
- `AB 1234` (Short format)
- And variations

## Authentication

The system uses JWT tokens for authentication with role-based access:

- **Admin**: Full system access
- **Police**: Violation reporting and vehicle lookup
- **DVLA**: Vehicle registration and management
- **Supervisor**: Violation approval/rejection

## Development

### Project Structure
```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── setup_database.py      # Database setup script
├── env_example.txt        # Environment variables template
├── database/
│   └── supabase_client.py # Supabase connection
├── models/
│   ├── user.py           # User Pydantic models
│   ├── vehicle.py        # Vehicle Pydantic models
│   └── violation.py      # Violation Pydantic models
└── services/
    ├── auth_service.py    # Authentication logic
    ├── plate_recognition_service.py  # ML/OCR processing
    ├── vehicle_service.py # Vehicle management
    └── violation_service.py # Violation management
```

### Adding New Features

1. Create Pydantic models in `models/`
2. Implement business logic in `services/`
3. Add API endpoints in `main.py`
4. Update database schema if needed

## Deployment

### Local Development
```bash
python main.py
```

### Production Deployment
1. Set up environment variables
2. Install dependencies
3. Run with uvicorn:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Testing

The API includes automatic documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check environment variables
   - Verify Supabase project URL and keys

2. **OCR Not Working**
   - Install Tesseract OCR
   - Check image format and quality

3. **Import Errors**
   - Install all dependencies: `pip install -r requirements.txt`
   - Check Python version (3.8+)

## License

This project is part of the ANPR system for traffic management in Ghana. 