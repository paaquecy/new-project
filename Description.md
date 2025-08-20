# Plate Recognition System (NPRS)

## Overview

The Plate Recognition System (NPRS) is a comprehensive, unified web application designed for traffic management and vehicle registration in Ghana. The system integrates four distinct applications into a single platform, each serving specific roles in the traffic management ecosystem.

## System Architecture

The application is built using modern web technologies:
- **Frontend:** React.js with TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Charts:** Recharts for data visualization
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Backend:** Python FastAPI (unified backend for all apps)
- **Database:** Supabase (PostgreSQL)

### Backend & Database
- All modules (Main, DVLA, Police, Supervisor) now communicate with a single FastAPI backend (`backend/main.py`).
- Data is stored in a single Supabase PostgreSQL database, accessed via `backend/database/supabase_client.py`.
- Legacy backends (Node.js for DVLA, Supabase Edge Functions for Police) are deprecated and no longer required.

## Applications Overview

### 1. Main Application (Administrative Dashboard)
**Credentials:** Username: `4231220075`, Password: `Wattaddo020`

**Purpose:** Central administrative hub for system management and oversight.

**Key Features:**
- **Overview Dashboard:** System-wide statistics and analytics
- **Pending Approvals:** Manage user registration requests from Police and DVLA officers
- **Violation Management:** Comprehensive violation tracking and management
- **User Account Management:** Administer user accounts and permissions
- **Vehicle Registry:** Data entry and vehicle registration management
- **Analytics & Reporting:** Generate reports and analyze system data
- **Security Management:** System security controls and monitoring
- **System Settings:** Application configuration and preferences
- **Administrative Controls:** Advanced administrative functions

### 2. DVLA Application (Vehicle Registration)
**Credentials:** Username: `0987654321`, Password: `Bigfish020`

**Purpose:** Vehicle registration, licensing, and data management for DVLA officers.

**Key Features:**
- **Overview Dashboard:** DVLA-specific statistics and vehicle registration metrics
- **Vehicle Data Entry:** Register new vehicles and update existing records
- **Vehicle Records:** Search and manage vehicle registration database
- **Registration Renewal:** Process license and registration renewals
- **Data Analysis:** Analyze vehicle registration trends and patterns
- **Data Quality Management:** Ensure data accuracy and completeness
- **System Health Monitoring:** Monitor system performance and data integrity
- **Settings:** DVLA-specific configuration and preferences

### 3. Police Application (Traffic Enforcement)
**Credentials:** Username: `1234567890`, Password: `Madman020`

**Purpose:** Traffic violation reporting and enforcement for police officers.

**Key Features:**
- **Overview Dashboard:** Police-specific violation statistics and enforcement metrics
- **Field Reporting:** Report traffic violations in real-time
- **Vehicle Scanner:** Scan and identify vehicles using plate recognition
- **Vehicle Information Access:** Quick access to vehicle and owner information
- **Violation Flagging:** Flag and categorize traffic violations
- **Violations Management:** Manage and track violation cases
- **Personal Settings:** Officer-specific preferences and settings

### 4. Supervisor Application (Review & Approval)
**Credentials:** Username: `0203549815`, Password: `Killerman020`

**Purpose:** Review and approve traffic violations submitted by police officers.

**Key Features:**
- **Dashboard:** Overview of violation statistics with interactive charts
- **Pending Violations:** Review and approve/reject submitted violations
- **History:** View past violation decisions and outcomes
- **Notifications:** System alerts and violation notifications
- **Settings:** Supervisor preferences and system configuration

## How It Works

### Authentication & Routing
1. **Unified Login:** All users access the system through a single login page
2. **Credential-Based Routing:** Based on login credentials, users are automatically routed to their respective application
3. **Session Management:** Maintains user sessions and application state
4. **Logout Functionality:** Secure logout that returns users to the login page
5. **Deterministic Role Routing:**
   - DVLA `0987654321 / Bigfish020` → opens the DVLA app
   - Police `1234567890 / Madman020` → opens the Police app
   - Admin `4231220075 / Wattaddo020` → opens the Main admin dashboard
   - Supervisor `0203549815 / Killerman020` → opens the Supervisor app

### Data Flow
1. **Police Officers** report violations through the Police app
2. **Supervisors** review and approve/reject violations in the Supervisor app
3. **DVLA Officers** manage vehicle registrations and licensing
4. **Administrators** oversee the entire system through the Main app

### Key Workflows

#### Traffic Violation Workflow:
1. Police officer captures violation using Police app
2. Violation is submitted to the system
3. Supervisor reviews violation in Supervisor app
4. Supervisor approves or rejects with comments
5. Decision is recorded and notification sent
6. Data is available in Main app for administrative oversight

#### Vehicle Registration Workflow:
1. DVLA officer enters vehicle data in DVLA app
2. System validates and stores registration information
3. Registration is processed and license issued
4. Data is synchronized across all applications
5. Administrative oversight available in Main app

## Technical Features

### Responsive Design
- Mobile-first approach with responsive layouts
- Optimized for tablets and desktop computers
- Consistent user experience across devices

### Real-time Updates
- Hot module replacement for development
- Live updates without page refresh
- **Auto-sync with backend on refresh/focus:** Data context re-fetches from FastAPI whenever the page is loaded, the tab regains focus, network goes online, or cross-tab storage changes.

### Security Management
- Centralized security configuration (password policy, session timeout, 2FA toggle, IP whitelisting) is managed in the app and applied across all modules.

### Email Notifications
- When an account is approved or rejected from the admin dashboard, a simulated email notification is generated and logged (for demo environments) and can be viewed in the Email Notification History.

### Security Features
- Credential-based access control
- Session management
- Secure logout functionality
- Role-based application access

### Data Visualization
- Interactive charts and graphs
- Statistical dashboards
- Real-time metrics display
- Export capabilities for reports

## User Interface

### Design Principles
- **Clean & Modern:** Minimalist design with clear navigation
- **Consistent:** Unified design language across all applications
- **Accessible:** High contrast and readable typography
- **Intuitive:** Logical navigation and user-friendly interfaces

### Navigation
- **Sidebar Navigation:** Consistent sidebar across all applications
- **Breadcrumb Navigation:** Clear indication of current location
- **Quick Actions:** Easy access to common functions
- **Search Functionality:** Global search capabilities

## System Integration

### Unified Architecture
- Single codebase with modular components
- Shared authentication system
- Consistent data models
- Cross-application data sharing

### Scalability
- Modular component architecture
- Reusable UI components
- Efficient state management
- Optimized performance

## Deployment / Run Locally (Windows)

Backend (FastAPI):
1. Install Python 3.11+ (e.g., via `winget install -e --id Python.Python.3.11`).
2. In `backend/`:
   - Create and activate venv (optional): `python -m venv .venv` then `..\.venv\Scripts\Activate.ps1`
   - Install deps: `python -m pip install -r requirements.txt`
   - Start API: `python start.py`
3. API will run at `http://localhost:8000`.

Frontend (Vite React):
1. From project root:
   - Install deps: `npm ci`
   - Ensure API base URL: set env `VITE_API_BASE_URL=http://localhost:8000` (or add to `.env` for Vite)
   - Start dev server: `npm run dev`
2. App runs at `http://localhost:5173` (Vite default).

Build & Packaging:
- **Build System:** Vite for fast development and optimized production builds
- **Package Management:** npm for dependency management

## Future Enhancements

### Planned Features
- Real-time notifications
- Advanced analytics and reporting
- Mobile application
- API integration with external systems
- Enhanced security features
- Multi-language support

### Technical Improvements
- Performance optimization
- Enhanced error handling
- Improved accessibility
- Advanced search capabilities
- Data export functionality

## Support & Maintenance

The system is designed for easy maintenance and updates:
- Modular code structure
- Comprehensive documentation
- Version control integration
- Automated testing capabilities
- Regular security updates

---

*This unified Plate Recognition System provides a comprehensive solution for traffic management in Ghana, integrating multiple stakeholder applications into a single, efficient platform.* 