import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
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
              const userData = {
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
            const userData = {
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
    const result = await api.signIn(email, password);
    if (result.data) {
      setUser(result.data.user);
    }
    return result;
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const result = await api.signUp(email, password, metadata);
    return result;
  };

  const signOut = async () => {
    const result = await api.signOut();
    setUser(null);
    return result;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}