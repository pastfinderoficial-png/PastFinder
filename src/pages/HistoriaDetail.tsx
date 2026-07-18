import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Send,
  UserPlus,
  UserCheck,
  Crown,
  Lock,
  FileText,
  Mic,
  Video,
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { requireAuth } from '../utils/requireAuth';
import { AudioPlayer } from '../components/AudioPlayer';
import { cn } from '../utils';

type PostDetail = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  media_type: 'audio' | 'photo' | 'video';
  category: string | null;
  created_at: string;
  is_ppv: boolean;
  is_sub_only: boolean;
  preview_text: string | null;
  full_text_content: string | null;
  media_url: string | null;
  has_access: boolean;
};

type CreatorInfo = {
  user_id: string;
  display_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
};

const mediaIcon = { audio: Mic, photo: FileText, video: Video };

export function HistoriaDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);

      const { data: detail, error } = await supabase.rpc('get_post_detail', { p_post_id: id }).maybeSingle();

      if (error || !detail) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(detail as PostDetail);

      const [{ data: creatorData }, { data: commentData }, { data: likeRows }] = await Promise.all([
        supabase
          .from('creators')
          .select('user_id, display_name, bio, profile_image_url')
          .eq('user_id', (detail as PostDetail).creator_id)
          .maybeSingle(),
        supabase
          .from('comments')
          .select('id, content, created_at, user_id')
          .eq('post_id', id)
          .order('created_at', { ascending: true }),
        supabase.from('likes').select('user_id').eq('post_id', id),
      ]);

      setCreator((creatorData as CreatorInfo) || null);
      setComments((commentData || []) as Comment[]);
      setLikesCount(likeRows?.length || 0);

      if (user) {
        const [{ data: myLike }, { data: myFavorite }, { data: myFollow }] = await Promise.all([
          supabase.from('likes').select('post_id').eq('user_id', user.id).eq('post_id', id).maybeSingle(),
          supabase.from('favorites').select('post_id').eq('user_id', user.id).eq('post_id', id).maybeSingle(),
          supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id)
            .eq('following_id', (detail as PostDetail).creator_id)
            .maybeSingle(),
        ]);
        setIsLiked(Boolean(myLike));
        setIsFavorited(Boolean(myFavorite));
        setIsFollowing(Boolean(myFollow));
      } else {
        setIsLiked(false);
        setIsFavorited(false);
        setIsFollowing(false);
      }

      setLoading(false);
    }

    void load();
  }, [id, user]);

  const handleLike = async () => {
    if (!requireAuth(user, navigate, 'Regístrate para dar Me gusta.') || !post) return;

    if (isLiked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('post_id', post.id);
      setIsLiked(false);
      setLikesCount((count) => Math.max(0, count - 1));
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: post.id });
      setIsLiked(true);
      setLikesCount((count) => count + 1);
    }
  };

  const handleFavorite = async () => {
    if (!requireAuth(user, navigate, 'Regístrate para guardar historias en favoritos.') || !post) return;

    if (isFavorited) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('post_id', post.id);
      setIsFavorited(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, post_id: post.id });
      setIsFavorited(true);
    }
  };

  const handleFollow = async () => {
    if (!requireAuth(user, navigate, 'Regístrate para seguir a este narrador.') || !post) return;
    if (user.id === post.creator_id) return;

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', post.creator_id);
      setIsFollowing(false);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: post.creator_id });
      setIsFollowing(true);
    }
  };

  const handleComment = async () => {
    if (!requireAuth(user, navigate, 'Regístrate para comentar.') || !post) return;
    const content = commentValue.trim();
    if (!content) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: user.id, content })
      .select('id, content, created_at, user_id')
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data]);
      setCommentValue('');
    }
  };

  const handleSubscribe = () => {
    if (!requireAuth(user, navigate, 'Regístrate o inicia sesión para suscribirte.') || !post) return;
    navigate(`/checkout?creator=${post.creator_id}`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-deep-navy">Historia no encontrada</h1>
        <Link to="/historias" className="mt-4 inline-block font-bold text-heritage-gold hover:underline">
          Volver a explorar
        </Link>
      </div>
    );
  }

  const Icon = mediaIcon[post.media_type] || FileText;
  const creatorName = creator?.display_name || 'Narrador PastFinder';
  const creatorAvatar =
    creator?.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=0F172A&color=D4AF37`;
  const isMine = user?.id === post.creator_id;
  const isPremium = post.is_ppv || post.is_sub_only;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-32 md:py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link to={`/autor/${post.creator_id}`} className="flex min-w-0 items-center gap-3">
          <img src={creatorAvatar} alt={creatorName} className="h-12 w-12 rounded-full object-cover shadow-sm" />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-deep-navy">{creatorName}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-deep-navy/40">
              {new Date(post.created_at).toLocaleDateString()} {post.category ? `- ${post.category}` : ''}
            </p>
          </div>
        </Link>

        {!isMine && (
          <button
            onClick={() => void handleFollow()}
            className={cn(
              'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold transition-all',
              isFollowing ? 'bg-surface-subtle text-deep-navy/65' : 'bg-deep-navy text-cream',
            )}
          >
            {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
            {isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-bold uppercase tracking-widest text-deep-navy/65">
          <Icon size={13} />
          {post.category || 'Relato'}
        </span>
        {isPremium && (
          <span className="inline-flex items-center gap-1 rounded-full bg-heritage-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-deep-navy">
            <Crown size={13} />
            Premium
          </span>
        )}
      </div>

      <h1 className="mb-3 text-3xl font-bold leading-tight text-deep-navy md:text-4xl">{post.title}</h1>
      {post.description && <p className="mb-5 text-deep-navy/70">{post.description}</p>}

      {post.has_access ? (
        <>
          {post.full_text_content && (
            <div className="mb-5 rounded-xl bg-cream/60 p-5 text-lg leading-8 text-deep-navy/80 whitespace-pre-wrap">
              {post.full_text_content}
            </div>
          )}
          {post.media_type === 'audio' && post.media_url && (
            <AudioPlayer audioUrl={post.media_url} isPpv={false} hasAccess />
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
        </>
      ) : (
        <>
          {post.preview_text && (
            <div className="mb-2 rounded-t-xl bg-cream/60 p-5 text-lg leading-8 text-deep-navy/80 whitespace-pre-wrap">
              {post.preview_text}…
            </div>
          )}
          <div className="mb-5 rounded-b-xl border-t border-heritage-gold/30 bg-deep-navy p-8 text-center text-cream">
            <Lock className="mx-auto mb-3 text-heritage-gold" size={32} />
            <h2 className="mb-2 text-2xl font-bold">Este contenido es exclusivo para miembros Premium</h2>
            <p className="mb-6 text-cream/70">
              Suscríbete a {creatorName} para leer la historia completa.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={handleSubscribe}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-6 font-bold text-deep-navy"
              >
                <Crown size={18} />
                Registrarme
              </button>
              <Link
                to="/planes"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cream/10 px-6 font-bold text-cream"
              >
                Conocer planes
              </Link>
            </div>
          </div>
        </>
      )}

      <div className="my-6 flex items-center justify-between border-y border-deep-navy/10 py-4">
        <div className="flex gap-5">
          <button
            onClick={() => void handleLike()}
            className={cn(
              'inline-flex items-center gap-2 font-bold transition-all',
              isLiked ? 'text-red-500' : 'text-deep-navy/45 hover:text-red-500',
            )}
          >
            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
            {likesCount}
          </button>
          <span className="inline-flex items-center gap-2 font-bold text-deep-navy/45">
            <MessageSquare size={22} />
            {comments.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {!isMine && (
            <button
              onClick={handleSubscribe}
              className="inline-flex items-center gap-2 text-sm font-bold text-deep-navy/55 transition-colors hover:text-heritage-gold"
            >
              <Crown size={20} />
              Suscribirme
            </button>
          )}
          <button
            onClick={() => void handleFavorite()}
            className={cn(
              'inline-flex items-center gap-2 font-bold transition-all',
              isFavorited ? 'text-heritage-gold' : 'text-deep-navy/45 hover:text-heritage-gold',
            )}
            aria-label="Guardar en favoritos"
          >
            <Heart size={22} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-deep-navy">Comentarios</h2>
        <div className="space-y-3">
          {comments.length ? (
            comments.map((comment) => (
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
            onChange={(event) => setCommentValue(event.target.value)}
            placeholder="Escribe un comentario"
            className="min-h-12 w-full rounded-xl bg-surface-subtle py-3 pl-4 pr-12 text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleComment();
            }}
          />
          <button
            onClick={() => void handleComment()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-heritage-gold transition-colors hover:text-deep-navy"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
