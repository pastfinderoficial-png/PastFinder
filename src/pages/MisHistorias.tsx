import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, PlayCircle, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { AudioPlayer } from '../components/AudioPlayer';
import { ExpandableText } from '../components/ExpandableText';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils';

type Tab = 'audios' | 'textos' | 'videos';

type MyPost = {
  id: string;
  title: string;
  description?: string | null;
  media_type: 'audio' | 'photo' | 'video';
  media_url?: string | null;
  text_content?: string | null;
  category?: string | null;
  is_ppv?: boolean;
  is_sub_only?: boolean;
  created_at: string;
};

export function MisHistorias() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('textos');
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      setPosts((data || []) as MyPost[]);
      setLoading(false);
    }

    void load();
  }, [user]);

  const handleDelete = (postId: string) => {
    modals.openConfirmModal({
      title: 'Eliminar historia',
      centered: true,
      children: 'Esta accion no se puede deshacer. ¿Seguro que quieres eliminar esta historia?',
      labels: { confirm: 'Sí, eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const { error } = await supabase.from('posts').delete().eq('id', postId);

        if (error) {
          notifications.show({
            title: 'Error',
            message: 'No se pudo eliminar la historia: ' + error.message,
            color: 'red',
          });
          return;
        }

        setPosts((prev) => prev.filter((post) => post.id !== postId));
        notifications.show({ title: 'Historia eliminada', message: 'Se elimino correctamente.', color: 'green' });
      },
    });
  };

  const visiblePosts = useMemo(
    () =>
      posts.filter((post) => {
        if (activeTab === 'textos') return post.media_type === 'photo' || Boolean(post.text_content);
        if (activeTab === 'audios') return post.media_type === 'audio';
        return post.media_type === 'video';
      }),
    [activeTab, posts],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-32 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-deep-navy md:text-4xl">Mis historias</h1>
          <p className="mt-1 text-deep-navy/60">Todo lo que has publicado en PastFinder.</p>
        </div>
        <button
          onClick={() => navigate('/studio')}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-deep-navy px-6 font-bold text-cream"
        >
          <PlusCircle size={20} />
          Nueva historia
        </button>
      </div>

      <div className="mb-6 flex rounded-2xl bg-surface-elevated p-2 shadow-sm">
        <TabButton active={activeTab === 'textos'} icon={FileText} label="Relatos" onClick={() => setActiveTab('textos')} />
        <TabButton active={activeTab === 'audios'} icon={Mic} label="Audios" onClick={() => setActiveTab('audios')} />
        <TabButton active={activeTab === 'videos'} icon={PlayCircle} label="Videos" onClick={() => setActiveTab('videos')} />
      </div>

      {loading ? (
        <div className="rounded-2xl bg-surface-elevated p-12 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="rounded-2xl bg-surface-elevated p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-subtle text-deep-navy/40">
            <PlusCircle size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-deep-navy">Aun no tienes historias en esta seccion</h2>
          <button
            onClick={() => navigate('/studio')}
            className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-deep-navy px-6 font-bold text-cream"
          >
            <PlusCircle size={20} />
            Crear ahora
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {visiblePosts.map((post) => (
            <MyPostCard
              key={post.id}
              post={post}
              onEdit={() => navigate(`/studio?edit=${post.id}`)}
              onDelete={() => handleDelete(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MyPostCard({ post, onEdit, onDelete }: { post: MyPost; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="rounded-2xl bg-surface-elevated p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {post.category && <Badge label={post.category} />}
          {(post.is_sub_only || post.is_ppv) && <Badge label="Premium" />}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onEdit}
            aria-label="Editar historia"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-surface-subtle px-4 text-xs font-bold text-deep-navy transition-colors hover:bg-heritage-gold hover:text-deep-navy"
          >
            <Pencil size={15} />
            Editar
          </button>
          <button
            onClick={onDelete}
            aria-label="Eliminar historia"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-red-200 px-4 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-deep-navy">{post.title}</h2>
      <p className="mt-1 text-sm text-deep-navy/50">{new Date(post.created_at).toLocaleDateString()}</p>

      {post.description && <p className="mt-3 text-deep-navy/70">{post.description}</p>}

      {post.text_content && (
        <ExpandableText
          text={post.text_content}
          className="mt-4 rounded-xl bg-cream/60 p-5 leading-8 text-deep-navy/80 whitespace-pre-wrap"
        />
      )}

      {post.media_type === 'audio' && post.media_url && <AudioPlayer audioUrl={post.media_url} isPpv={false} hasAccess />}

      {post.media_type === 'video' && post.media_url && (
        <video className="mt-4 aspect-video w-full rounded-xl bg-deep-navy object-cover" src={post.media_url} controls playsInline preload="metadata" />
      )}
    </article>
  );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl font-bold transition-all',
        active ? 'bg-deep-navy text-cream shadow-sm' : 'text-deep-navy/55 hover:text-deep-navy',
      )}
    >
      <Icon size={20} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-bold uppercase tracking-widest text-deep-navy/60">{label}</span>;
}
