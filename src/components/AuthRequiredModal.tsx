import { modals } from '@mantine/modals';
import type { NavigateFunction } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const DEFAULT_COPY = 'Crea una cuenta gratis para continuar.';

export function openAuthRequiredModal(navigate: NavigateFunction, intent?: string) {
  modals.open({
    title: 'Únete para continuar',
    centered: true,
    children: (
      <div className="space-y-5">
        <p className="text-deep-navy/70">{intent || DEFAULT_COPY}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              modals.closeAll();
              navigate('/registro');
            }}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-4 font-bold text-deep-navy transition-all hover:bg-heritage-gold-dark"
          >
            <UserPlus size={18} />
            Registrarme
          </button>
          <button
            onClick={() => {
              modals.closeAll();
              navigate('/login');
            }}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-deep-navy px-4 font-bold text-cream transition-all hover:bg-deep-navy/90"
          >
            <LogIn size={18} />
            Iniciar sesión
          </button>
        </div>
      </div>
    ),
  });
}
