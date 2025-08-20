# ANPR Backend Setup Guide

## 🎯 What We've Built

We've created a comprehensive Python FastAPI backend for your ANPR system with the following features:

### ✅ Core Components
- **FastAPI Application** (`main.py`) - RESTful API with authentication
- **Plate Recognition Service** - ML-powered OCR using EasyOCR and OpenCV
- **Database Integration** - Supabase for scalable data storage
- **Authentication System** - JWT-based with role-based access
- **Vehicle Management** - Complete CRUD operations
- **Violation Tracking** - Full violation lifecycle management

### 🏗️ Architecture
```
backend/
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
├── start.py                  # Startup script
├── test_api.py               # API testing script
├── setup_database.py         # Database setup
├── env_example.txt           # Environment template
├── README.md                 # Backend documentation
├── database/
│   └── supabase_client.py    # Supabase connection
├── models/                   # Pydantic data models
│   ├── user.py
│   ├── vehicle.py
│   └── violation.py
└── services/                 # Business logic
    ├── auth_service.py
    ├── plate_recognition_service.py
    ├── vehicle_service.py
    └── violation_service.py
```

## 🚀 Quick Start

### 1. Set Up Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Create Database Tables**
   - Run the SQL schemas from `setup_database.py`
   - Or use the setup script: `python setup_database.py`

### 2. Configure Environment

1. **Copy environment template**
   ```bash
   cp env_example.txt .env
   ```

2. **Fill in your credentials**
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SECRET_KEY=your-secret-key-change-this-in-production
   ```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Start the Server

```bash
python start.py
```

The API will be available at `http://localhost:8000`

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Plate Recognition
- `POST /plate-recognition` - Extract plate number from image

### Vehicles
- `GET /vehicles/{plate_number}` - Get vehicle info
- `POST /vehicles` - Register new vehicle

### Violations
- `GET /violations` - List violations
- `POST /violations` - Create violation
- `PUT /violations/{id}/approve` - Approve violation
- `PUT /violations/{id}/reject` - Reject violation

## 🧪 Testing

### Run API Tests
```bash
python test_api.py
```

### Manual Testing
1. Start the server: `python start.py`
2. Open browser: `http://localhost:8000/docs`
3. Test endpoints using Swagger UI

## 🔐 Authentication Credentials

Use these test credentials:

| Role | Username | Password |
|------|----------|----------|
| Admin | 4231220075 | Wattaddo020 |
| Police | 1234567890 | Madman020 |
| DVLA | 0987654321 | Bigfish020 |
| Supervisor | 0203549815 | Killerman020 |

## 📊 Database Schema

### Users Table
- UUID primary key
- Username, email, password_hash
- Role-based access (admin, police, dvla, supervisor)
- Status tracking (pending, active, suspended)

### Vehicles Table
- Plate number (unique)
- Vehicle details (make, model, year, color)
- Owner information
- Registration and expiry dates
- Status tracking

### Violations Table
- Violation details and evidence
- Status workflow (pending → approved/rejected)
- Officer and supervisor tracking
- Fine amounts and descriptions

## 🤖 Machine Learning Features

### Plate Recognition Pipeline
1. **Image Preprocessing** - OpenCV for noise reduction and enhancement
2. **Region Detection** - Contour detection for plate regions
3. **OCR Processing** - EasyOCR for text extraction
4. **Format Validation** - Regex patterns for Ghana license plates
5. **Confidence Scoring** - Reliability assessment

### Supported Plate Formats
- `AB 1234 C` (Standard)
- `AB1234C` (No spaces)
- `AB 1234` (Short format)
- And variations

## 🔗 Frontend Integration

### Update Frontend API Calls
Replace mock data in your React components with real API calls:

```javascript
// Example: Login
const login = async (username, password) => {
  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return response.json();
};

// Example: Plate Recognition
const recognizePlate = async (imageData) => {
  const response = await fetch('http://localhost:8000/plate-recognition', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ image_data: imageData })
  });
  return response.json();
};
```

## 🚀 Deployment

### Local Development
```bash
python start.py
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

## 📋 Next Steps

1. **Set up Supabase database** with the provided schemas
2. **Configure environment variables** in `.env` file
3. **Test the API** using `test_api.py`
4. **Update frontend** to use real API endpoints
5. **Deploy to production** (Netlify for frontend, your choice for backend)

## 🆘 Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Check environment variables
   - Verify project URL and API keys

2. **OCR Not Working**
   - Install Tesseract OCR: `sudo apt-get install tesseract-ocr`
   - Check image format and quality

3. **Import Errors**
   - Install dependencies: `pip install -r requirements.txt`
   - Check Python version (3.8+)

4. **Authentication Issues**
   - Verify user credentials in database
   - Check JWT secret key

## 📞 Support

If you encounter issues:
1. Check the logs in the terminal
2. Verify database connection
3. Test individual endpoints
4. Review the README.md for detailed documentation

---

**🎉 Your ANPR backend is ready!** 

The system now has a complete Python backend with ML-powered plate recognition, secure authentication, and scalable database integration. You can now connect your React frontend to this backend for a fully functional ANPR system. 