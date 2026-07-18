import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Crown, MapPin, UserCheck, UserPlus, Users } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { requireAuth } from '../utils/requireAuth';
import { StoryCard } from '../components/StoryCard';
import type { StoryCardPost } from '../components/StoryCard';
import { cn } from '../utils';
import { formatCLP } from '../utils/currency';

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
    creator.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=D4AF37&size=150`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 overflow-hidden rounded-2xl bg-surface-elevated shadow-sm">
        <div
          className="relative min-h-56 bg-deep-navy px-6 py-8 text-cream md:px-8"
          style={
            creator.cover_image_url
              ? {
                  backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.92), rgba(15,23,42,.56)), url(${creator.cover_image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          <div className="flex min-h-40 flex-col justify-end gap-5 pt-12 md:flex-row md:items-end md:justify-start">
            <img src={avatar} alt={name} className="h-32 w-32 rounded-full border-4 border-cream object-cover shadow-md" />
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold md:text-4xl">{name}</h1>
              <p className="mt-2 text-cream/70">{creator.bio || 'Narrador de PastFinder 60+'}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-cream/10 px-4 text-sm font-bold text-cream">
                  <Users size={16} />
                  {followerCount} seguidores
                </span>
                {(creator.location_city || creator.location_country) && (
                  <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-cream/10 px-4 text-sm font-bold text-cream">
                    <MapPin size={16} />
                    {[creator.location_city, creator.location_country].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!isMine && (
          <div className="flex flex-col gap-3 p-5 sm:flex-row">
            <button
              onClick={handleSubscribe}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-6 font-bold text-deep-navy transition-all hover:bg-heritage-gold-dark"
            >
              <Crown size={18} />
              {Number(creator.monthly_price) > 0 ? `Suscribirme por ${formatCLP(creator.monthly_price)}/mes` : 'Suscribirme gratis'}
            </button>
            <button
              onClick={() => void handleFollow()}
              className={cn(
                'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-6 font-bold transition-all',
                isFollowing ? 'bg-surface-subtle text-deep-navy/65' : 'bg-deep-navy text-cream',
              )}
            >
              {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>
        )}
      </section>

      <h2 className="mb-4 text-2xl font-bold text-deep-navy">Historias publicadas</h2>
      {posts.length === 0 ? (
        <p className="text-deep-navy/60">Este narrador aun no ha publicado historias.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <StoryCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
