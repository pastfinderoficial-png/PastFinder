import { useState } from 'react';
import { supabase } from '../services/supabase';
import { ensureCreatorProfile } from '../services/profile';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PastFinderLogo } from '../components/PastFinderLogo';
import { openTermsModal } from '../components/TermsModal';

type AuthProps = {
  mode?: 'login' | 'register';
};

export function Auth({ mode = 'login' }: AuthProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    if (!isLogin && !acceptedTerms) {
      notifications.show({
        title: 'Error',
        message: 'Debes aceptar los Términos y Condiciones para registrarte.',
        color: 'red',
      });
      return;
    }

    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'No se pudo iniciar sesion con Google.',
        color: 'red',
      });
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/explorar');
      } else {
        if (!acceptedTerms) {
          throw new Error('Debes aceptar los Términos y Condiciones para registrarte.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: email.split('@')[0],
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          await ensureCreatorProfile(data.user.id, email);

          notifications.show({
            title: 'Registro exitoso',
            message: 'Por favor, revisa tu bandeja de entrada y verifica tu correo para poder entrar.',
            color: 'teal'
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'No se pudo completar el acceso.',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-cream md:grid md:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-[48vh] flex-col justify-between overflow-hidden bg-deep-navy p-8 text-cream md:min-h-screen md:p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-24 h-40 w-40 rounded-full border border-heritage-gold" />
          <div className="absolute bottom-20 right-12 h-72 w-72 rounded-full border-2 border-heritage-gold" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <PastFinderLogo inverse />
        </div>

        <div className="relative z-10 max-w-xl py-12">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-heritage-gold">Comunidad premium 60+</p>
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Tu vida tambien merece audiencia.
          </h1>
          <p className="text-xl leading-8 text-cream/70">
            Un espacio para adultos mayores que quieren compartir relatos, textos y videos cortos,
            construir comunidad y recibir apoyo de sus seguidores.
          </p>
        </div>

        <div className="relative z-10 grid gap-3 text-sm text-cream/70 md:grid-cols-3">
          <Feature icon={ShieldCheck} label="Perfiles 60+" />
          <Feature icon={Video} label="Videos cortos" />
          <Feature icon={HeartHandshake} label="Apoyo premium" />
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="mb-2 text-4xl font-bold text-deep-navy">{isLogin ? 'Bienvenido' : 'Crea tu cuenta'}</h2>
            <p className="text-deep-navy/60">
              {isLogin ? 'Entra a tu comunidad de relatos.' : 'Empieza como creador y miembro de la comunidad.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-navy/35" size={20} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Correo electronico"
                className="min-h-14 w-full rounded-xl bg-surface-subtle py-4 pl-12 pr-4 text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-navy/35" size={20} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Contrasena"
                className="min-h-14 w-full rounded-xl bg-surface-subtle py-4 pl-12 pr-4 text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
                required
              />
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3 px-1 py-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-deep-navy/20 text-heritage-gold focus:ring-heritage-gold accent-heritage-gold"
                />
                <label htmlFor="terms" className="text-sm text-deep-navy/80 leading-relaxed">
                  He leído y acepto los{' '}
                  <button
                    type="button"
                    onClick={openTermsModal}
                    className="font-bold text-heritage-gold hover:underline"
                  >
                    Términos, Condiciones y Política de Privacidad
                  </button>{' '}
                  de Past Finder.
                </label>
              </div>
            )}

            <button
              disabled={loading}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-deep-navy px-6 text-lg font-bold text-cream transition-all hover:bg-deep-navy/90 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Registrarme'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-deep-navy/40">
            <span className="h-px flex-1 bg-deep-navy/10" />
            o
            <span className="h-px flex-1 bg-deep-navy/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border border-deep-navy/15 bg-white px-6 text-lg font-bold text-deep-navy transition-all hover:bg-surface-subtle disabled:opacity-50"
          >
            <GoogleIcon size={20} />
            {googleLoading ? 'Conectando...' : isLogin ? 'Entrar con Google' : 'Registrarme con Google'}
          </button>

          <button
            onClick={() => setIsLogin((value) => !value)}
            className="mt-4 w-full text-center font-semibold text-deep-navy/60 transition-colors hover:text-deep-navy"
          >
            {isLogin ? 'No tienes cuenta? Registrate aqui' : 'Ya tienes cuenta? Inicia sesion'}
          </button>
        </div>
      </section>
    </div>
  );
}


function Feature({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-cream/10 px-3 py-2">
      <Icon className="text-heritage-gold" size={18} />
      <span className="font-bold">{label}</span>
    </div>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.89c2.28-2.1 3.53-5.15 3.53-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.89-2.98c-1.08.72-2.46 1.15-4.04 1.15-3.11 0-5.74-2.1-6.68-4.92H1.3v3.07C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.32 14.35A7.2 7.2 0 0 1 4.94 12c0-.82.14-1.61.38-2.35V6.58H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.42l4.02-3.07z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.6 4.59 1.79l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.58l4.02 3.07C6.26 6.85 8.89 4.75 12 4.75z"
      />
    </svg>
  );
}
