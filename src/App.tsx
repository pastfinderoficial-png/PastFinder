import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';
import { Feed } from './pages/Feed';
import { Studio } from './pages/Studio';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Discover } from './pages/Discover';
import { Navigation } from './components/Navigation';

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

  if (!session) {
    return (
      <Router>
        <Auth />
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-cream pb-24 md:pb-0 md:pt-20">
        <Navigation />

        <main className="mx-auto max-w-7xl">
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
