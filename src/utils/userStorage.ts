// User Storage System for managing accounts across the application

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  accountType: 'police' | 'dvla';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  password: string; // In production, this would be hashed
  // Police-specific fields
  badgeNumber?: string;
  rank?: string;
  station?: string;
  // DVLA-specific fields
  idNumber?: string;
  position?: string;
}

export interface LoginCredentials {
  username: string; // Badge number for police, ID number for DVLA
  password: string;
  accountType: 'police' | 'dvla';
}

// Storage keys
const USERS_STORAGE_KEY = 'prs_users';

// Get all users from localStorage
export const getAllUsers = (): User[] => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error getting users from storage:', error);
    return [];
  }
};

// Save users to localStorage
export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to storage:', error);
  }
};

// Add a new user (pending approval)
export const addUser = (userData: Omit<User, 'id' | 'status' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const users = getAllUsers();
  users.push(newUser);
  saveUsers(users);
  
  return newUser;
};

// Approve a user account
export const approveUser = (userId: string): User | null => {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    status: 'approved',
    approvedAt: new Date().toISOString()
  };
  
  saveUsers(users);
  return users[userIndex];
};

// Reject a user account
export const rejectUser = (userId: string): boolean => {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  users[userIndex] = {
    ...users[userIndex],
    status: 'rejected'
  };
  
  saveUsers(users);
  return true;
};

// Get pending users for approval
export const getPendingUsers = (): User[] => {
  const users = getAllUsers();
  return users.filter(user => user.status === 'pending');
};

// Get approved users
export const getApprovedUsers = (): User[] => {
  const users = getAllUsers();
  return users.filter(user => user.status === 'approved');
};

// Authenticate user login
export const authenticateUser = (credentials: LoginCredentials): User | null => {
  const approvedUsers = getApprovedUsers();
  
  return approvedUsers.find(user => {
    if (user.accountType !== credentials.accountType) return false;
    
    const usernameMatch = user.accountType === 'police' 
      ? user.badgeNumber === credentials.username
      : user.idNumber === credentials.username;
    
    return usernameMatch && user.password === credentials.password;
  }) || null;
};

// Check if username exists (for registration validation)
export const isUsernameExists = (username: string, accountType: 'police' | 'dvla'): boolean => {
  const users = getAllUsers();
  
  return users.some(user => {
    if (user.accountType !== accountType) return false;
    
    return accountType === 'police' 
      ? user.badgeNumber === username
      : user.idNumber === username;
  });
};

// Initialize with some demo data if no users exist
export const initializeDemoUsers = (): void => {
  const existingUsers = getAllUsers();
  
  if (existingUsers.length === 0) {
    const demoUsers: User[] = [
      {
        id: 'demo-police-1',
        firstName: 'Kwame',
        lastName: 'Asante',
        email: 'kwame.asante@police.gh',
        telephone: '+233 24 123 4567',
        accountType: 'police',
        status: 'approved',
        createdAt: '2024-01-15T10:00:00Z',
        approvedAt: '2024-01-15T11:00:00Z',
        password: 'Password123!',
        badgeNumber: 'P001234',
        rank: 'Sergeant',
        station: 'Accra Central'
      },
      {
        id: 'demo-dvla-1',
        firstName: 'Ama',
        lastName: 'Osei',
        email: 'ama.osei@dvla.gov.gh',
        telephone: '+233 24 987 6543',
        accountType: 'dvla',
        status: 'approved',
        createdAt: '2024-01-16T10:00:00Z',
        approvedAt: '2024-01-16T11:00:00Z',
        password: 'Password123!',
        idNumber: 'D567890',
        position: 'Registration Officer'
      }
    ];
    
    saveUsers(demoUsers);
    console.log('Demo users initialized');
  }
};
