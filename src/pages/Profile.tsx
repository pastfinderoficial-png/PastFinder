import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, FileText, Mic, PlayCircle, Crown, Users, MapPin, LayoutDashboard, Bookmark } from 'lucide-react';
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
  const { user: currentUser } = useAuth();
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
      )}&background=0F172A&color=D4AF37&size=150`,
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
    <div className="mx-auto max-w-5xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 overflow-hidden rounded-2xl bg-surface-elevated shadow-sm">
        <div
          className="relative min-h-64 bg-deep-navy px-6 py-8 text-cream md:px-8"
          style={
            profile.cover
              ? {
                  backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.92), rgba(15,23,42,.56)), url(${profile.cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          <Link
            to="/configuracion"
            className="absolute right-5 top-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-cream/10 px-4 text-sm font-bold text-cream/80 transition-colors hover:text-cream"
          >
            <Settings size={18} />
            Editar perfil
          </Link>

          <div className="flex min-h-48 flex-col justify-end gap-5 pt-16 md:flex-row md:items-end md:justify-start">
            <img src={profile.avatar} alt="Tu foto de perfil" className="h-36 w-36 rounded-full border-4 border-cream object-cover shadow-md" />
            <div className="max-w-2xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-heritage-gold">Perfil de creador</p>
              <h1 className="text-4xl font-bold md:text-5xl">{profile.name}</h1>
              <p className="mt-3 text-cream/70">{profile.bio}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-cream px-4 text-sm font-bold text-deep-navy">
                  <Users size={16} />
                  {Number(profile.monthly_price) > 0 ? `Suscripción: ${formatCLP(profile.monthly_price)}` : 'Suscripción gratis'}
                </span>
                {(profile.city || profile.country) && (
                  <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-cream/10 px-4 text-sm font-bold text-cream">
                    <MapPin size={16} />
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
          <ProfileMetric icon={FileText} label="Relatos" value={stats.textos} />
          <ProfileMetric icon={Mic} label="Audios" value={stats.audios} />
          <ProfileMetric icon={PlayCircle} label="Videos" value={stats.videos} />
          <ProfileMetric icon={Crown} label="Premium" value={stats.premium} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileLink to="/mis-historias" icon={FileText} title="Mis historias" text="Revisa y administra tus publicaciones." />
        <ProfileLink to="/favoritos" icon={Bookmark} title="Favoritos" text="Historias que has guardado." />
        <ProfileLink to="/dashboard" icon={LayoutDashboard} title="Panel" text="Ganancias, estadisticas y retiros." />
        <ProfileLink to="/configuracion" icon={Settings} title="Configuracion" text="Edita tu perfil publico." />
      </div>
    </div>
  );
}

function ProfileLink({ to, icon: Icon, title, text }: { to: string; icon: LucideIcon; title: string; text: string }) {
  return (
    <Link to={to} className="rounded-2xl bg-surface-elevated p-5 shadow-sm transition-shadow hover:shadow-md">
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
