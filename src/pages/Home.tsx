import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Video,
  Crown,
  Compass,
  UserPlus,
  Mic,
  FileText,
  Heart,
  Grid,
  Users,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../services/supabase';
import { StoryCard } from '../components/StoryCard';
import type { StoryCardPost } from '../components/StoryCard';
import { PastFinderLogo } from '../components/PastFinderLogo';
import { CommunityCarousel } from '../components/CommunityCarousel';
import { CategoryMarquee } from '../components/CategoryMarquee';
import { HeroPhotoStack } from '../components/HeroPhotoStack';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { TiltCard } from '../components/TiltCard';
import { FaqAccordion } from '../components/FaqAccordion';
import { CATEGORIES } from '../constants/categories';
import { formatCLP } from '../utils/currency';

type FeaturedCreator = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  monthly_price: number | string | null;
};

const categoryIcons: Record<string, LucideIcon> = {
  'Amor y compania': Heart,
  'Memorias de juventud': Sparkles,
  'Consejos de vida': Compass,
  Viajes: Mic,
  Familia: Users,
  'Picardia elegante': Video,
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
          .select('id, title, description, media_type, media_url, category, is_ppv, is_sub_only, created_at, creators ( user_id, display_name, profile_image_url )')
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-deep-navy px-4 py-16 text-cream md:py-24">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="text-left">
            <div className="mb-8">
              <PastFinderLogo inverse />
            </div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cream/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-heritage-gold">
              <Sparkles size={14} />
              Comunidad premium 60+
            </p>
            <h1 className="mb-6 max-w-xl text-4xl font-bold leading-[0.95] tracking-tight md:text-6xl">
              Tu vida tambien merece audiencia.
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-8 text-cream/70 md:text-xl">
              Descubre relatos, memorias y videos cortos de personas con historia. Explora libremente
              y apoya a los narradores que quieras seguir de cerca.
            </p>
            <div className="flex flex-col items-start justify-center gap-3 sm:flex-row">
              <Link
                to="/historias"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-8 text-lg font-bold text-cream transition-all duration-200 hover:bg-heritage-gold-dark active:scale-[0.98]"
              >
                Explorar historias
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/registro"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-cream/10 px-8 text-lg font-bold text-cream transition-all duration-200 hover:bg-cream/20 active:scale-[0.98]"
              >
                Registrarme gratis
              </Link>
            </div>

            <div className="mt-12 grid max-w-xl gap-3 text-sm text-cream/70 sm:grid-cols-3">
              <Feature icon={ShieldCheck} label="Perfiles 60+" />
              <Feature icon={Video} label="Videos cortos" />
              <Feature icon={HeartHandshake} label="Apoyo premium" />
            </div>
          </div>

          <div className="relative hidden items-center justify-center md:flex">
            <HeroPhotoStack />
          </div>
        </div>
      </section>

      {/* Animated stats */}
      <section className="bg-surface-base px-4 py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          <AnimatedCounter value={1280} suffix="+" label="Historias" />
          <AnimatedCounter value={340} suffix="+" label="Narradores" />
          <AnimatedCounter value={60} suffix="+" label="Edad promedio" />
          <AnimatedCounter value={98} suffix="%" label="Recomiendan" />
        </div>
      </section>

      <CommunityCarousel />

      {/* Latest stories */}
      <section className="mx-auto max-w-6xl px-4 py-16">
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

      {/* Bento: why PastFinder */}
      <section className="bg-surface-sage px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-deep-navy/50">Por que PastFinder</p>
            <h2 className="text-3xl font-bold tracking-tight text-deep-navy md:text-4xl">
              Una forma distinta de dejar huella.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
            <BentoTile className="md:col-span-2 md:row-span-2 bg-deep-navy text-cream">
              <Crown className="mb-4 text-heritage-gold" size={28} />
              <p className="text-2xl font-bold leading-snug md:text-3xl">
                Apoyo directo al narrador, sin intermediarios ni algoritmos de por medio.
              </p>
              <p className="mt-3 text-cream/60">Cada suscripcion llega integra a quien cuenta la historia.</p>
            </BentoTile>

            <BentoTile className="bg-surface-elevated text-deep-navy">
              <ShieldCheck className="mb-3 text-heritage-gold" size={24} />
              <p className="font-bold">Perfiles pensados para 60+</p>
            </BentoTile>

            <BentoTile className="bg-heritage-gold text-cream">
              <Video className="mb-3" size={24} />
              <p className="font-bold">Texto, audio o video: como prefieras contar</p>
            </BentoTile>

            <BentoTile className="md:col-span-2 bg-surface-taupe text-cream">
              <HeartHandshake className="mb-3" size={24} />
              <p className="font-bold">Una comunidad que escucha con respeto, sin prisa.</p>
            </BentoTile>
          </div>
        </div>
      </section>

      {/* Interactive timeline: how it works */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-heritage-gold">Como funciona</p>
          <h2 className="text-3xl font-bold tracking-tight text-deep-navy md:text-4xl">Tres pasos, a tu ritmo.</h2>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-deep-navy/10 md:left-1/2" />
          <TimelineStep
            index={0}
            icon={Compass}
            title="Explora libremente"
            text="Navega historias, categorias y perfiles sin necesidad de registrarte."
          />
          <TimelineStep
            index={1}
            icon={UserPlus}
            title="Sigue y guarda"
            text="Registrate gratis para dar me gusta, comentar, seguir narradores y guardar favoritos."
          />
          <TimelineStep
            index={2}
            icon={Crown}
            title="Suscribete"
            text="Apoya directamente al narrador que quieras y desbloquea su contenido premium."
          />
        </div>
      </section>

      {/* Featured creators */}
      <section className="bg-surface-sage px-4 py-16">
        <div className="mx-auto max-w-6xl">
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
                  className="flex items-center gap-4 rounded-2xl bg-surface-elevated p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <img
                    src={
                      creator.profile_image_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name || 'Narrador')}&background=33424C&color=FAF9F6`
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
        </div>
      </section>

      {/* Horizontal scroll: categories */}
      <section className="py-16">
        <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between px-4">
          <h2 className="text-3xl font-bold text-deep-navy">Explora por tema</h2>
          <Link to="/categorias" className="inline-flex items-center gap-1 text-sm font-bold text-heritage-gold hover:underline">
            <Grid size={14} />
            Todas las categorias
          </Link>
        </div>

        <CategoryMarquee
          items={CATEGORIES.map((name) => ({ name, icon: categoryIcons[name] || FileText }))}
        />
      </section>

      {/* FAQ */}
      <section className="bg-surface-sage px-4 py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-deep-navy/50">Preguntas frecuentes</p>
          <h2 className="text-3xl font-bold tracking-tight text-deep-navy md:text-4xl">Resolvamos tus dudas.</h2>
        </div>
        <FaqAccordion />
      </section>

      {/* Closing CTA */}
      <section className="bg-deep-navy px-4 py-16 text-center text-cream">
        <MapPin className="mx-auto mb-4 text-heritage-gold" size={28} />
        <h2 className="mx-auto mb-4 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Tu historia merece quedar en algun lugar.
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-cream/70">
          Registrate gratis y empieza a explorar, seguir o compartir tus propios relatos hoy mismo.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/registro"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-6 font-bold text-cream transition-all duration-200 hover:bg-heritage-gold-dark active:scale-[0.98]"
          >
            Registrarme
          </Link>
          <Link
            to="/planes"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cream/10 px-6 font-bold text-cream transition-all duration-200 hover:bg-cream/20 active:scale-[0.98]"
          >
            Conocer planes
          </Link>
        </div>
      </section>
    </div>
  );
}

function TimelineStep({
  index,
  icon: Icon,
  title,
  text,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative mb-12 pl-16 last:mb-0 md:mb-16 md:pl-0"
    >
      <div
        className={`flex flex-col gap-6 md:items-center ${fromLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
      >
        <div className="md:w-1/2" />
        <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-heritage-gold text-cream shadow-[0_12px_24px_-10px_rgba(122,155,176,0.6)] md:left-1/2 md:-translate-x-1/2">
          <Icon size={22} />
        </div>
        <div className={`md:w-1/2 ${fromLeft ? 'md:pl-12 md:text-left' : 'md:pr-12 md:text-right'}`}>
          <h3 className="mb-1 text-xl font-bold text-deep-navy">{title}</h3>
          <p className="text-deep-navy/60">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}

function BentoTile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <TiltCard className={`group relative overflow-hidden rounded-[1.75rem] p-6 shadow-[0_20px_40px_-24px_rgba(55,66,74,0.3)] ${className || ''}`}>
      {children}
    </TiltCard>
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
