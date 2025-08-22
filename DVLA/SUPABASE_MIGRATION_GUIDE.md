# DVLA Supabase Migration Guide

## 🎯 Overview

This guide helps you migrate the DVLA module from SQLite to Supabase for better scalability, real-time features, and cloud storage.

## ✅ What's Been Updated

### Database Migration
- ✅ SQLite database replaced with Supabase PostgreSQL
- ✅ All tables recreated in Supabase with proper schema
- ✅ Audit logging and data integrity maintained
- ✅ Row Level Security (RLS) policies configured

### File Storage Migration  
- ✅ Local file uploads replaced with Supabase Storage
- ✅ Automatic file organization in buckets
- ✅ Secure signed URLs for file access
- ✅ File type validation and size limits

### Code Updates
- ✅ All routes updated to use Supabase client
- ✅ New middleware for Supabase file uploads
- ✅ Server configuration updated
- ✅ Package dependencies updated

## 🚀 Getting Started

### Step 1: Set Up Supabase Project

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project**:
   - Name: `dvla-dashboard`
   - Database password: Choose a strong password
   - Region: Select closest to your users
3. **Wait for project initialization** (2-3 minutes)

### Step 2: Configure Environment Variables

1. **Copy environment template**:
   ```bash
   cd DVLA/server
   cp .env.example .env
   ```

2. **Get Supabase credentials** from your project dashboard:
   - Go to Settings → API
   - Copy Project URL
   - Copy anon/public key  
   - Copy service_role key

3. **Update .env file**:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   JWT_SECRET=your-jwt-secret-here
   ```

### Step 3: Set Up Database Schema

1. **Open Supabase SQL Editor**:
   - Go to your Supabase dashboard
   - Click "SQL Editor" in sidebar
   - Click "New query"

2. **Run the schema**:
   - Copy contents of `DVLA/server/config/dvla-schema.sql`
   - Paste in SQL editor
   - Click "Run" to execute

3. **Verify tables created**:
   - Go to "Table Editor"
   - Should see: `dvla_users`, `dvla_vehicles`, `dvla_fines`, etc.

### Step 4: Install Dependencies

```bash
cd DVLA/server
npm install
```

### Step 5: Run Migration Script

```bash
cd DVLA/server
node scripts/setup-supabase.js
```

This script will:
- ✅ Test Supabase connection
- ✅ Set up storage buckets
- ✅ Migrate existing SQLite data (if any)
- ✅ Test CRUD operations

### Step 6: Start the Server

```bash
cd DVLA/server
npm run dev
```

## 🧪 Testing the Migration

### 1. Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "database": {
    "type": "Supabase", 
    "status": "connected"
  }
}
```

### 2. Test User Management
```bash
# Create user (requires admin auth)
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123",
    "full_name": "Test User",
    "role": "user"
  }'
```

### 3. Test Vehicle Registration
```bash
# Register vehicle
curl -X POST http://localhost:5000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reg_number": "TEST-123",
    "manufacturer": "Toyota",
    "model": "Camry",
    "vehicle_type": "sedan",
    "owner_name": "John Doe"
  }'
```

### 4. Test File Upload
```bash
# Upload vehicle document
curl -X POST http://localhost:5000/api/vehicles/VEHICLE_ID/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "documents=@/path/to/test-file.pdf" \
  -F "document_type=registration"
```

### 5. Test Statistics
```bash
# Get vehicle statistics
curl http://localhost:5000/api/vehicles/stats/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Verifying Migration Success

### Database Verification
1. **Go to Supabase Table Editor**
2. **Check each table has data**:
   - `dvla_users` - Should have admin user
   - `dvla_vehicles` - Should have sample vehicles
   - `dvla_fines` - Should have any migrated fines
   - `dvla_audit_logs` - Should log all operations

### Storage Verification  
1. **Go to Supabase Storage**
2. **Check buckets exist**:
   - `dvla-documents`
   - `dvla-evidence` 
   - `dvla-payment-proofs`
3. **Test file upload** through API

### Frontend Integration
1. **Update frontend environment**:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
2. **Test frontend functionality**:
   - Login/logout
   - Vehicle registration
   - File uploads
   - Data viewing

## 🔧 Troubleshooting

### Common Issues

#### "Connection failed" 
- ✅ Check SUPABASE_URL is correct
- ✅ Verify SUPABASE_SERVICE_KEY is service role, not anon
- ✅ Ensure Supabase project is active
- ✅ Check internet connectivity

#### "Table doesn't exist"
- ✅ Run the schema SQL in Supabase dashboard
- ✅ Check all tables created in Table Editor
- ✅ Verify table names match (dvla_users, not users)

#### "Permission denied"
- ✅ Check RLS policies in Supabase dashboard
- ✅ Verify service key has proper permissions
- ✅ Test with authenticated requests

#### "File upload failed"
- ✅ Check storage buckets exist
- ✅ Verify storage policies configured
- ✅ Test file size and type limits

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
SUPABASE_DEBUG=true
```

### Support

1. **Check Supabase status**: https://status.supabase.com
2. **Review Supabase logs** in your dashboard
3. **Check server logs** for detailed error messages
4. **Test with Postman** for API debugging

## 🎉 Benefits of Migration

### Performance
- ✅ Cloud-hosted PostgreSQL database
- ��� Automatic scaling and optimization
- ✅ Real-time subscriptions available
- ✅ Built-in caching and CDN

### Security
- ✅ Row Level Security (RLS) policies
- ✅ Encrypted data storage
- ✅ Secure file storage with signed URLs
- ✅ Built-in authentication

### Features
- ✅ Real-time data updates
- ✅ Advanced SQL queries and functions
- ✅ Automatic backups
- ✅ API auto-generation
- ✅ Built-in admin dashboard

### Scalability
- ✅ Handles concurrent users
- ✅ Automatic file storage scaling
- ✅ Global CDN for file delivery
- ✅ Database connection pooling

## 📈 Next Steps

1. **Set up monitoring** in Supabase dashboard
2. **Configure automated backups**
3. **Set up staging environment**
4. **Implement real-time features** if needed
5. **Optimize queries** based on usage patterns
6. **Set up alerts** for errors and performance

---

**Congratulations!** 🎉 Your DVLA module is now powered by Supabase for better performance, scalability, and features.
