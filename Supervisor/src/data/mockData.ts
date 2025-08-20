import { Violation, User, Notification, DashboardStats } from '../types';

// Create a mutable copy of violations for state management
let violationsState = [
  {
    id: '1',
    plateNumber: 'GH-1234-20',
    offense: 'Speeding',
    description: 'Vehicle exceeded speed limit by 20km/h in a school zone',
    capturedBy: 'Officer Sarah Johnson',
    officerId: 'OFC001',
    dateTime: '2025-01-20T08:30:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Independence Avenue, Accra'
  },
  {
    id: '2',
    plateNumber: 'AS-5678-21',
    offense: 'Illegal Parking',
    description: 'Vehicle parked in a no-parking zone blocking emergency access',
    capturedBy: 'Officer Michael Brown',
    officerId: 'OFC002',
    dateTime: '2025-01-20T14:15:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Oxford Street, Accra'
  },
  {
    id: '3',
    plateNumber: 'BA-9876-19',
    offense: 'Running Red Light',
    description: 'Vehicle proceeded through intersection after light turned red',
    capturedBy: 'Officer David Wilson',
    officerId: 'OFC003',
    dateTime: '2025-01-19T18:45:00Z',
    status: 'accepted' as const,
    imageUrl: 'https://images.pexels.com/photos/3806748/pexels-photo-3806748.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Ring Road Central, Accra',
    reviewedBy: 'Martin Mensah',
    reviewedAt: '2025-01-19T19:00:00Z'
  },
  {
    id: '4',
    plateNumber: 'WR-3456-22',
    offense: 'Reckless Driving',
    description: 'Vehicle changing lanes without signaling and tailgating',
    capturedBy: 'Officer Lisa Martinez',
    officerId: 'OFC004',
    dateTime: '2025-01-18T11:20:00Z',
    status: 'rejected' as const,
    imageUrl: 'https://images.pexels.com/photos/2777898/pexels-photo-2777898.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Airport Highway, Accra',
    reviewedBy: 'Martin Mensah',
    reviewedAt: '2025-01-18T11:35:00Z',
    rejectionReason: 'Insufficient evidence of reckless behavior'
  },
  {
    id: '5',
    plateNumber: 'UE-7890-23',
    offense: 'Mobile Phone Use',
    description: 'Driver using mobile phone while driving without hands-free device',
    capturedBy: 'Officer Robert Taylor',
    officerId: 'OFC005',
    dateTime: '2025-01-20T16:30:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Tema Motorway, Accra'
  }
];

export const mockUser: User = {
  id: '1',
  username: 'supervisor1',
  name: 'Martin Mensah',
  email: 'Martinmen53@traffic.gov',
  role: 'supervisor'
};

export const mockViolations: Violation[] = violationsState;

export const mockNotifications: Notification[] = [
  {
    id: '1',
    message: 'New violation submitted by Officer Sarah Johnson',
    type: 'new_violation',
    read: false,
    createdAt: '2025-01-20T08:35:00Z',
    violationId: '1'
  },
  {
    id: '2',
    message: 'New violation submitted by Officer Michael Brown',
    type: 'new_violation',
    read: false,
    createdAt: '2025-01-20T14:20:00Z',
    violationId: '2'
  },
  {
    id: '3',
    message: 'System maintenance scheduled for tonight at 2 AM',
    type: 'system',
    read: true,
    createdAt: '2025-01-19T09:00:00Z'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalToday: 3,
  accepted: 1,
  rejected: 0,
  pending: 2,
  weeklyData: [
    { day: 'Mon', violations: 8, accepted: 6, rejected: 2 },
    { day: 'Tue', violations: 12, accepted: 9, rejected: 3 },
    { day: 'Wed', violations: 6, accepted: 4, rejected: 2 },
    { day: 'Thu', violations: 15, accepted: 12, rejected: 3 },
    { day: 'Fri', violations: 10, accepted: 7, rejected: 3 },
    { day: 'Sat', violations: 4, accepted: 3, rejected: 1 },
    { day: 'Sun', violations: 3, accepted: 1, rejected: 2 }
  ]
};

// Functions to update violation status
export const acceptViolation = (violationId: string): boolean => {
  const violationIndex = violationsState.findIndex(v => v.id === violationId);
  if (violationIndex === -1) return false;
  
  violationsState[violationIndex] = {
    ...violationsState[violationIndex],
    status: 'accepted',
    reviewedBy: 'Martin Mensah',
    reviewedAt: new Date().toISOString()
  };
  
  return true;
};

export const rejectViolation = (violationId: string, reason?: string): boolean => {
  const violationIndex = violationsState.findIndex(v => v.id === violationId);
  if (violationIndex === -1) return false;
  
  violationsState[violationIndex] = {
    ...violationsState[violationIndex],
    status: 'rejected',
    reviewedBy: 'Martin Mensah',
    reviewedAt: new Date().toISOString(),
    rejectionReason: reason || 'No reason provided'
  };
  
  return true;
};

// Function to get updated dashboard stats
export const getUpdatedDashboardStats = (): DashboardStats => {
  const today = new Date().toISOString().split('T')[0];
  const todayViolations = violationsState.filter(v => v.dateTime.startsWith(today));
  
  return {
    ...mockDashboardStats,
    totalToday: todayViolations.length,
    accepted: todayViolations.filter(v => v.status === 'accepted').length,
    rejected: todayViolations.filter(v => v.status === 'rejected').length,
    pending: todayViolations.filter(v => v.status === 'pending').length
  };
};