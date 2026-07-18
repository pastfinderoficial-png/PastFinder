import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, HeartHandshake, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabase';
import { formatCLP } from '../utils/currency';

type CreatorPlan = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  monthly_price: number | string | null;
};

export function Planes() {
  const [creators, setCreators] = useState<CreatorPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('creators')
        .select('user_id, display_name, bio, profile_image_url, monthly_price')
        .order('monthly_price', { ascending: true });

      setCreators((data || []) as CreatorPlan[]);
      setLoading(false);
    }

    void load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 rounded-2xl bg-deep-navy p-6 text-cream shadow-sm md:p-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-heritage-gold">
          <Crown size={14} />
          Como funciona el apoyo en PastFinder
        </p>
        <h1 className="mb-3 text-4xl font-bold md:text-5xl">No hay un plan unico: apoyas directamente a cada narrador.</h1>
        <p className="max-w-3xl text-lg leading-7 text-cream/70">
          En PastFinder no pagas una suscripcion general a la plataforma. Cada narrador define su
          propio precio mensual, y al suscribirte a el o ella desbloqueas su contenido premium y le
          apoyas directamente.
        </p>
      </section>

      <div className="mb-10 grid gap-5 md:grid-cols-3">
        <InfoCard
          icon={Sparkles}
          title="1. Explora gratis"
          text="Navega historias, categorias y perfiles de narradores sin costo ni registro."
        />
        <InfoCard
          icon={HeartHandshake}
          title="2. Elige a quien apoyar"
          text="Cada narrador tiene su propio precio mensual, visible en su perfil."
        />
        <InfoCard
          icon={Crown}
          title="3. Desbloquea su contenido"
          text="Al suscribirte a un narrador, accedes a todo su contenido premium mientras tu suscripcion este activa."
        />
      </div>

      <h2 className="mb-4 text-2xl font-bold text-deep-navy">Narradores y sus precios</h2>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-surface-elevated" />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <p className="text-deep-navy/60">Pronto veras aqui a los narradores de la comunidad.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <Link
              key={creator.user_id}
              to={`/autor/${creator.user_id}`}
              className="flex items-center gap-4 rounded-2xl bg-surface-elevated p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <img
                src={
                  creator.profile_image_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name || 'Narrador')}&background=0F172A&color=D4AF37`
                }
                alt={creator.display_name || 'Narrador'}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-deep-navy">{creator.display_name || 'Narrador PastFinder'}</h3>
                <p className="truncate text-sm text-deep-navy/60">{creator.bio || 'Comparte relatos en PastFinder'}</p>
                <p className="mt-1 text-sm font-bold text-heritage-gold">
                  {Number(creator.monthly_price) > 0 ? `${formatCLP(creator.monthly_price)}/mes` : 'Suscripcion gratis'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-surface-elevated p-8 text-center shadow-sm sm:flex-row">
        <p className="text-deep-navy/70">Puedes explorar gratis, y registrarte cuando quieras seguir, comentar o suscribirte.</p>
        <Link to="/registro" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-deep-navy px-6 font-bold text-cream">
          Registrarme gratis
        </Link>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Crown; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-surface-elevated p-6 shadow-sm">
      <Icon className="mb-3 text-heritage-gold" size={28} />
      <h3 className="mb-2 text-lg font-bold text-deep-navy">{title}</h3>
      <p className="text-sm text-deep-navy/60">{text}</p>
    </div>
  );
}
