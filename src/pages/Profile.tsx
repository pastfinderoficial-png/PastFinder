import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, FileText, Mic, PlayCircle, Crown, Users, MapPin, LayoutDashboard, Bookmark, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCLP } from '../utils/currency';

type CreatorProfile = {
  user_id: string;
  display_name?: string | null;
  bio?: string | null;
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  monthly_price?: number | string | null;
  location_city?: string | null;
  location_country?: string | null;
};

type ProfilePostSummary = {
  media_type: 'audio' | 'photo' | 'video';
  text_content?: string | null;
  is_ppv?: boolean;
  is_sub_only?: boolean;
};

const defaultBio = 'Creador 60+ compartiendo relatos, memorias y videos cortos en PastFinder.';

export function Profile() {
  const { user: currentUser, isAdmin } = useAuth();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [posts, setPosts] = useState<ProfilePostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!currentUser) return;

      const [{ data: creatorData }, { data: postData }] = await Promise.all([
        supabase.from('creators').select('*').eq('user_id', currentUser.id).maybeSingle(),
        supabase.from('posts').select('media_type, text_content, is_ppv, is_sub_only').eq('creator_id', currentUser.id),
      ]);

      setCreator((creatorData as CreatorProfile | null) || null);
      setPosts((postData || []) as ProfilePostSummary[]);
      setLoading(false);
    }

    void load();
  }, [currentUser]);

  const stats = useMemo(
    () => ({
      textos: posts.filter((post) => post.media_type === 'photo' || post.text_content).length,
      audios: posts.filter((post) => post.media_type === 'audio').length,
      videos: posts.filter((post) => post.media_type === 'video').length,
      premium: posts.filter((post) => post.is_ppv || post.is_sub_only).length,
    }),
    [posts],
  );

  const profile = {
    name: creator?.display_name || currentUser?.user_metadata?.display_name || currentUser?.email?.split('@')[0] || 'Cargando',
    bio: creator?.bio || defaultBio,
    avatar:
      creator?.profile_image_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        currentUser?.user_metadata?.display_name || currentUser?.email || 'User',
      )}&background=37424A&color=F5F4EE&size=150`,
    cover: creator?.cover_image_url || '',
    city: creator?.location_city || '',
    country: creator?.location_country || '',
    monthly_price: creator?.monthly_price ?? 0,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-32">
      <section className="relative mb-20 md:mb-24">
        <div
          className="h-48 w-full bg-deep-navy md:h-64"
          style={
            profile.cover
              ? {
                  backgroundImage: `linear-gradient(0deg, rgba(55,66,74,.5), rgba(55,66,74,.15)), url(${profile.cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />

        <Link
          to="/configuracion"
          className="absolute right-4 top-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-deep-navy/50 px-4 text-sm font-bold text-cream backdrop-blur transition-all duration-200 hover:bg-deep-navy/70 active:scale-95"
        >
          <Settings size={16} />
          <span className="hidden sm:inline">Editar perfil</span>
        </Link>

        <div className="absolute left-4 right-4 top-32 flex flex-col gap-5 rounded-[1.75rem] bg-surface-elevated p-5 shadow-[0_24px_48px_-20px_rgba(55,66,74,0.35)] sm:left-6 sm:right-6 sm:flex-row sm:items-end sm:gap-6 md:top-40 md:p-6">
          <img
            src={profile.avatar}
            alt="Tu foto de perfil"
            className="h-24 w-24 shrink-0 -translate-y-14 rounded-full border-4 border-surface-elevated object-cover shadow-md sm:-translate-y-16 sm:h-28 sm:w-28 md:h-32 md:w-32"
          />
          <div className="-mt-10 min-w-0 flex-1 sm:mt-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-heritage-gold">Perfil de creador</p>
            <h1 className="truncate text-2xl font-bold tracking-tight text-deep-navy md:text-3xl">{profile.name}</h1>
            <p className="mt-1 line-clamp-2 text-sm text-deep-navy/60 md:text-base">{profile.bio}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface-subtle px-3 text-xs font-bold text-deep-navy">
                <Users size={14} />
                {Number(profile.monthly_price) > 0 ? formatCLP(profile.monthly_price) + '/mes' : 'Suscripción gratis'}
              </span>
              {(profile.city || profile.country) && (
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-surface-subtle px-3 text-xs font-bold text-deep-navy">
                  <MapPin size={14} />
                  {[profile.city, profile.country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-0">
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <ProfileMetric icon={FileText} label="Relatos" value={stats.textos} />
          <ProfileMetric icon={Mic} label="Audios" value={stats.audios} />
          <ProfileMetric icon={PlayCircle} label="Videos" value={stats.videos} />
          <ProfileMetric icon={Crown} label="Premium" value={stats.premium} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProfileLink to="/mis-historias" icon={FileText} title="Mis historias" text="Revisa y administra tus publicaciones." />
          <ProfileLink to="/favoritos" icon={Bookmark} title="Favoritos" text="Historias que has guardado." />
          <ProfileLink to="/dashboard" icon={LayoutDashboard} title="Panel" text="Ganancias, estadisticas y retiros." />
          <ProfileLink to="/configuracion" icon={Settings} title="Configuracion" text="Edita tu perfil publico." />
          {isAdmin && (
            <ProfileLink to="/admin" icon={Shield} title="Administracion" text="Panel de administracion de la plataforma." />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ to, icon: Icon, title, text }: { to: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <Link to={to} className="rounded-[1.75rem] bg-surface-elevated p-5 shadow-[0_20px_40px_-24px_rgba(55,66,74,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-20px_rgba(55,66,74,0.3)] active:scale-[0.99]">
      <Icon className="mb-3 text-heritage-gold" size={26} />
      <h3 className="mb-1 text-lg font-bold text-deep-navy">{title}</h3>
      <p className="text-sm text-deep-navy/60">{text}</p>
    </Link>
  );
}

function ProfileMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-subtle p-4">
      <Icon className="mb-3 text-heritage-gold" size={22} />
      <span className="block text-2xl font-bold text-deep-navy">{value}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-deep-navy/55">{label}</span>
    </div>
  );
}
