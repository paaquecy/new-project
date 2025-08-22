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
  },
  {
    id: '6',
    plateNumber: 'GT-4567-21',
    offense: 'No Seat Belt',
    description: 'Driver and passenger not wearing seat belts while driving',
    capturedBy: 'Officer Jennifer Adams',
    officerId: 'OFC006',
    dateTime: '2025-01-20T09:15:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Spintex Road, Accra'
  },
  {
    id: '7',
    plateNumber: 'ER-8901-22',
    offense: 'Overloading',
    description: 'Commercial vehicle carrying passengers beyond legal capacity',
    capturedBy: 'Officer Kevin Thompson',
    officerId: 'OFC007',
    dateTime: '2025-01-20T12:45:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/1118448/pexels-photo-1118448.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Kaneshie Market, Accra'
  },
  {
    id: '8',
    plateNumber: 'AW-2345-20',
    offense: 'Wrong Way Driving',
    description: 'Vehicle driving against traffic flow on one-way street',
    capturedBy: 'Officer Patricia Williams',
    officerId: 'OFC008',
    dateTime: '2025-01-20T07:20:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/3593922/pexels-photo-3593922.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Liberation Road, Accra'
  },
  {
    id: '9',
    plateNumber: 'TV-6789-23',
    offense: 'Expired License',
    description: 'Driver operating vehicle with expired drivers license',
    capturedBy: 'Officer James Anderson',
    officerId: 'OFC009',
    dateTime: '2025-01-20T13:30:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'East Legon, Accra'
  },
  {
    id: '10',
    plateNumber: 'BA-1111-19',
    offense: 'Noise Pollution',
    description: 'Vehicle using excessive horn and loud music in residential area',
    capturedBy: 'Officer Maria Garcia',
    officerId: 'OFC010',
    dateTime: '2025-01-20T19:45:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Dansoman, Accra'
  },
  {
    id: '11',
    plateNumber: 'CP-3333-22',
    offense: 'Driving Under Influence',
    description: 'Driver suspected of operating vehicle under influence of alcohol',
    capturedBy: 'Officer Daniel Rodriguez',
    officerId: 'OFC011',
    dateTime: '2025-01-20T22:10:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Osu, Accra'
  },
  {
    id: '12',
    plateNumber: 'NR-5555-21',
    offense: 'Unregistered Vehicle',
    description: 'Vehicle operating without valid registration documents',
    capturedBy: 'Officer Angela Moore',
    officerId: 'OFC012',
    dateTime: '2025-01-20T15:25:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/3806748/pexels-photo-3806748.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Achimota, Accra'
  },
  {
    id: '13',
    plateNumber: 'UW-7777-20',
    offense: 'Dangerous Overtaking',
    description: 'Vehicle overtaking in prohibited zone with oncoming traffic',
    capturedBy: 'Officer Steven Clark',
    officerId: 'OFC013',
    dateTime: '2025-01-20T10:40:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Kumasi Highway, Accra'
  },
  {
    id: '14',
    plateNumber: 'VR-9999-23',
    offense: 'Tinted Windows',
    description: 'Vehicle windows tinted beyond legal limit obstructing visibility',
    capturedBy: 'Officer Nancy Lewis',
    officerId: 'OFC014',
    dateTime: '2025-01-20T11:55:00Z',
    status: 'pending' as const,
    imageUrl: 'https://images.pexels.com/photos/2777898/pexels-photo-2777898.jpeg?auto=compress&cs=tinysrgb&w=300',
    location: 'Airport Residential Area, Accra'
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
