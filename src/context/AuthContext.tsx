import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

const ADMIN_EMAIL = 'pastfinder.oficial@gmail.com';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmedAdminUserId, setConfirmedAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const adminEmailMatch = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const user = session?.user;
    if (!user || user.email === ADMIN_EMAIL) return;

    let cancelled = false;
    supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data?.is_admin) setConfirmedAdminUserId(user.id);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, session?.user?.email]);

  const isAdmin = Boolean(session?.user) && (adminEmailMatch || confirmedAdminUserId === session?.user?.id);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, isAdmin, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook is intentionally colocated with its provider
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
