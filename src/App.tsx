import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import { Feed } from './pages/Feed';
import { Studio } from './pages/Studio';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Discover } from './pages/Discover';
import { Admin } from './pages/Admin';
import { Navigation } from './components/Navigation';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <MantineProvider defaultColorScheme="light">
      <Notifications position="top-right" zIndex={1000} />
      <ModalsProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-surface-base text-deep-navy pb-20 md:pb-0 font-inter transition-colors duration-300">
            {session && <Navigation />}
            
            <main className="md:ml-20 min-h-screen transition-all duration-300">
              <Routes>
                <Route 
                  path="/" 
                  element={session ? <Navigate to="/feed" replace /> : <Auth />} 
                />
                <Route 
                  path="/feed" 
                  element={session ? <Feed /> : <Navigate to="/" replace />} 
                />
                <Route 
                  path="/discover" 
                  element={session ? <Discover /> : <Navigate to="/" replace />} 
                />
                <Route 
                  path="/studio" 
                  element={session ? <Studio /> : <Navigate to="/" replace />} 
                />
                <Route 
                  path="/profile" 
                  element={session ? <Profile /> : <Navigate to="/" replace />} 
                />
                <Route 
                  path="/admin" 
                  element={session ? <Admin /> : <Navigate to="/" replace />} 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
