import { useState } from 'react';
import { supabase } from '../services/supabase';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Video,
  Apple,
  Music2,
  MessageCircle,
  BriefcaseBusiness,
  Gamepad2,
  KeyRound,
  Cloud,
  Sparkles,
  Search,
  Users,
  Code2,
  Workflow,
  Boxes,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { PastFinderLogo } from '../components/PastFinderLogo';
import { cn } from '../utils';
import { openTermsModal } from '../components/TermsModal';

type OAuthProvider = {
  provider: Provider;
  label: string;
  icon: LucideIcon;
  featured?: boolean;
};

const oauthProviders: OAuthProvider[] = [
  { provider: 'google', label: 'Google', icon: Search, featured: true },
  { provider: 'facebook', label: 'Facebook', icon: Users, featured: true },
  { provider: 'apple', label: 'Apple', icon: Apple, featured: true },
  { provider: 'github', label: 'GitHub', icon: Code2 },
  { provider: 'gitlab', label: 'GitLab', icon: BriefcaseBusiness },
  { provider: 'discord', label: 'Discord', icon: Gamepad2 },
  { provider: 'azure', label: 'Microsoft', icon: Cloud },
  { provider: 'linkedin_oidc', label: 'LinkedIn', icon: BriefcaseBusiness },
  { provider: 'slack_oidc', label: 'Slack', icon: Workflow },
  { provider: 'twitch', label: 'Twitch', icon: Video },
  { provider: 'spotify', label: 'Spotify', icon: Music2 },
  { provider: 'notion', label: 'Notion', icon: Sparkles },
  { provider: 'figma', label: 'Figma', icon: Boxes },
  { provider: 'bitbucket', label: 'Bitbucket', icon: BriefcaseBusiness },
  { provider: 'kakao', label: 'Kakao', icon: MessageCircle },
  { provider: 'keycloak', label: 'Keycloak', icon: KeyRound },
];

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<Provider | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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
          await supabase.from('users').upsert({ id: data.user.id, email, role: 'creator' });
          await supabase.from('creators').upsert({
            user_id: data.user.id,
            bio: 'Creador de PastFinder 60+',
            monthly_price: 0,
            kyc_status: 'pending',
          });
          await supabase.from('fans').upsert({
            user_id: data.user.id,
            display_name: email.split('@')[0],
          });
        }
      }
      navigate('/feed');
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

  const handleOAuth = async (provider: Provider) => {
    setOauthLoading(provider);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/feed`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setOauthLoading(null);
      notifications.show({
        title: 'Error de proveedor',
        message: `No se pudo iniciar con ${provider}. Activa este proveedor en Supabase Dashboard > Authentication > Providers y revisa la Redirect URL.`,
        color: 'red',
        autoClose: false
      });
      return;
    }

    if (data.url) {
      window.location.assign(data.url);
      return;
    }

    setOauthLoading(null);
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


          <button
            onClick={() => setIsLogin((value) => !value)}
            className="mt-6 w-full text-center font-semibold text-deep-navy/60 transition-colors hover:text-deep-navy"
          >
            {isLogin ? 'No tienes cuenta? Registrate aqui' : 'Ya tienes cuenta? Inicia sesion'}
          </button>
        </div>
      </section>
    </div>
  );
}

function OAuthButton({
  provider,
  loading,
  disabled,
  compact = false,
  onClick,
}: {
  provider: OAuthProvider;
  loading: boolean;
  disabled: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  const Icon = provider.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl bg-surface-subtle font-bold text-deep-navy transition-all hover:bg-surface-elevated hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50',
        compact ? 'min-h-11 px-3 text-sm' : 'min-h-12 px-4',
      )}
    >
      <Icon size={compact ? 17 : 20} />
      {loading ? 'Conectando...' : provider.label}
    </button>
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
