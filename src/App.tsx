import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FullScreenSpinner } from './components/FullScreenSpinner';
import { Navigation } from './components/Navigation';

import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Explorar } from './pages/Explorar';
import { Categorias } from './pages/Categorias';
import { Historias } from './pages/Historias';
import { HistoriaDetail } from './pages/HistoriaDetail';
import { AutorPublico } from './pages/AutorPublico';
import { Planes } from './pages/Planes';
import { About } from './pages/About';
import { Contacto } from './pages/Contacto';
import { Profile } from './pages/Profile';
import { ProfileSettings } from './pages/ProfileSettings';
import { MisHistorias } from './pages/MisHistorias';
import { Favoritos } from './pages/Favoritos';
import { Dashboard } from './pages/Dashboard';
import { Subscripcion } from './pages/Subscripcion';
import { Checkout } from './pages/Checkout';
import { Studio } from './pages/Studio';
import { Admin } from './pages/Admin';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function AppShell() {
  const { loading } = useAuth();

  if (loading) return <FullScreenSpinner />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-base text-deep-navy pb-20 md:pb-0 font-inter transition-colors duration-300">
        <Navigation />

        <main className="md:mt-20 min-h-screen transition-all duration-300">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/registro" element={<Auth mode="register" />} />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/historias" element={<Historias />} />
            <Route path="/historia/:id" element={<HistoriaDetail />} />
            <Route path="/autor/:id" element={<AutorPublico />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacto" element={<Contacto />} />

            {/* Protected routes */}
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/configuracion" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/mis-historias" element={<ProtectedRoute><MisHistorias /></ProtectedRoute>} />
            <Route path="/favoritos" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/subscripcion" element={<ProtectedRoute><Subscripcion /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <Notifications position="top-right" zIndex={1000} />
      <AuthProvider>
        <ModalsProvider>
          <AppShell />
        </ModalsProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
