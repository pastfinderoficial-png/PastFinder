import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, FileText, Mic, Video, Heart, Compass, Users, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabase';
import { CATEGORIES } from '../constants/categories';

const categoryIcons: Record<string, typeof FileText> = {
  'Amor y compania': Heart,
  'Memorias de juventud': Sparkles,
  'Consejos de vida': Compass,
  Viajes: Mic,
  Familia: Users,
  'Picardia elegante': Video,
};

export function Categorias() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('posts').select('category');
      const tally: Record<string, number> = {};
      for (const row of data || []) {
        if (row.category) tally[row.category] = (tally[row.category] || 0) + 1;
      }
      setCounts(tally);
      setLoading(false);
    }

    void load();
  }, []);

  const categories = useMemo(() => {
    const known = new Set(CATEGORIES);
    const extra = Object.keys(counts).filter((category) => !known.has(category));
    return [...CATEGORIES, ...extra];
  }, [counts]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 rounded-2xl bg-deep-navy p-6 text-cream shadow-sm md:p-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-heritage-gold">
          <Grid size={14} />
          Categorias
        </p>
        <h1 className="mb-3 text-4xl font-bold md:text-5xl">Explora por tema.</h1>
        <p className="max-w-2xl text-lg leading-7 text-cream/70">
          Encuentra relatos, audios y videos organizados por lo que mas te interesa.
        </p>
      </section>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-surface-elevated" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category] || FileText;
            return (
              <Link
                key={category}
                to={`/historias?categoria=${encodeURIComponent(category)}`}
                className="flex items-center gap-4 rounded-2xl bg-surface-elevated p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-heritage-gold/20 text-heritage-gold">
                  <Icon size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-deep-navy">{category}</h3>
                  <p className="text-sm text-deep-navy/55">{counts[category] || 0} historias</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
