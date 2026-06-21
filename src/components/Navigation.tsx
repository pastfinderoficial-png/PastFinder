import { NavLink, useLocation } from 'react-router-dom';
import { Home, Mic, User, Compass, LogOut, Shield } from 'lucide-react';
import { cn } from '../utils';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { PastFinderLogo } from './PastFinderLogo';
import { useEffect, useState } from 'react';
import { modals } from '@mantine/modals';

export function Navigation() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const handleLogout = () => {
    modals.openConfirmModal({
      title: 'Cerrar sesión',
      centered: true,
      children: '¿Estás seguro que deseas salir de Historias Doradas?',
      labels: { confirm: 'Sí, salir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await supabase.auth.signOut();
        navigate('/');
      },
    });
  };

  useEffect(() => {
    async function checkAdmin() {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        if (userData.user.email === 'pastfinder.oficial@gmail.com') {
          setIsAdmin(true);
          return;
        }
        const { data } = await supabase.from('users').select('is_admin').eq('id', userData.user.id).single();
        if (data?.is_admin) setIsAdmin(true);
      }
    }
    void checkAdmin();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream/80 backdrop-blur-md border-t border-heritage-gold/20 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 md:top-0 md:bottom-auto md:bg-cream md:border-b md:border-t-0 md:h-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-6">
        {/* Brand Desktop */}
        <div className="hidden md:flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/feed')}>
          <PastFinderLogo />
        </div>

        <div className="flex justify-around items-center w-full md:w-auto md:gap-10">
          <NavLink 
            to="/feed" 
            aria-label="Ir a Inicio"
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 transition-all",
              isActive ? "text-deep-navy font-bold scale-110" : "text-deep-navy/40 hover:text-deep-navy/80"
            )}
          >
            <Home size={24} aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Inicio</span>
          </NavLink>

          <NavLink 
            to="/discover" 
            aria-label="Ir a Filtros"
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 transition-all",
              isActive ? "text-deep-navy font-bold scale-110" : "text-deep-navy/40 hover:text-deep-navy/80"
            )}
          >
            <Compass size={24} aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Filtros</span>
          </NavLink>
          
          <NavLink 
            to="/studio" 
            aria-label="Crear publicación"
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 group"
          >
            <div className={cn(
              "p-3 rounded-2xl -mt-8 shadow-md transition-all group-hover:scale-110",
              path === '/studio' ? "bg-heritage-gold text-deep-navy" : "bg-deep-navy text-cream"
            )}>
              <Mic size={28} aria-hidden="true" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold mt-1">Crear</span>
          </NavLink>

          <NavLink 
            to="/profile" 
            aria-label="Ir a Perfil"
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 transition-all",
              isActive ? "text-deep-navy font-bold scale-110" : "text-deep-navy/40 hover:text-deep-navy/80"
            )}
          >
            <User size={24} aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Perfil</span>
          </NavLink>

          {isAdmin && (
            <NavLink 
              to="/admin" 
              aria-label="Panel de Administración"
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 transition-all",
                isActive ? "text-deep-navy font-bold scale-110" : "text-deep-navy/40 hover:text-deep-navy/80"
              )}
            >
              <Shield size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Admin</span>
            </NavLink>
          )}

          <button 
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="hidden md:flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 text-deep-navy/40 hover:text-red-600 transition-all"
          >
            <LogOut size={24} aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
