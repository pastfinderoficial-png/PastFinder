import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Mic, User, Compass, LogOut, Shield, Grid, Heart, LogIn, UserPlus, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils';
import { PastFinderLogo } from './PastFinderLogo';
import { modals } from '@mantine/modals';
import { useAuth } from '../context/AuthContext';

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

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

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] gap-1 p-2 transition-all duration-200 active:scale-95',
      isActive ? 'text-heritage-gold font-bold -translate-y-0.5' : 'text-deep-navy/45 hover:text-deep-navy/80',
    );

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-200 active:scale-95',
      isActive ? 'bg-deep-navy text-cream' : 'text-deep-navy/60 hover:bg-surface-subtle hover:text-deep-navy',
    );

  const authedItems: NavItem[] = [
    { to: '/explorar', label: 'Inicio', icon: Home },
    { to: '/historias', label: 'Explorar', icon: Compass },
    { to: '/mis-historias', label: 'Mis historias', icon: FileText },
    { to: '/favoritos', label: 'Favoritos', icon: Heart },
    { to: '/perfil', label: 'Perfil', icon: User },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  const guestItems: NavItem[] = [
    { to: '/', label: 'Inicio', icon: Home, end: true },
    { to: '/explorar', label: 'Explorar', icon: Compass },
    { to: '/categorias', label: 'Categorías', icon: Grid },
    { to: '/planes', label: 'Planes', icon: Shield },
    { to: '/login', label: 'Entrar', icon: LogIn },
  ];

  const items = user ? authedItems : guestItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-heritage-gold/15 bg-cream/85 pb-4 shadow-[0_-8px_24px_-12px_rgba(55,66,74,0.15)] backdrop-blur-md md:bottom-auto md:top-0 md:border-b md:border-t-0 md:bg-cream/95 md:pb-0">
      {/* Mobile bottom bar */}
      <div className="flex h-full items-center justify-around px-2 md:hidden">
        {user ? (
          <>
            <NavLink to="/explorar" aria-label="Ir a Inicio" className={mobileLinkClass}>
              <Home size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Inicio</span>
            </NavLink>
            <NavLink to="/historias" aria-label="Explorar historias" className={mobileLinkClass}>
              <Compass size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Explorar</span>
            </NavLink>
            <NavLink to="/studio" aria-label="Crear publicación" className="group flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 p-2">
              <div
                className={cn(
                  'rounded-2xl p-3 shadow-[0_12px_24px_-10px_rgba(55,66,74,0.4)] transition-all duration-200 -mt-8 group-active:scale-95',
                  path === '/studio' ? 'bg-heritage-gold text-cream' : 'bg-deep-navy text-cream',
                )}
              >
                <Mic size={28} aria-hidden="true" />
              </div>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest">Crear</span>
            </NavLink>
            <NavLink to="/favoritos" aria-label="Favoritos" className={mobileLinkClass}>
              <Heart size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Favoritos</span>
            </NavLink>
            <NavLink to="/perfil" aria-label="Ir a Perfil" className={mobileLinkClass}>
              <User size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Perfil</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" end aria-label="Ir a Inicio" className={mobileLinkClass}>
              <Home size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Inicio</span>
            </NavLink>
            <NavLink to="/explorar" aria-label="Explorar" className={mobileLinkClass}>
              <Compass size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Explorar</span>
            </NavLink>
            <NavLink to="/planes" aria-label="Planes" className={mobileLinkClass}>
              <Shield size={24} aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Planes</span>
            </NavLink>
            <NavLink to="/registro" aria-label="Registrarse" className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 p-2">
              <div className="-mt-8 rounded-2xl bg-heritage-gold p-3 text-cream shadow-[0_12px_24px_-10px_rgba(55,66,74,0.4)] transition-all duration-200 active:scale-95">
                <UserPlus size={22} aria-hidden="true" />
              </div>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest">Registrarse</span>
            </NavLink>
          </>
        )}
      </div>

      {/* Desktop top bar */}
      <div className="mx-auto hidden h-20 max-w-7xl items-center justify-between gap-6 px-6 md:flex">
        <div className="flex shrink-0 cursor-pointer items-center gap-2" onClick={() => navigate(user ? '/explorar' : '/')}>
          <PastFinderLogo compact />
        </div>

        <div className="flex flex-1 items-center justify-center gap-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={desktopLinkClass}>
              <item.icon size={17} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <NavLink
                to="/studio"
                className="inline-flex items-center gap-2 rounded-full bg-heritage-gold px-5 py-2.5 text-sm font-bold text-cream shadow-[0_8px_20px_-8px_rgba(139,117,86,0.6)] transition-all duration-200 hover:bg-heritage-gold-dark hover:-translate-y-0.5 active:scale-95"
              >
                <Mic size={16} />
                Crear
              </NavLink>
              <button
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-deep-navy/40 transition-all duration-200 hover:bg-surface-subtle hover:text-red-600 active:scale-95"
              >
                <LogOut size={20} aria-hidden="true" />
              </button>
            </>
          ) : (
            <NavLink
              to="/registro"
              className="inline-flex items-center gap-2 rounded-full bg-heritage-gold px-5 py-2.5 text-sm font-bold text-cream shadow-[0_8px_20px_-8px_rgba(139,117,86,0.6)] transition-all duration-200 hover:bg-heritage-gold-dark hover:-translate-y-0.5 active:scale-95"
            >
              <UserPlus size={16} />
              Registrarme
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
