# Supabase Integration Setup Guide for ANPR Project

## Prerequisites
- Supabase account (free tier available)
- Your ANPR project repository

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. **Click "New Project"**
3. **Choose your organization**
4. **Enter project details:**
   - Name: `anpr-system`
   - Database Password: Use your password from `supabase.password` file
   - Region: Choose closest to your users
5. **Click "Create new project"**

## Step 2: Get Project Credentials

1. **Go to Project Settings** → **API**
2. **Copy the following:**
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)
   - **Service Role Key** (for backend access)

## Step 3: Set Up Environment Variables

### Frontend (.env file in project root)
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend (.env file in backend directory)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database Schema

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy and paste the contents** of `backend/supabase/schema.sql`
3. **Click "Run"** to execute the schema

This will create:
- `users` table (for user management)
- `vehicles` table (for vehicle registry)
- `violations` table (for traffic violations)
- `pending_approvals` table (for user registration requests)

## Step 5: Install Dependencies

### Frontend
```bash
cd number-plate-recognition.-new
npm install @supabase/supabase-js
```

### Backend
```bash
cd number-plate-recognition.-new/backend
pip install -r requirements.txt
```

## Step 6: Test Backend Integration

```bash
cd number-plate-recognition.-new/backend
python supabase/setup.py
```

This will:
- Check environment variables
- Validate configuration
- Test database connection
- Optionally insert sample data
- Test all CRUD operations

## Step 7: Update Your Components

### Frontend: Update LoginPage to use Supabase Auth

```typescript
import { authService } from '../services/supabaseService'

// In your login handler:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const { user } = await authService.signIn(email, password)
    if (user) {
      // Handle successful login
      onLogin('main')
    }
  } catch (error) {
    console.error('Login failed:', error)
    alert('Login failed. Please check your credentials.')
  }
}
```

### Frontend: Update ViolationTable to use Supabase

```typescript
import { violationService } from '../services/supabaseService'

// In your component:
const [violations, setViolations] = useState([])

useEffect(() => {
  const loadViolations = async () => {
    try {
      const data = await violationService.getViolations()
      setViolations(data)
    } catch (error) {
      console.error('Failed to load violations:', error)
    }
  }
  
  loadViolations()
}, [])
```

### Backend: Update API Endpoints

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

## Step 8: Set Up Row Level Security (RLS)

The schema already includes RLS policies, but you may need to:

1. **Go to Authentication** → **Settings**
2. **Enable "Enable email confirmations"** if needed
3. **Configure email templates** for user registration

## Step 9: Deploy to Netlify with Environment Variables

1. **In Netlify Dashboard**, go to your site settings
2. **Navigate to** Environment variables
3. **Add the following variables:**
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

## Step 10: Test the Complete System

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test user registration and login**
3. **Test vehicle registration**
4. **Test violation creation and management**
5. **Test approval workflows**

## 📁 Project Structure

```
number-plate-recognition.-new/
├── src/
│   ├── lib/supabase.ts              # Frontend Supabase client
│   └── services/supabaseService.ts  # Frontend service layer
├── backend/
│   └── supabase/
│       ├── schema.sql               # Database schema
│       ├── client.py                # Backend Supabase client
│       ├── config.py                # Configuration
│       ├── setup.py                 # Setup script
│       └── README.md                # Backend documentation
├── .env                             # Frontend environment variables
└── backend/.env                     # Backend environment variables
```

## Database Tables Overview

### Users Table
- Stores user accounts with roles (admin, police, dvla, supervisor)
- Handles authentication and authorization

### Vehicles Table
- Stores vehicle registration information
- Links to violations and ownership

### Violations Table
- Stores traffic violations
- Links to vehicles and officers
- Tracks violation status and fines

### Pending Approvals Table
- Stores user registration requests
- Manages approval workflow for new accounts

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** for different user types
- **Secure authentication** via Supabase Auth
- **Environment variable protection** for API keys

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check your `.env` file exists and has correct values
   - Ensure variables start with `VITE_` for frontend

2. **"Connection failed"**
   - Verify your project URL and anon key
   - Check if your Supabase project is active

3. **"Permission denied"**
   - Check RLS policies in Supabase dashboard
   - Verify user authentication status

4. **"Table doesn't exist"**
   - Run the schema.sql file in Supabase SQL editor
   - Check table names match your code

### Backend-Specific Issues:

1. **"Service key not found"**
   - Make sure `SUPABASE_SERVICE_KEY` is set in backend `.env`
   - Use the service role key, not the anon key

2. **"Import error"**
   - Install Supabase Python client: `pip install supabase`
   - Check Python path and imports

## Next Steps

After setup:
1. **Customize the database schema** for your specific needs
2. **Add more tables** if required (e.g., for analytics, reports)
3. **Implement real-time features** using Supabase subscriptions
4. **Add file storage** for images and documents
5. **Set up automated backups** and monitoring

## 📚 Additional Resources

- [Backend Supabase Documentation](backend/supabase/README.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Python Client](https://supabase.com/docs/reference/python)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

Your ANPR system is now connected to Supabase! 🚀
