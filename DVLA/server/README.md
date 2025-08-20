# DVLA Dashboard Backend API

A comprehensive backend API for the DVLA Dashboard application built with Node.js, Express, and SQLite.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Vehicle Management**: Complete CRUD operations for vehicle registration and management
- **Renewal System**: Track and manage vehicle registration renewals
- **Fine Management**: Process and manage vehicle fines with payment tracking
- **Analytics & Reporting**: Comprehensive analytics and dashboard statistics
- **File Upload**: Support for document and evidence uploads
- **Audit Trail**: Complete audit logging for all operations
- **Data Validation**: Comprehensive input validation and sanitization
- **Security**: Rate limiting, CORS, helmet security headers

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone and navigate to the server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with pagination and search)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle (soft delete)
- `POST /api/vehicles/:id/documents` - Upload vehicle documents
- `GET /api/vehicles/stats/overview` - Get vehicle statistics

### Renewals
- `GET /api/renewals` - Get all renewals (with pagination and filtering)
- `GET /api/renewals/:id` - Get renewal by ID
- `POST /api/renewals` - Create new renewal
- `PUT /api/renewals/:id` - Update renewal
- `GET /api/renewals/stats/overview` - Get renewal statistics

### Fines
- `GET /api/fines` - Get all fines (with pagination and filtering)
- `GET /api/fines/:id` - Get fine by ID
- `POST /api/fines` - Create new fine
- `PUT /api/fines/:id` - Update fine
- `POST /api/fines/:id/clear` - Clear fine (mark as cleared)
- `POST /api/fines/:id/payment-proof` - Upload payment proof
- `POST /api/fines/:id/evidence` - Upload evidence
- `GET /api/fines/stats/overview` - Get fine statistics

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard overview statistics
- `GET /api/analytics/vehicles/trends` - Get vehicle registration trends
- `GET /api/analytics/vehicles/distribution` - Get vehicle type distribution
- `GET /api/analytics/renewals/analytics` - Get renewal analytics
- `GET /api/analytics/fines/analytics` - Get fine analytics
- `GET /api/analytics/system/performance` - Get system performance metrics

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/activity` - Get user activity logs
- `GET /api/users/stats/overview` - Get user statistics

## Database Schema

### Users
- User authentication and profile management
- Role-based access control (admin, user)

### Vehicles
- Complete vehicle registration information
- Physical specifications and engine details
- Owner information

### Renewals
- Vehicle registration renewal tracking
- Payment and transaction information

### Fines
- Vehicle fine management
- Payment tracking and evidence storage

### Audit Logs
- Complete audit trail for all operations
- User action tracking

### Documents
- File upload and document management
- Support for various document types

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

⚠️ **Important**: Change the default admin password in production!

## File Uploads

The API supports file uploads for:
- Vehicle documents
- Payment proofs
- Evidence files (images/videos)

**Supported formats**: JPG, PNG, GIF, PDF, MP4, MOV, AVI
**Maximum file size**: 10MB per file
**Maximum files per request**: 10 files

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if applicable)
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **Password Hashing**: bcrypt with salt rounds

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run migrate` - Initialize/migrate database

### Environment Variables

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./database/dvla.db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Production Deployment

1. **Set environment to production**
   ```bash
   NODE_ENV=production
   ```

2. **Use a strong JWT secret**
   ```bash
   JWT_SECRET=your-very-strong-secret-key
   ```

3. **Configure proper CORS origins**
   ```bash
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **Set up proper file storage** (consider cloud storage for production)

5. **Configure reverse proxy** (nginx recommended)

6. **Set up SSL/TLS certificates**

7. **Configure logging and monitoring**

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.