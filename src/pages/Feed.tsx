import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { notifications } from '@mantine/notifications';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-PE' });
import { AudioPlayer } from '../components/AudioPlayer';
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

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [following, setFollowing] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newCommentByPost, setNewCommentByPost] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  useEffect(() => {
    async function initFeed() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      setCurrentUser(user ? { id: user.id } : null);

      if (user) {
        const [{ data: follows }, { data: likes }] = await Promise.all([
          supabase.from('follows').select('following_id').eq('follower_id', user.id),
          supabase.from('likes').select('post_id').eq('user_id', user.id),
        ]);

        setFollowing(follows?.map((follow) => follow.following_id) || []);
        setLikedPosts(likes?.map((like) => like.post_id) || []);
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
          users ( email, id )
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
  }, []);

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
    if (!currentUser || currentUser.id === creatorId) return;

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
    if (!currentUser) return;

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

  const handleAddComment = async (postId: string) => {
    if (!currentUser) return;

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

  const handleSubscribe = async (creatorId: string) => {
    if (!currentUser || currentUser.id === creatorId) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-preference', {
        body: { creator_id: creatorId, fan_id: currentUser.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.preferenceId) {
        setPreferenceId(data.preferenceId);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error al procesar la suscripción: ' + (error instanceof Error ? error.message : 'Desconocido'),
        color: 'red'
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-deep-navy p-6 text-cream shadow-sm md:p-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-heritage-gold">
            <Sparkles size={14} />
            Comunidad 60+
          </p>
          <h1 className="mb-3 text-4xl font-bold leading-tight md:text-5xl">
            Relatos reales, memorias y videos cortos de personas con historia.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-cream/70 md:text-lg">
            Descubre creadores mayores, sigue sus publicaciones, comenta con respeto y apoya sus
            relatos premium cuando quieras ver mas.
          </p>
        </div>

        <aside className="rounded-2xl bg-surface-elevated p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-deep-navy">Pulso de la comunidad</h2>
          <div className="grid grid-cols-3 gap-3 text-center lg:grid-cols-1">
            <Metric label="Relatos" value={posts.length} />
            <Metric label="Videos" value={posts.filter((post) => post.media_type === 'video').length} />
            <Metric label="Conexiones" value={following.length} />
          </div>
        </aside>
      </section>

      <div className="mb-6 rounded-2xl bg-surface-elevated p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-navy/35" size={20} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por titulo, tema o narrador"
              className="min-h-12 w-full rounded-xl bg-surface-subtle py-3 pl-12 pr-4 text-deep-navy outline-none transition-all placeholder:text-deep-navy/40 focus:ring-2 focus:ring-heritage-gold"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => {
              const Icon = filter.icon;

              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    'inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all',
                    activeFilter === filter.id
                      ? 'bg-deep-navy text-cream shadow-sm'
                      : 'bg-surface-subtle text-deep-navy/65 hover:text-deep-navy',
                  )}
                >
                  <Icon size={18} />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {loading ? (
            [1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-surface-elevated" />)
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-2xl bg-surface-elevated p-10 text-center shadow-sm">
              <Sparkles className="mx-auto mb-4 text-heritage-gold" size={38} />
              <h2 className="mb-2 text-2xl font-bold text-deep-navy">No hay publicaciones para este filtro</h2>
              <p className="text-deep-navy/60">Prueba otra busqueda o publica tu primera historia desde el estudio.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostArticle
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                isFollowing={following.includes(post.creator_id)}
                isLiked={likedPosts.includes(post.id)}
                commentValue={newCommentByPost[post.id] || ''}
                showComments={showComments === post.id}
                onFollow={handleFollow}
                onLike={handleLike}
                onToggleComments={() => setShowComments(showComments === post.id ? null : post.id)}
                onCommentChange={(value) => setNewCommentByPost((prev) => ({ ...prev, [post.id]: value }))}
                onAddComment={handleAddComment}
                onSubscribe={handleSubscribe}
              />
            ))
          )}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-2xl bg-surface-elevated p-5 shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-deep-navy">Filtros sugeridos</h2>
            <div className="space-y-2 text-sm text-deep-navy/70">
              <p>#amorDespuesDeLos60</p>
              <p>#memoriasDeBarrio</p>
              <p>#consejosDeVida</p>
              <p>#viajesYRecuerdos</p>
            </div>
          </div>
          <div className="rounded-2xl bg-heritage-gold p-5 text-deep-navy shadow-sm">
            <Lock className="mb-3" size={28} />
            <h2 className="mb-2 text-2xl font-bold">Modelo premium</h2>
            <p className="text-sm leading-6">
              Los creadores pueden publicar para todos o para miembros gratuitos.
            </p>
          </div>
        </aside>
      </div>

      {preferenceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-navy/80 p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-cream p-8 shadow-xl">
            <button
              onClick={() => {
                setPreferenceId(null);
              }}
              className="absolute right-6 top-6 text-deep-navy/50 hover:text-deep-navy"
            >
              Cerrar
            </button>
            <h2 className="mb-2 text-2xl font-bold text-deep-navy">Completar Suscripcion</h2>
            <p className="mb-6 text-sm text-deep-navy/70">
              Elige tu metodo de pago seguro con Mercado Pago.
            </p>
            <div className="min-h-[300px]">
              <Wallet
                initialization={{ preferenceId }}
              />
            </div>
          </div>
        </div>
      )}
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
  onFollow,
  onLike,
  onToggleComments,
  onCommentChange,
  onAddComment,
  onSubscribe,
}: {
  post: Post;
  currentUserId?: string;
  isFollowing: boolean;
  isLiked: boolean;
  commentValue: string;
  showComments: boolean;
  onFollow: (creatorId: string) => void;
  onLike: (postId: string) => void;
  onToggleComments: () => void;
  onCommentChange: (value: string) => void;
  onAddComment: (postId: string) => void;
  onSubscribe: (creatorId: string) => void;
}) {
  const creatorName = getCreatorName(post);
  const creatorAvatar =
    post.creators?.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=0F172A&color=D4AF37`;
  const isMyPost = currentUserId === post.creator_id;
  const isTextPost = post.media_type === 'photo' || Boolean(post.text_content);

  return (
    <article className="overflow-hidden rounded-2xl bg-surface-elevated shadow-sm transition-all hover:shadow-md">
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
                'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all',
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
          {post.is_sub_only && <Badge label="Suscriptores" />}
          {post.is_ppv && <Badge label="Miembros gratis" />}
          {isTextPost && <Badge label="Relato" />}
          {post.media_type === 'audio' && <Badge label="Audio" />}
          {post.media_type === 'video' && <Badge label="Video corto" />}
        </div>

        <h2 className="mb-3 text-3xl font-bold leading-tight text-deep-navy">{post.title}</h2>

        {post.description && <p className="mb-4 text-deep-navy/70">{post.description}</p>}

        {post.text_content && (
          <div className="mb-4 rounded-xl bg-cream/60 p-5 text-lg leading-8 text-deep-navy/80 whitespace-pre-wrap">
            {post.text_content}
          </div>
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
              'inline-flex items-center gap-2 font-bold transition-all',
              isLiked ? 'text-red-500' : 'text-deep-navy/45 hover:text-red-500',
            )}
          >
            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
            {post.likes?.length || 0}
          </button>
          <button
            onClick={onToggleComments}
            className={cn(
              'inline-flex items-center gap-2 font-bold transition-all',
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
                    src={`https://ui-avatars.com/api/?name=${comment.user_id}&background=D4AF37&color=0F172A`}
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
    <div className="rounded-xl bg-surface-subtle p-3">
      <span className="block text-2xl font-bold text-deep-navy">{value}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-deep-navy/50">{label}</span>
    </div>
  );
}
