import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { requireAuth } from '../utils/requireAuth';

import { AudioPlayer } from '../components/AudioPlayer';
import { ExpandableText } from '../components/ExpandableText';
import {
  Search,
  MessageSquare,
  Heart,
  Share2,
  UserPlus,
  UserCheck,
  Send,
  MoreHorizontal,
  Mic,
  FileText,
  Video,
  Sparkles,
  Lock,
  Crown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../constants/categories';
import { PhotoBanner } from '../components/PhotoBanner';
import bannerPhoto from '../assets/carousel/hero-1.jpg';

type FeedFilter = 'all' | 'audio' | 'text' | 'video' | 'following';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
};

type Like = {
  user_id: string;
};

type Post = {
  id: string;
  creator_id: string;
  title: string;
  description?: string | null;
  media_type: 'audio' | 'photo' | 'video';
  media_url?: string | null;
  text_content?: string | null;
  category?: string | null;
  created_at: string;
  is_ppv?: boolean;
  is_sub_only?: boolean;
  creators?: {
    display_name?: string | null;
    bio?: string | null;
    profile_image_url?: string | null;
    users?: {
      email?: string | null;
      id?: string;
    } | null;
  } | null;
  comments?: Comment[];
  likes?: Like[];
};

const filters: Array<{ id: FeedFilter; label: string; icon: LucideIcon }> = [
  { id: 'all', label: 'Todo', icon: Sparkles },
  { id: 'text', label: 'Relatos', icon: FileText },
  { id: 'audio', label: 'Audios', icon: Mic },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'following', label: 'Siguiendo', icon: UserCheck },
];

export function Explorar() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [favoritedPosts, setFavoritedPosts] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newCommentByPost, setNewCommentByPost] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');

  useEffect(() => {
    async function initFeed() {
      setLoading(true);

      if (currentUser) {
        const [{ data: follows }, { data: likes }, { data: favorites }] = await Promise.all([
          supabase.from('follows').select('following_id').eq('follower_id', currentUser.id),
          supabase.from('likes').select('post_id').eq('user_id', currentUser.id),
          supabase.from('favorites').select('post_id').eq('user_id', currentUser.id),
        ]);

        setFollowing(follows?.map((follow) => follow.following_id) || []);
        setLikedPosts(likes?.map((like) => like.post_id) || []);
        setFavoritedPosts(favorites?.map((favorite) => favorite.post_id) || []);
      } else {
        setFollowing([]);
        setLikedPosts([]);
        setFavoritedPosts([]);
      }

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          creators (
          user_id,
          display_name,
          bio,
          profile_image_url,
          users!creators_user_id_fkey ( email, id )
        ),
          comments (
            id,
            content,
            created_at,
            user_id
          ),
          likes ( user_id )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data as Post[]);
      }

      setLoading(false);
    }

    void initFeed();
  }, [currentUser]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const isTextPost = post.media_type === 'photo' || Boolean(post.text_content);
      const matchesType =
        activeFilter === 'all' ||
        (activeFilter === 'following' && following.includes(post.creator_id)) ||
        (activeFilter === 'text' && isTextPost) ||
        (activeFilter === 'audio' && post.media_type === 'audio') ||
        (activeFilter === 'video' && post.media_type === 'video');

      const creatorName = getCreatorName(post);
      const searchable = [
        post.title,
        post.description,
        post.text_content,
        post.category,
        creatorName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesType && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeFilter, following, posts, query]);

  const handleFollow = async (creatorId: string) => {
    if (!requireAuth(currentUser, navigate, 'Regístrate para seguir a este narrador.')) return;
    if (currentUser.id === creatorId) return;

    if (following.includes(creatorId)) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', creatorId);
      setFollowing((prev) => prev.filter((id) => id !== creatorId));
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUser.id,
        following_id: creatorId,
      });
      setFollowing((prev) => [...prev, creatorId]);
    }
  };

  const handleLike = async (postId: string) => {
    if (!requireAuth(currentUser, navigate, 'Regístrate para dar Me gusta.')) return;

    if (likedPosts.includes(postId)) {
      await supabase.from('likes').delete().eq('user_id', currentUser.id).eq('post_id', postId);
      setLikedPosts((prev) => prev.filter((id) => id !== postId));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes: post.likes?.filter((like) => like.user_id !== currentUser.id) || [] }
            : post,
        ),
      );
    } else {
      await supabase.from('likes').insert({ user_id: currentUser.id, post_id: postId });
      setLikedPosts((prev) => [...prev, postId]);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, likes: [...(post.likes || []), { user_id: currentUser.id }] }
            : post,
        ),
      );
    }
  };

  const handleFavorite = async (postId: string) => {
    if (!requireAuth(currentUser, navigate, 'Regístrate para guardar historias en favoritos.')) return;

    if (favoritedPosts.includes(postId)) {
      await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('post_id', postId);
      setFavoritedPosts((prev) => prev.filter((id) => id !== postId));
    } else {
      await supabase.from('favorites').insert({ user_id: currentUser.id, post_id: postId });
      setFavoritedPosts((prev) => [...prev, postId]);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!requireAuth(currentUser, navigate, 'Regístrate para comentar.')) return;

    const content = newCommentByPost[postId]?.trim();
    if (!content) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        content,
      })
      .select('id, content, created_at, user_id')
      .single();

    if (!error && data) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments: [...(post.comments || []), data] } : post,
        ),
      );
      setNewCommentByPost((prev) => ({ ...prev, [postId]: '' }));
    }
  };

  const handleSubscribe = (creatorId: string) => {
    if (!requireAuth(currentUser, navigate, 'Regístrate o inicia sesión para suscribirte.')) return;
    if (currentUser.id === creatorId) return;

    navigate(`/checkout?creator=${creatorId}`);
  };

  const resultLabel = `${filteredPosts.length} ${filteredPosts.length === 1 ? 'publicacion' : 'publicaciones'}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:py-10">
      <PhotoBanner image={bannerPhoto} className="mb-8 rounded-[2rem]" contentClassName="p-6 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-heritage-gold">
              <Sparkles size={14} />
              Comunidad 60+
            </p>
            <h1 className="mb-4 max-w-xl text-4xl font-bold leading-[1] tracking-tight md:text-5xl">
              Relatos reales, memorias y videos cortos de personas con historia.
            </h1>
            <p className="max-w-lg text-base leading-7 text-cream/70">
              Descubre creadores mayores, sigue sus publicaciones, comenta con respeto y apoya sus
              relatos premium cuando quieras ver mas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <Metric label="Relatos" value={posts.length} />
            <Metric label="Videos" value={posts.filter((post) => post.media_type === 'video').length} />
            <Metric label="Siguiendo" value={following.length} />
          </div>
        </div>
      </PhotoBanner>

      <div className="sticky top-4 z-30 mb-6 md:top-24">
        <div className="rounded-[1.5rem] bg-surface-elevated/90 p-2.5 shadow-[0_20px_40px_-24px_rgba(51,66,76,0.35)] backdrop-blur-md">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-navy/35" size={20} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por titulo, tema o narrador"
                className="min-h-12 w-full rounded-2xl bg-surface-subtle py-3 pl-12 pr-4 text-deep-navy outline-none transition-all placeholder:text-deep-navy/40 focus:ring-2 focus:ring-heritage-gold"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto rounded-2xl bg-surface-subtle p-1">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      'relative inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors duration-200 active:scale-95',
                      isActive ? 'text-cream' : 'text-deep-navy/60 hover:text-deep-navy',
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="explorar-filter-pill"
                        className="absolute inset-0 rounded-xl bg-deep-navy"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-2">
                      <Icon size={17} />
                      {filter.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {!loading && (
            <p className="px-1 text-xs font-bold uppercase tracking-widest text-deep-navy/45">{resultLabel}</p>
          )}

          {loading ? (
            [1, 2, 3].map((item) => <PostSkeleton key={item} />)
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-[1.75rem] bg-surface-sage/60 p-10 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated text-heritage-gold">
                <Sparkles size={26} />
              </span>
              <h2 className="mb-2 text-2xl font-bold text-deep-navy">No hay publicaciones para este filtro</h2>
              <p className="mb-6 text-deep-navy/60">Prueba otra busqueda o comparte tu primera historia desde el estudio.</p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setQuery('');
                    setActiveFilter('all');
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-surface-elevated px-6 font-bold text-deep-navy transition-all duration-200 active:scale-[0.98]"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => navigate('/studio')}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-deep-navy px-6 font-bold text-cream transition-all duration-200 active:scale-[0.98]"
                >
                  Ir al estudio
                </button>
              </div>
            </div>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 110, damping: 20, delay: Math.min(index, 3) * 0.04 }}
              >
                <PostArticle
                  post={post}
                  currentUserId={currentUser?.id}
                  isFollowing={following.includes(post.creator_id)}
                  isLiked={likedPosts.includes(post.id)}
                  isFavorited={favoritedPosts.includes(post.id)}
                  commentValue={newCommentByPost[post.id] || ''}
                  showComments={showComments === post.id}
                  onFollow={handleFollow}
                  onLike={handleLike}
                  onFavorite={handleFavorite}
                  onToggleComments={() => setShowComments(showComments === post.id ? null : post.id)}
                  onCommentChange={(value) => setNewCommentByPost((prev) => ({ ...prev, [post.id]: value }))}
                  onAddComment={handleAddComment}
                  onSubscribe={handleSubscribe}
                />
              </motion.div>
            ))
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-48 space-y-4">
            <div className="rounded-[1.75rem] bg-surface-elevated p-5 shadow-[0_20px_40px_-24px_rgba(51,66,76,0.25)]">
              <h2 className="mb-3 text-xl font-bold text-deep-navy">Explora por tema</h2>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setQuery(query === category ? '' : category)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95',
                      query === category
                        ? 'bg-deep-navy text-cream'
                        : 'bg-surface-subtle text-deep-navy/70 hover:bg-surface-sage',
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.75rem] bg-heritage-gold p-6 text-cream shadow-[0_20px_40px_-24px_rgba(92,127,147,0.6)]">
              <Lock className="mb-3" size={26} />
              <h2 className="mb-2 text-xl font-bold">Modelo premium</h2>
              <p className="text-sm leading-6 text-cream/85">
                Los creadores pueden publicar para todos o exclusivo para sus suscriptores premium.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="space-y-4 rounded-[1.75rem] bg-surface-elevated p-5 shadow-[0_20px_40px_-24px_rgba(51,66,76,0.2)]">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-surface-subtle" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-subtle" />
          <div className="h-3 w-24 animate-pulse rounded bg-surface-subtle" />
        </div>
      </div>
      <div className="h-7 w-3/4 animate-pulse rounded bg-surface-subtle" />
      <div className="h-40 animate-pulse rounded-2xl bg-surface-subtle" />
    </div>
  );
}

function PostArticle({
  post,
  currentUserId,
  isFollowing,
  isLiked,
  commentValue,
  showComments,
  isFavorited,
  onFollow,
  onLike,
  onFavorite,
  onToggleComments,
  onCommentChange,
  onAddComment,
  onSubscribe,
}: {
  post: Post;
  currentUserId?: string;
  isFollowing: boolean;
  isLiked: boolean;
  isFavorited: boolean;
  commentValue: string;
  showComments: boolean;
  onFollow: (creatorId: string) => void;
  onLike: (postId: string) => void;
  onFavorite: (postId: string) => void;
  onToggleComments: () => void;
  onCommentChange: (value: string) => void;
  onAddComment: (postId: string) => void;
  onSubscribe: (creatorId: string) => void;
}) {
  const creatorName = getCreatorName(post);
  const creatorAvatar =
    post.creators?.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=37424A&color=F5F4EE`;
  const isMyPost = currentUserId === post.creator_id;
  const isTextPost = post.media_type === 'photo' || Boolean(post.text_content);

  return (
    <article className="overflow-hidden rounded-[1.75rem] bg-surface-elevated shadow-[0_20px_40px_-24px_rgba(55,66,74,0.25)] transition-all duration-200 hover:shadow-[0_24px_48px_-20px_rgba(55,66,74,0.3)]">
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={creatorAvatar}
            className="h-12 w-12 rounded-full object-cover shadow-sm"
            alt={`Avatar de ${creatorName}`}
          />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-deep-navy">{creatorName}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-deep-navy/40">
              {new Date(post.created_at).toLocaleDateString()} {post.category ? `- ${post.category}` : ''}
            </p>
          </div>
        </div>

        {!isMyPost ? (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => onSubscribe(post.creator_id)}
              className="hidden min-h-10 items-center gap-2 rounded-full bg-heritage-gold px-4 text-xs font-bold text-deep-navy transition-all hover:bg-heritage-gold-dark sm:inline-flex"
            >
              <Crown size={16} />
              Suscribirme
            </button>
            <button
              onClick={() => onFollow(post.creator_id)}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all duration-200 active:scale-95',
                isFollowing ? 'bg-surface-subtle text-deep-navy/65' : 'bg-deep-navy text-cream',
              )}
            >
              {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>
        ) : (
          <button className="rounded-full p-2 text-deep-navy/35 transition-colors hover:text-deep-navy">
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      <div className="px-5 pb-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {post.is_sub_only && <Badge label="Premium" />}
          {post.is_ppv && <Badge label="Premium" />}
          {isTextPost && <Badge label="Relato" />}
          {post.media_type === 'audio' && <Badge label="Audio" />}
          {post.media_type === 'video' && <Badge label="Video corto" />}
        </div>

        <h2 className="mb-3 text-3xl font-bold leading-tight text-deep-navy">{post.title}</h2>

        {post.description && <p className="mb-4 text-deep-navy/70">{post.description}</p>}

        {post.text_content && (
          <ExpandableText
            text={post.text_content}
            className="mb-4 rounded-xl bg-cream/60 p-5 text-lg leading-8 text-deep-navy/80 whitespace-pre-wrap"
          />
        )}

        {post.media_type === 'audio' && post.media_url && (
          <AudioPlayer
            audioUrl={post.media_url}
            isPpv={false}
            hasAccess
          />
        )}

        {post.media_type === 'video' && post.media_url && (
          <video
            className="aspect-video w-full rounded-xl bg-deep-navy object-cover"
            src={post.media_url}
            controls
            playsInline
            preload="metadata"
          />
        )}
      </div>

      <div className="flex items-center justify-between bg-surface-subtle/45 px-5 py-4">
        <div className="flex gap-5">
          <button
            onClick={() => onLike(post.id)}
            className={cn(
              'inline-flex items-center gap-2 font-bold transition-all duration-200 active:scale-90',
              isLiked ? 'text-red-500' : 'text-deep-navy/45 hover:text-red-500',
            )}
          >
            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
            {post.likes?.length || 0}
          </button>
          <button
            onClick={onToggleComments}
            className={cn(
              'inline-flex items-center gap-2 font-bold transition-all duration-200 active:scale-90',
              showComments ? 'text-deep-navy' : 'text-deep-navy/45 hover:text-deep-navy',
            )}
          >
            <MessageSquare size={22} />
            {post.comments?.length || 0}
          </button>
        </div>
        <div className="flex items-center gap-4">
          {!isMyPost && (
            <button
              onClick={() => onSubscribe(post.creator_id)}
              className="inline-flex items-center gap-2 text-sm font-bold text-deep-navy/55 transition-colors hover:text-heritage-gold sm:hidden"
            >
              <Crown size={20} />
              Suscribirme
            </button>
          )}
          <button
            onClick={() => onFavorite(post.id)}
            aria-label="Guardar en favoritos"
            className={cn(
              'transition-colors',
              isFavorited ? 'text-heritage-gold' : 'text-deep-navy/45 hover:text-heritage-gold',
            )}
          >
            <Heart size={22} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
          <button className="text-deep-navy/45 transition-colors hover:text-heritage-gold">
            <Share2 size={22} />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="space-y-4 p-5">
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {post.comments?.length ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${comment.user_id}&background=8B7556&color=F5F4EE`}
                    className="h-8 w-8 rounded-full"
                    alt="Avatar de comentario"
                  />
                  <div className="flex-1 rounded-xl rounded-tl-sm bg-surface-subtle p-3">
                    <p className="mb-1 text-xs font-bold text-deep-navy/55">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-deep-navy/80">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-deep-navy/45">Se el primero en comentar con respeto.</p>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={commentValue}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder="Escribe un comentario"
              className="min-h-12 w-full rounded-xl bg-surface-subtle py-3 pl-4 pr-12 text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void onAddComment(post.id);
                }
              }}
            />
            <button
              onClick={() => void onAddComment(post.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-heritage-gold transition-colors hover:text-deep-navy"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function getCreatorName(post: Post) {
  return post.creators?.display_name || post.creators?.users?.email?.split('@')[0] || 'Narrador PastFinder';
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-bold uppercase tracking-widest text-deep-navy/65">{label}</span>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-cream/10 p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md md:p-4">
      <span className="block text-2xl font-bold tracking-tight text-cream md:text-3xl">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-cream/60 md:text-xs">{label}</span>
    </div>
  );
}
