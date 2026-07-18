import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Mic, User, Compass, LogOut, Shield, Grid, Heart, LogIn, UserPlus } from 'lucide-react';
import { cn } from '../utils';
import { PastFinderLogo } from './PastFinderLogo';
import { modals } from '@mantine/modals';
import { useAuth } from '../context/AuthContext';

export function Navigation() {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const handleLogout = () => {
    modals.openConfirmModal({
      title: 'Cerrar sesión',
      centered: true,
      children: '¿Estás seguro que deseas salir de PastFinder?',
      labels: { confirm: 'Sí, salir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await signOut();
        navigate('/');
      },
    });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 transition-all',
      isActive ? 'text-deep-navy font-bold scale-110' : 'text-deep-navy/40 hover:text-deep-navy/80',
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream/80 backdrop-blur-md border-t border-heritage-gold/20 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 md:top-0 md:bottom-auto md:bg-cream md:border-b md:border-t-0 md:h-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-6">
        <div
          className="hidden md:flex items-center gap-2 group cursor-pointer"
          onClick={() => navigate(user ? '/explorar' : '/')}
        >
          <PastFinderLogo />
        </div>

        {user ? (
          <div className="flex justify-around items-center w-full md:w-auto md:gap-8">
            <NavLink to="/explorar" aria-label="Ir a Inicio" className={linkClass}>
              <Home size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Inicio</span>
            </NavLink>

            <NavLink to="/historias" aria-label="Explorar historias" className={linkClass}>
              <Compass size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Explorar</span>
            </NavLink>

            <NavLink to="/studio" aria-label="Crear publicación" className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 group">
              <div
                className={cn(
                  'p-3 rounded-2xl -mt-8 md:mt-0 shadow-md transition-all group-hover:scale-110',
                  path === '/studio' ? 'bg-heritage-gold text-deep-navy' : 'bg-deep-navy text-cream',
                )}
              >
                <Mic size={28} aria-hidden="true" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold mt-1 md:mt-2">Crear</span>
            </NavLink>

            <NavLink to="/mis-historias" aria-label="Mis historias" className={cn(linkClass({ isActive: path === '/mis-historias' }), 'hidden sm:flex')}>
              <FileTextIcon />
              <span className="text-[10px] uppercase tracking-widest font-bold">Mis historias</span>
            </NavLink>

            <NavLink to="/favoritos" aria-label="Favoritos" className={linkClass}>
              <Heart size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Favoritos</span>
            </NavLink>

            <NavLink to="/perfil" aria-label="Ir a Perfil" className={linkClass}>
              <User size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Perfil</span>
            </NavLink>

            {isAdmin && (
              <NavLink to="/admin" aria-label="Panel de Administración" className={cn(linkClass({ isActive: path === '/admin' }), 'hidden sm:flex')}>
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
        ) : (
          <div className="flex justify-around items-center w-full md:w-auto md:gap-8">
            <NavLink to="/" end aria-label="Ir a Inicio" className={linkClass}>
              <Home size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Inicio</span>
            </NavLink>

            <NavLink to="/explorar" aria-label="Explorar" className={linkClass}>
              <Compass size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Explorar</span>
            </NavLink>

            <NavLink to="/categorias" aria-label="Categorías" className={cn(linkClass({ isActive: path === '/categorias' }), 'hidden sm:flex')}>
              <Grid size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Categorías</span>
            </NavLink>

            <NavLink to="/planes" aria-label="Planes" className={linkClass}>
              <Shield size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Planes</span>
            </NavLink>

            <NavLink to="/login" aria-label="Iniciar sesión" className={cn(linkClass({ isActive: path === '/login' }), 'hidden sm:flex')}>
              <LogIn size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Entrar</span>
            </NavLink>

            <NavLink
              to="/registro"
              aria-label="Registrarse"
              className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2"
            >
              <div className="p-3 rounded-2xl -mt-8 md:mt-0 bg-heritage-gold text-deep-navy shadow-md transition-all hover:scale-110">
                <UserPlus size={22} aria-hidden="true" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold mt-1 md:mt-2">Registrarse</span>
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

function FileTextIcon() {
  return <Mic size={24} aria-hidden="true" />;
}
