import { supabase } from '../lib/supabase';
import {
  addUser as addUserToStorage,
  authenticateUser as authenticateUserFromStorage,
  isUsernameExists as checkUsernameInStorage,
  approveUser as approveUserInStorage,
  rejectUser as rejectUserInStorage,
  getPendingUsers as getPendingUsersFromStorage,
  getApprovedUsers as getApprovedUsersFromStorage,
  getAllUsers,
  initializeDemoUsers
} from '../utils/userStorage';

export interface UserAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  account_type: 'police' | 'dvla' | 'supervisor' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  password_hash?: string;
  badge_number?: string; // Police only
  rank?: string; // Police only
  station?: string; // Police only
  id_number?: string; // DVLA only
  position?: string; // DVLA only
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  last_login?: string;
}

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  accountType: 'police' | 'dvla';
  password: string;
  // Police-specific fields
  badgeNumber?: string;
  rank?: string;
  station?: string;
  // DVLA-specific fields
  idNumber?: string;
  position?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  accountType: 'police' | 'dvla' | 'supervisor' | 'admin';
}

export interface AuthResult {
  user: UserAccount;
  success: boolean;
  message?: string;
}

class UserAccountService {
  // Check if Supabase is properly configured
  private async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_accounts').select('id').limit(1);
      return !error || error.code !== 'MOCK_CLIENT';
    } catch (error) {
      return false;
    }
  }

  // Hash password (in production, use bcrypt or similar)
  private async hashPassword(password: string): Promise<string> {
    // For demo purposes, we'll use a simple hash
    // In production, use proper password hashing like bcrypt
    return `hashed_${password}`;
  }

  // Verify password (in production, use bcrypt.compare)
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // For demo purposes
    return hash === `hashed_${password}`;
  }

  // Register a new user account (pending approval)
  async registerUser(userData: UserRegistrationData): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const supabaseAvailable = await this.isSupabaseAvailable();

      if (supabaseAvailable) {
        // Use Supabase
        return await this.registerUserWithSupabase(userData);
      } else {
        // Use localStorage fallback
        return await this.registerUserWithLocalStorage(userData);
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }

  private async registerUserWithSupabase(userData: UserRegistrationData): Promise<{ success: boolean; message: string; userId?: string }> {
    // Check if username already exists
    const existingUser = await this.checkUsernameExists(
      userData.accountType === 'police' ? userData.badgeNumber! : userData.idNumber!,
      userData.accountType
    );

    if (existingUser) {
      return {
        success: false,
        message: `${userData.accountType === 'police' ? 'Badge number' : 'ID number'} already exists`
      };
    }

    // Hash password
    const passwordHash = await this.hashPassword(userData.password);

    // Prepare user data for database
    const dbUserData = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      telephone: userData.telephone,
      account_type: userData.accountType,
      status: 'pending' as const,
      password_hash: passwordHash,
      ...(userData.accountType === 'police' ? {
        badge_number: userData.badgeNumber,
        rank: userData.rank,
        station: userData.station
      } : {
        id_number: userData.idNumber,
        position: userData.position
      })
    };

    const { data, error } = await supabase
      .from('user_accounts')
      .insert(dbUserData)
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Account created successfully! Waiting for admin approval.',
      userId: data.id
    };
  }

  private async registerUserWithLocalStorage(userData: UserRegistrationData): Promise<{ success: boolean; message: string; userId?: string }> {
    console.log('Using localStorage fallback for user registration');

    // Check if username already exists
    const username = userData.accountType === 'police' ? userData.badgeNumber! : userData.idNumber!;
    if (checkUsernameInStorage(username, userData.accountType)) {
      return {
        success: false,
        message: `${userData.accountType === 'police' ? 'Badge number' : 'ID number'} already exists`
      };
    }

    // Create user with localStorage
    const newUser = addUserToStorage({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      telephone: userData.telephone,
      accountType: userData.accountType,
      password: userData.password,
      ...(userData.accountType === 'police' ? {
        badgeNumber: userData.badgeNumber,
        rank: userData.rank,
        station: userData.station
      } : {
        idNumber: userData.idNumber,
        position: userData.position
      })
    });

    return {
      success: true,
      message: 'Account created successfully! Waiting for admin approval.',
      userId: newUser.id
    };
  }

  // Check if username exists
  async checkUsernameExists(username: string, accountType: 'police' | 'dvla'): Promise<boolean> {
    try {
      const supabaseAvailable = await this.isSupabaseAvailable();

      if (supabaseAvailable) {
        const column = accountType === 'police' ? 'badge_number' : 'id_number';

        const { data, error } = await supabase
          .from('user_accounts')
          .select('id')
          .eq(column, username)
          .eq('account_type', accountType)
          .single();

        return !error && data !== null;
      } else {
        // Use localStorage fallback
        return checkUsernameInStorage(username, accountType);
      }
    } catch (error) {
      console.error('Username check error:', error);
      // Fallback to localStorage if Supabase fails
      return checkUsernameInStorage(username, accountType);
    }
  }

  // Authenticate user login
  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult | null> {
    try {
      const supabaseAvailable = await this.isSupabaseAvailable();

      if (supabaseAvailable) {
        return await this.authenticateUserWithSupabase(credentials);
      } else {
        return await this.authenticateUserWithLocalStorage(credentials);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Fallback to localStorage
      return await this.authenticateUserWithLocalStorage(credentials);
    }
  }

  private async authenticateUserWithSupabase(credentials: LoginCredentials): Promise<AuthResult | null> {
    let query = supabase
      .from('user_accounts')
      .select('*')
      .eq('account_type', credentials.accountType)
      .eq('status', 'approved');

    // Add username condition based on account type
    if (credentials.accountType === 'police') {
      query = query.eq('badge_number', credentials.username);
    } else if (credentials.accountType === 'dvla') {
      query = query.eq('id_number', credentials.username);
    } else {
      // For admin/supervisor, use email as username
      query = query.eq('email', credentials.username);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return null;
    }

    // Verify password
    const passwordValid = await this.verifyPassword(credentials.password, data.password_hash);

    if (!passwordValid) {
      return null;
    }

    // Update last login
    await supabase
      .from('user_accounts')
      .update({
        last_login: new Date().toISOString(),
        login_attempts: 0
      })
      .eq('id', data.id);

    return {
      user: data as UserAccount,
      success: true,
      message: 'Login successful'
    };
  }

  private async authenticateUserWithLocalStorage(credentials: LoginCredentials): Promise<AuthResult | null> {
    console.log('Using localStorage fallback for authentication');

    const user = authenticateUserFromStorage(credentials);

    if (!user) {
      return null;
    }

    // Convert localStorage user to UserAccount format
    const userAccount: UserAccount = {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      telephone: user.telephone,
      account_type: user.accountType as any,
      status: user.status as any,
      badge_number: user.badgeNumber,
      rank: user.rank,
      station: user.station,
      id_number: user.idNumber,
      position: user.position,
      created_at: user.createdAt,
      approved_at: user.approvedAt
    };

    return {
      user: userAccount,
      success: true,
      message: 'Login successful (localStorage)'
    };
  }

  // Get all pending user accounts for admin approval
  async getPendingUsers(): Promise<UserAccount[]> {
    try {
      const supabaseAvailable = await this.isSupabaseAvailable();

      if (supabaseAvailable) {
        const { data, error } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        return data as UserAccount[];
      } else {
        // Use localStorage fallback
        const users = getPendingUsersFromStorage();
        return users.map(user => this.convertToUserAccount(user));
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      // Fallback to localStorage
      const users = getPendingUsersFromStorage();
      return users.map(user => this.convertToUserAccount(user));
    }
  }

  // Helper method to convert localStorage user to UserAccount format
  private convertToUserAccount(user: any): UserAccount {
    return {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      telephone: user.telephone,
      account_type: user.accountType,
      status: user.status,
      badge_number: user.badgeNumber,
      rank: user.rank,
      station: user.station,
      id_number: user.idNumber,
      position: user.position,
      created_at: user.createdAt,
      approved_at: user.approvedAt,
      rejected_at: user.rejectedAt,
      rejection_reason: user.rejectionReason
    };
  }

  // Approve a user account
  async approveUser(userId: string, approvedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', userId);

      if (error) {
        console.error('User approval error:', error);
        return {
          success: false,
          message: 'Failed to approve user account'
        };
      }

      return {
        success: true,
        message: 'User account approved successfully'
      };
    } catch (error) {
      console.error('User approval error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred'
      };
    }
  }

  // Reject a user account
  async rejectUser(userId: string, reason: string, rejectedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
          approved_by: rejectedBy // Using approved_by field to track who made the decision
        })
        .eq('id', userId);

      if (error) {
        console.error('User rejection error:', error);
        return {
          success: false,
          message: 'Failed to reject user account'
        };
      }

      return {
        success: true,
        message: 'User account rejected'
      };
    } catch (error) {
      console.error('User rejection error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred'
      };
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<UserAccount | null> {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data as UserAccount;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // Get all approved users
  async getApprovedUsers(): Promise<UserAccount[]> {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved users:', error);
        return [];
      }

      return data as UserAccount[];
    } catch (error) {
      console.error('Error fetching approved users:', error);
      return [];
    }
  }

  // Check if user has admin privileges
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('account_type, status')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.account_type === 'admin' && data.status === 'approved';
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }

  // Initialize demo data if no users exist
  async initializeDemoData(): Promise<void> {
    try {
      // Check if any users exist
      const { data: existingUsers, error } = await supabase
        .from('user_accounts')
        .select('id')
        .limit(1);

      if (error || (existingUsers && existingUsers.length === 0)) {
        // Insert demo users if none exist
        const demoUsers = [
          {
            first_name: 'System',
            last_name: 'Administrator',
            email: 'admin@platerecognition.gov.gh',
            telephone: '+233200000000',
            account_type: 'admin',
            status: 'approved',
            password_hash: await this.hashPassword('Wattaddo020'),
            approved_at: new Date().toISOString()
          },
          {
            first_name: 'John',
            last_name: 'Supervisor',
            email: 'supervisor@platerecognition.gov.gh',
            telephone: '+233200000001',
            account_type: 'supervisor',
            status: 'approved',
            password_hash: await this.hashPassword('Killerman020'),
            approved_at: new Date().toISOString()
          }
        ];

        await supabase
          .from('user_accounts')
          .insert(demoUsers);

        console.log('Demo users initialized');
      }
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  }
}

export const userAccountService = new UserAccountService();
