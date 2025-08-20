import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { api, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Get user profile from officers table
        supabase
          .from('officers')
          .select('*')
          .eq('email', session.user.email)
          .single()
          .then(({ data: officer }) => {
            if (officer) {
              const userData: User = {
                id: officer.id,
                email: officer.email,
                full_name: officer.full_name,
                badge_number: officer.badge_number,
                rank: officer.rank,
                department: officer.department,
                role: 'police',
                created_at: officer.created_at,
                updated_at: officer.updated_at,
              };
              setUser(userData);
            }
          });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get user profile from officers table
          const { data: officer } = await supabase
            .from('officers')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (officer) {
            const userData: User = {
              id: officer.id,
              email: officer.email,
              full_name: officer.full_name,
              badge_number: officer.badge_number,
              rank: officer.rank,
              department: officer.department,
              role: 'police',
              created_at: officer.created_at,
              updated_at: officer.updated_at,
            };
            setUser(userData);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await api.signIn(email, password);
      if (result && result.data) {
        setUser(result.data.user);
      }
      return result;
    } catch (error) {
      console.error('Auth context signIn error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const result = await api.signUp(email, password, metadata);
      return result;
    } catch (error) {
      console.error('Auth context signUp error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const signOut = async () => {
    const result = await api.signOut();
    setUser(null);
    return result;
  };

  const isAuthenticated = !!user;

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
