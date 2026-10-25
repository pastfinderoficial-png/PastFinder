import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Crown, FileText, MapPin, Mic, Sparkles, UserCheck, UserPlus, Users, Video } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { requireAuth } from '../utils/requireAuth';
import { StoryCard } from '../components/StoryCard';
import type { StoryCardPost } from '../components/StoryCard';
import { cn } from '../utils';
import { formatCLP } from '../utils/currency';

type ContentFilter = 'all' | 'photo' | 'audio' | 'video';

const contentTabs: Array<{ id: ContentFilter; label: string; icon: typeof Sparkles }> = [
  { id: 'all', label: 'Todo', icon: Sparkles },
  { id: 'photo', label: 'Relatos', icon: FileText },
  { id: 'audio', label: 'Audios', icon: Mic },
  { id: 'video', label: 'Videos', icon: Video },
];

type CreatorInfo = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  monthly_price: number | string | null;
  location_city: string | null;
  location_country: string | null;
};

export function AutorPublico() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [posts, setPosts] = useState<StoryCardPost[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);

      const { data: creatorData, error } = await supabase
        .from('creators')
        .select('user_id, display_name, bio, profile_image_url, cover_image_url, monthly_price, location_city, location_country')
        .eq('user_id', id)
        .maybeSingle();

      if (error || !creatorData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCreator(creatorData as CreatorInfo);

      const [{ data: postData }, { count }] = await Promise.all([
        supabase
          .from('posts')
          .select('id, title, description, media_type, category, is_ppv, is_sub_only, created_at, creators ( user_id, display_name, profile_image_url )')
          .eq('creator_id', id)
          .order('created_at', { ascending: false }),
        supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', id),
      ]);

      setPosts((postData || []) as unknown as StoryCardPost[]);
      setFollowerCount(count || 0);

      if (user) {
        const { data: myFollow } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .eq('following_id', id)
          .maybeSingle();
        setIsFollowing(Boolean(myFollow));
      } else {
        setIsFollowing(false);
      }

      setLoading(false);
    }

    void load();
  }, [id, user]);

  const handleFollow = async () => {
    if (!requireAuth(user, navigate, 'Regístrate para seguir a este narrador.') || !id) return;
    if (user.id === id) return;

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id);
      setIsFollowing(false);
      setFollowerCount((count) => Math.max(0, count - 1));
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: id });
      setIsFollowing(true);
      setFollowerCount((count) => count + 1);
    }
  };

  const handleSubscribe = () => {
    if (!requireAuth(user, navigate, 'Regístrate o inicia sesión para suscribirte.') || !id) return;
    navigate(`/checkout?creator=${id}`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
      </div>
    );
  }

  if (notFound || !creator) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-deep-navy">Narrador no encontrado</h1>
        <Link to="/historias" className="mt-4 inline-block font-bold text-heritage-gold hover:underline">
          Volver a explorar
        </Link>
      </div>
    );
  }

  const isMine = user?.id === id;
  const name = creator.display_name || 'Narrador PastFinder';
  const avatar =
    creator.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=37424A&color=F5F4EE&size=150`;
  const hasPrice = Number(creator.monthly_price) > 0;

  return (
    <div className="mx-auto max-w-5xl pb-32">
      <section className="relative mb-20 md:mb-24">
        <div
          className="h-48 w-full bg-deep-navy md:h-64"
          style={
            creator.cover_image_url
              ? {
                  backgroundImage: `linear-gradient(0deg, rgba(55,66,74,.5), rgba(55,66,74,.15)), url(${creator.cover_image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />

        <div className="absolute left-4 right-4 top-32 flex flex-col gap-5 rounded-[1.75rem] bg-surface-elevated p-5 shadow-[0_24px_48px_-20px_rgba(55,66,74,0.35)] sm:left-6 sm:right-6 sm:flex-row sm:items-end sm:gap-6 md:top-40 md:p-6">
          <img
            src={avatar}
            alt={name}
            className="h-24 w-24 shrink-0 -translate-y-14 rounded-full border-4 border-surface-elevated object-cover shadow-md sm:-translate-y-16 sm:h-28 sm:w-28 md:h-32 md:w-32"
          />
          <div className="-mt-10 min-w-0 flex-1 sm:mt-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-deep-navy md:text-3xl">{name}</h1>
            <p className="mt-1 line-clamp-2 text-sm text-deep-navy/60 md:text-base">{creator.bio || 'Narrador de PastFinder 60+'}</p>
          </div>

          {!isMine && (
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => void handleFollow()}
                aria-label={isFollowing ? 'Dejar de seguir' : 'Seguir'}
                className={cn(
                  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-bold transition-all duration-200 active:scale-95',
                  isFollowing ? 'bg-surface-subtle text-deep-navy/65' : 'bg-deep-navy text-cream hover:bg-deep-navy/90',
                )}
              >
                {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                <span className="hidden sm:inline">{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
              </button>
              <button
                onClick={handleSubscribe}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-5 font-bold text-cream transition-all duration-200 hover:bg-heritage-gold-dark active:scale-95"
              >
                <Crown size={18} />
                {hasPrice ? `${formatCLP(creator.monthly_price)}/mes` : 'Gratis'}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="mb-8 grid grid-cols-3 gap-3 px-4 md:px-0">
        <StatPill icon={Users} value={followerCount} label="Seguidores" />
        <StatPill icon={FileText} value={posts.length} label="Publicaciones" />
        <StatPill
          icon={MapPin}
          value={[creator.location_city, creator.location_country].filter(Boolean).join(', ') || 'Sin ubicacion'}
          label="Ubicacion"
          small
        />
      </div>

      <div className="px-4 md:px-0">
        <div className="mb-5 flex gap-2 overflow-x-auto">
          {contentTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setContentFilter(tab.id)}
                className={cn(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all duration-200 active:scale-95',
                  contentFilter === tab.id ? 'bg-deep-navy text-cream' : 'bg-surface-subtle text-deep-navy/65 hover:text-deep-navy',
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <FilteredPosts posts={posts} filter={contentFilter} />
      </div>
    </div>
  );
}

function FilteredPosts({ posts, filter }: { posts: StoryCardPost[]; filter: ContentFilter }) {
  const filtered = useMemo(
    () => (filter === 'all' ? posts : posts.filter((post) => post.media_type === filter)),
    [posts, filter],
  );

  if (filtered.length === 0) {
    return <p className="text-deep-navy/60">Este narrador aun no ha publicado historias en esta categoria.</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((post) => (
        <StoryCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function StatPill({
  icon: Icon,
  value,
  label,
  small,
}: {
  icon: typeof Users;
  value: number | string;
  label: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface-elevated p-4 text-center shadow-sm">
      <Icon className="mx-auto mb-1.5 text-heritage-gold" size={18} />
      <span className={cn('block font-bold text-deep-navy', small ? 'truncate text-sm' : 'text-xl')}>{value}</span>
      <span className="text-[11px] font-bold uppercase tracking-widest text-deep-navy/45">{label}</span>
    </div>
  );
}
