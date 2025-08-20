export interface Violation {
  id: string;
  plateNumber: string;
  offense: string;
  description: string;
  capturedBy: string;
  officerId: string;
  dateTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  imageUrl?: string;
  videoUrl?: string;
  location: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'supervisor' | 'officer';
}

export interface Notification {
  id: string;
  message: string;
  type: 'new_violation' | 'system' | 'info';
  read: boolean;
  createdAt: string;
  violationId?: string;
}

export interface DashboardStats {
  totalToday: number;
  accepted: number;
  rejected: number;
  pending: number;
  weeklyData: Array<{
    day: string;
    violations: number;
    accepted: number;
    rejected: number;
  }>;
}