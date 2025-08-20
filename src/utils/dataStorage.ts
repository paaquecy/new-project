// Centralized data storage utilities for persistent data management across all apps

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'Admin' | 'Police Officer' | 'DVLA Officer' | 'Supervisor' | 'Operator' | 'Viewer';
  system: 'Main App' | 'Police App' | 'DVLA App' | 'Supervisor App';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string | null;
}

export interface ViolationRecord {
  id: string;
  plateNumber: string;
  violationType: string;
  location: string;
  timestamp: string;
  officerId: string;
  officerName: string;
  status: 'pending' | 'approved' | 'rejected';
  evidence?: string;
  description?: string;
  fine?: number;
}

export interface VehicleRecord {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  owner: string;
  ownerContact: string;
  registrationDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'suspended';
}

export interface DVLAFine {
  id: string;
  plateNumber: string;
  vehicleId: string;
  amount: number;
  reason: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  issuedBy: string;
}

export interface SystemData {
  users: User[];
  violations: ViolationRecord[];
  vehicles: VehicleRecord[];
  fines: DVLAFine[];
  notifications: Notification[];
  systemSettings: Record<string, any>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  userId?: string;
  system: string;
}

// Storage keys
const STORAGE_KEYS = {
  USERS: 'vpr_users',
  VIOLATIONS: 'vpr_violations',
  VEHICLES: 'vpr_vehicles',
  FINES: 'vpr_fines',
  NOTIFICATIONS: 'vpr_notifications',
  SETTINGS: 'vpr_settings'
} as const;

// Initial data
const INITIAL_USERS: User[] = [
  // Main App Admin Users
  {
    id: 'USR001',
    username: '4231220075',
    name: 'Obeng Addo Paa kwesi',
    email: 'admin@vpr.gov.gh',
    role: 'Admin',
    system: 'Main App',
    status: 'active',
    lastLogin: '2024-01-07 11:00 AM'
  },
  {
    id: 'USR002',
    username: '0203549815',
    name: 'Martin Mensah',
    email: 'supervisor@vpr.gov.gh',
    role: 'Supervisor',
    system: 'Main App',
    status: 'active',
    lastLogin: '2024-01-07 09:45 AM'
  },
  
  // Police App Users
  {
    id: 'USR003',
    username: '1234567890',
    name: 'Officer Michael Osei',
    email: 'michael.osei@police.gov.gh',
    role: 'Police Officer',
    system: 'Police App',
    status: 'active',
    lastLogin: '2024-01-07 08:30 AM'
  },
  
  // DVLA App Users
  {
    id: 'USR004',
    username: '0987654321',
    name: 'Kwame Asante',
    email: 'kwame.asante@dvla.gov.gh',
    role: 'DVLA Officer',
    system: 'DVLA App',
    status: 'active',
    lastLogin: '2024-01-07 10:15 AM'
  },
  {
    id: 'USR005',
    username: 'admin',
    name: 'DVLA Admin',
    email: 'admin@dvla.gov.gh',
    role: 'Admin',
    system: 'DVLA App',
    status: 'active',
    lastLogin: '2024-01-06 04:20 PM'
  },
  
  // Supervisor App Users
  {
    id: 'USR006',
    username: 'supervisor1',
    name: 'Martin Mensah',
    email: 'martinmen53@traffic.gov.gh',
    role: 'Supervisor',
    system: 'Supervisor App',
    status: 'active',
    lastLogin: '2024-01-07 02:30 PM'
  },
  
  // Additional system users
  {
    id: 'USR007',
    username: 'police001',
    name: 'Sarah Agyemang',
    email: 'sarah.agyemang@police.gov.gh',
    role: 'Police Officer',
    system: 'Police App',
    status: 'inactive',
    lastLogin: '2024-01-05 03:00 PM'
  },
  {
    id: 'USR008',
    username: 'dvla001',
    name: 'Joseph Nkrumah',
    email: 'joseph.nkrumah@dvla.gov.gh',
    role: 'DVLA Officer',
    system: 'DVLA App',
    status: 'pending',
    lastLogin: null
  },
  {
    id: 'USR009',
    username: 'operator001',
    name: 'Alice Boateng',
    email: 'alice.boateng@vpr.gov.gh',
    role: 'Operator',
    system: 'Main App',
    status: 'active',
    lastLogin: '2024-01-07 12:45 PM'
  },
  {
    id: 'USR010',
    username: 'viewer001',
    name: 'Robert Amankwah',
    email: 'robert.amankwah@vpr.gov.gh',
    role: 'Viewer',
    system: 'Main App',
    status: 'active',
    lastLogin: '2024-01-06 01:20 PM'
  }
];

// Mock vehicle data with Ghanaian number plates
const INITIAL_VEHICLES: VehicleRecord[] = [
  {
    id: '1',
    plateNumber: 'GR 1234 - 23',
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    owner: 'Kwame Asante',
    ownerContact: '+233-24-123-4567',
    registrationDate: '2023-01-15',
    expiryDate: '2025-01-15',
    status: 'active'
  },
  {
    id: '2',
    plateNumber: 'AS 5678 - 23',
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    owner: 'Ama Osei',
    ownerContact: '+233-20-456-7890',
    registrationDate: '2023-02-20',
    expiryDate: '2025-02-20',
    status: 'active'
  },
  {
    id: '3',
    plateNumber: 'WR 9876 - 23',
    make: 'Toyota',
    model: 'Hilux',
    year: 2023,
    owner: 'Kofi Mensah',
    ownerContact: '+233-26-789-0123',
    registrationDate: '2023-03-10',
    expiryDate: '2025-03-10',
    status: 'active'
  }
];

// Mock violation data with Ghanaian number plates
const INITIAL_VIOLATIONS: ViolationRecord[] = [
  {
    id: '1',
    plateNumber: 'GR 1234 - 23',
    violationType: 'Speeding',
    location: 'Ring Road Central, Accra',
    timestamp: '2024-01-15T10:30:00Z',
    officerId: 'OFF001',
    officerName: 'Officer Kwame',
    status: 'pending',
    evidence: 'speed_camera_evidence.jpg',
    description: 'Exceeding speed limit by 20 km/h',
    fine: 200
  },
  {
    id: '2',
    plateNumber: 'AS 5678 - 23',
    violationType: 'Parking',
    location: 'Kumasi High Street, Kumasi',
    timestamp: '2024-01-14T14:15:00Z',
    officerId: 'OFF002',
    officerName: 'Officer Ama',
    status: 'approved',
    evidence: 'parking_violation.jpg',
    description: 'Parking in no parking zone',
    fine: 100
  }
];

const INITIAL_FINES: DVLAFine[] = [
  {
    id: 'FINE001',
    plateNumber: 'GH-1234-20',
    vehicleId: 'VEH001',
    amount: 150,
    reason: 'Speeding violation',
    issueDate: '2024-01-07',
    dueDate: '2024-02-06',
    status: 'pending',
    issuedBy: 'USR004'
  },
  {
    id: 'FINE002',
    plateNumber: 'AS-5678-21',
    vehicleId: 'VEH002',
    amount: 50,
    reason: 'Illegal parking',
    issueDate: '2024-01-06',
    dueDate: '2024-02-05',
    status: 'paid',
    issuedBy: 'USR004'
  }
];

// Utility functions for localStorage management
class DataStorage {
  private static instance: DataStorage;

  private constructor() {
    this.initializeStorage();
  }

  static getInstance(): DataStorage {
    if (!DataStorage.instance) {
      DataStorage.instance = new DataStorage();
    }
    return DataStorage.instance;
  }

  private initializeStorage(): void {
    // Initialize with default data if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.saveUsers(INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      this.saveVehicles(INITIAL_VEHICLES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VIOLATIONS)) {
      this.saveViolations(INITIAL_VIOLATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINES)) {
      this.saveFines(INITIAL_FINES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.saveNotifications([]);
    }
  }

  // Users
  getUsers(): User[] {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : INITIAL_USERS;
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.dispatchStorageEvent('users', users);
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      this.saveUsers(users);
    }
  }

  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    this.saveUsers(filteredUsers);
  }

  // Vehicles
  getVehicles(): VehicleRecord[] {
    const vehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return vehicles ? JSON.parse(vehicles) : INITIAL_VEHICLES;
  }

  saveVehicles(vehicles: VehicleRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    this.dispatchStorageEvent('vehicles', vehicles);
  }

  addVehicle(vehicle: VehicleRecord): void {
    const vehicles = this.getVehicles();
    vehicles.push(vehicle);
    this.saveVehicles(vehicles);
  }

  updateVehicle(updatedVehicle: VehicleRecord): void {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex(v => v.id === updatedVehicle.id);
    if (index !== -1) {
      vehicles[index] = updatedVehicle;
      this.saveVehicles(vehicles);
    }
  }

  // Violations
  getViolations(): ViolationRecord[] {
    const violations = localStorage.getItem(STORAGE_KEYS.VIOLATIONS);
    return violations ? JSON.parse(violations) : INITIAL_VIOLATIONS;
  }

  saveViolations(violations: ViolationRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify(violations));
    this.dispatchStorageEvent('violations', violations);
  }

  addViolation(violation: ViolationRecord): void {
    const violations = this.getViolations();
    violations.push(violation);
    this.saveViolations(violations);
  }

  updateViolation(updatedViolation: ViolationRecord): void {
    const violations = this.getViolations();
    const index = violations.findIndex(v => v.id === updatedViolation.id);
    if (index !== -1) {
      violations[index] = updatedViolation;
      this.saveViolations(violations);
    }
  }

  // Fines
  getFines(): DVLAFine[] {
    const fines = localStorage.getItem(STORAGE_KEYS.FINES);
    return fines ? JSON.parse(fines) : INITIAL_FINES;
  }

  saveFines(fines: DVLAFine[]): void {
    localStorage.setItem(STORAGE_KEYS.FINES, JSON.stringify(fines));
    this.dispatchStorageEvent('fines', fines);
  }

  addFine(fine: DVLAFine): void {
    const fines = this.getFines();
    fines.push(fine);
    this.saveFines(fines);
  }

  updateFine(updatedFine: DVLAFine): void {
    const fines = this.getFines();
    const index = fines.findIndex(f => f.id === updatedFine.id);
    if (index !== -1) {
      fines[index] = updatedFine;
      this.saveFines(fines);
    }
  }

  // Notifications
  getNotifications(): Notification[] {
    const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return notifications ? JSON.parse(notifications) : [];
  }

  saveNotifications(notifications: Notification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    this.dispatchStorageEvent('notifications', notifications);
  }

  addNotification(notification: Notification): void {
    const notifications = this.getNotifications();
    notifications.unshift(notification);
    this.saveNotifications(notifications);
  }

  // Authentication
  authenticateUser(username: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.status === 'active');
    
    if (user) {
      // Update last login
      const updatedUser = { ...user, lastLogin: new Date().toLocaleString() };
      this.updateUser(updatedUser);
      return updatedUser;
    }
    
    return null;
  }

  // Utility methods
  generateId(prefix: string): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event dispatching for real-time updates
  private dispatchStorageEvent(dataType: string, data: any): void {
    window.dispatchEvent(new CustomEvent('dataStorageUpdate', {
      detail: { dataType, data }
    }));
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeStorage();
  }

  // Export/Import functionality
  exportData(): SystemData {
    return {
      users: this.getUsers(),
      violations: this.getViolations(),
      vehicles: this.getVehicles(),
      fines: this.getFines(),
      notifications: this.getNotifications(),
      systemSettings: {}
    };
  }

  importData(data: Partial<SystemData>): void {
    if (data.users) this.saveUsers(data.users);
    if (data.violations) this.saveViolations(data.violations);
    if (data.vehicles) this.saveVehicles(data.vehicles);
    if (data.fines) this.saveFines(data.fines);
    if (data.notifications) this.saveNotifications(data.notifications);
  }
}

// Export singleton instance
export const dataStorage = DataStorage.getInstance();

// Convenience functions
export const {
  getUsers,
  saveUsers,
  addUser,
  updateUser,
  deleteUser,
  getVehicles,
  saveVehicles,
  addVehicle,
  updateVehicle,
  getViolations,
  saveViolations,
  addViolation,
  updateViolation,
  getFines,
  saveFines,
  addFine,
  updateFine,
  getNotifications,
  saveNotifications,
  addNotification,
  authenticateUser,
  generateId,
  clearAllData,
  exportData,
  importData
} = dataStorage;
