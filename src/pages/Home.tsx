import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Video, Crown } from 'lucide-react';
import { supabase } from '../services/supabase';
import { StoryCard } from '../components/StoryCard';
import type { StoryCardPost } from '../components/StoryCard';
import { PastFinderLogo } from '../components/PastFinderLogo';
import { formatCLP } from '../utils/currency';

type FeaturedCreator = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  monthly_price: number | string | null;
};

export function Home() {
  const [posts, setPosts] = useState<StoryCardPost[]>([]);
  const [creators, setCreators] = useState<FeaturedCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: postData }, { data: creatorData }] = await Promise.all([
        supabase
          .from('posts')
          .select('id, title, description, media_type, category, is_ppv, is_sub_only, created_at, creators ( user_id, display_name, profile_image_url )')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('creators')
          .select('user_id, display_name, bio, profile_image_url, monthly_price')
          .limit(6),
      ]);

      setPosts((postData || []) as unknown as StoryCardPost[]);
      setCreators((creatorData || []) as FeaturedCreator[]);
      setLoading(false);
    }

    void load();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-deep-navy px-4 py-16 text-cream md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-24 h-40 w-40 rounded-full border border-heritage-gold" />
          <div className="absolute bottom-20 right-12 h-72 w-72 rounded-full border-2 border-heritage-gold" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <PastFinderLogo inverse />
          </div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-heritage-gold">
            <Sparkles size={14} />
            Comunidad premium 60+
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Tu vida tambien merece audiencia.
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-cream/70 md:text-xl">
            Descubre relatos, memorias y videos cortos de personas con historia. Explora libremente
            y apoya a los narradores que quieras seguir de cerca.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/historias"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-8 text-lg font-bold text-deep-navy transition-all hover:bg-heritage-gold-dark"
            >
              Explorar historias
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/registro"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-cream/10 px-8 text-lg font-bold text-cream transition-all hover:bg-cream/20"
            >
              Registrarme gratis
            </Link>
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl gap-3 text-sm text-cream/70 sm:grid-cols-3">
            <Feature icon={ShieldCheck} label="Perfiles 60+" />
            <Feature icon={Video} label="Videos cortos" />
            <Feature icon={HeartHandshake} label="Apoyo premium" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-deep-navy">Ultimas historias</h2>
          <Link to="/historias" className="text-sm font-bold text-heritage-gold hover:underline">
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-2xl bg-surface-elevated" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-deep-navy/60">Aun no hay historias publicadas. Se el primero en compartir la tuya.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <StoryCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-deep-navy">Narradores destacados</h2>
          <Link to="/planes" className="text-sm font-bold text-heritage-gold hover:underline">
            Ver planes
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-2xl bg-surface-elevated" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <p className="text-deep-navy/60">Pronto veras aqui a los narradores de la comunidad.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  {Number(creator.monthly_price) > 0 && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-heritage-gold">
                      <Crown size={12} />
                      {formatCLP(creator.monthly_price)}/mes
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl bg-surface-elevated p-8 text-center shadow-sm md:p-12">
          <h2 className="mb-3 text-3xl font-bold text-deep-navy">Como funciona</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <HowItWorksStep n={1} title="Explora libremente" text="Navega historias, categorias y perfiles sin necesidad de registrarte." />
            <HowItWorksStep n={2} title="Sigue y guarda" text="Registrate gratis para dar me gusta, comentar, seguir narradores y guardar favoritos." />
            <HowItWorksStep n={3} title="Suscribete" text="Apoya directamente al narrador que quieras y desbloquea su contenido premium." />
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/registro" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-deep-navy px-6 font-bold text-cream">
              Registrarme
            </Link>
            <Link to="/planes" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-surface-subtle px-6 font-bold text-deep-navy">
              Conocer planes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function HowItWorksStep({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div>
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-heritage-gold font-bold text-deep-navy">
        {n}
      </div>
      <h3 className="mb-2 text-lg font-bold text-deep-navy">{title}</h3>
      <p className="text-sm text-deep-navy/60">{text}</p>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl bg-cream/10 px-3 py-2">
      <Icon className="text-heritage-gold" size={18} />
      <span className="font-bold">{label}</span>
    </div>
  );
}
