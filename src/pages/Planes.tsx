import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, HeartHandshake, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabase';
import { formatCLP } from '../utils/currency';
import { PhotoBanner } from '../components/PhotoBanner';
import bannerPhoto from '../assets/carousel/senior-5.jpg';

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
      <PhotoBanner image={bannerPhoto} className="mb-8" contentClassName="p-6 md:p-8">
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
      </PhotoBanner>

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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-72 animate-pulse rounded-[1.75rem] bg-surface-elevated" />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <p className="text-deep-navy/60">Pronto veras aqui a los narradores de la comunidad.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator, index) => (
            <TierCard key={creator.user_id} creator={creator} index={index} />
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

function TierCard({ creator, index }: { creator: CreatorPlan; index: number }) {
  const hasPrice = Number(creator.monthly_price) > 0;
  const avatar =
    creator.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name || 'Narrador')}&background=37424A&color=F5F4EE`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: Math.min(index, 4) * 0.05 }}
      whileHover={{ y: -4 }}
      className="flex flex-col overflow-hidden rounded-[1.75rem] bg-surface-elevated shadow-[0_20px_40px_-24px_rgba(55,66,74,0.25)]"
    >
      <div className="flex flex-col items-center gap-3 border-b border-surface-subtle p-6 text-center">
        <img src={avatar} alt={creator.display_name || 'Narrador'} className="h-20 w-20 rounded-full object-cover shadow-sm" />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-deep-navy">{creator.display_name || 'Narrador PastFinder'}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-deep-navy/55">{creator.bio || 'Comparte relatos en PastFinder'}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-5 flex items-baseline justify-center gap-1">
          {hasPrice ? (
            <>
              <span className="text-3xl font-bold tracking-tight text-deep-navy">{formatCLP(creator.monthly_price)}</span>
              <span className="text-sm font-semibold text-deep-navy/50">/mes</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-deep-navy">Gratis</span>
          )}
        </div>

        <Link
          to={`/autor/${creator.user_id}`}
          className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-6 font-bold text-cream transition-all duration-200 hover:bg-heritage-gold-dark active:scale-[0.98]"
        >
          <Crown size={18} />
          Ver perfil
        </Link>
      </div>
    </motion.div>
  );
}
