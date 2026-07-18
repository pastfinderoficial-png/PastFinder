import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { StoryCard } from '../components/StoryCard';
import type { StoryCardPost } from '../components/StoryCard';

type FavoriteRow = {
  post_id: string;
  posts: StoryCardPost | null;
};

export function Favoritos() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<StoryCardPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);

      const { data } = await supabase
        .from('favorites')
        .select(
          'post_id, posts ( id, title, description, media_type, category, is_ppv, is_sub_only, created_at, creators ( user_id, display_name, profile_image_url ) )',
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const rows = (data || []) as unknown as FavoriteRow[];
      setPosts(rows.map((row) => row.posts).filter((post): post is StoryCardPost => Boolean(post)));
      setLoading(false);
    }

    void load();
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 rounded-2xl bg-deep-navy p-6 text-cream shadow-sm md:p-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-heritage-gold">
          <Bookmark size={14} />
          Favoritos
        </p>
        <h1 className="mb-2 text-4xl font-bold md:text-5xl">Tus historias guardadas.</h1>
        <p className="max-w-2xl text-cream/70">Encuentra aqui todo lo que has guardado para leer despues.</p>
      </section>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-2xl bg-surface-elevated" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl bg-surface-elevated p-10 text-center shadow-sm">
          <Bookmark className="mx-auto mb-4 text-heritage-gold" size={38} />
          <h2 className="mb-2 text-2xl font-bold text-deep-navy">Aun no tienes favoritos</h2>
          <p className="text-deep-navy/60">Guarda historias mientras exploras para encontrarlas aqui.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <StoryCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
