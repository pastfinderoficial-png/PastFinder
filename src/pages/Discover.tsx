import { useEffect, useMemo, useState } from 'react';
import { Compass, FileText, MapPin, Mic, Search, Sparkles, Video } from 'lucide-react';
import { supabase } from '../services/supabase';
import { cn } from '../utils';

type DiscoverPost = {
  id: string;
  title: string;
  description?: string | null;
  media_type: 'audio' | 'photo' | 'video';
  category?: string | null;
  is_sub_only?: boolean;
  created_at: string;
  creators?: {
    display_name?: string | null;
    profile_image_url?: string | null;
    location_city?: string | null;
    location_country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    users?: { email?: string | null } | null;
  } | null;
};

type LocationPoint = {
  latitude: number;
  longitude: number;
};

const contentTypes = [
  { id: 'all', label: 'Todo', icon: Sparkles },
  { id: 'photo', label: 'Relatos', icon: FileText },
  { id: 'audio', label: 'Audios', icon: Mic },
  { id: 'video', label: 'Videos', icon: Video },
];

export function Discover() {
  const [posts, setPosts] = useState<DiscoverPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [memberOnly, setMemberOnly] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [radiusKm, setRadiusKm] = useState(100);
  const [userLocation, setUserLocation] = useState<LocationPoint | null>(null);
  const [locationMessage, setLocationMessage] = useState('Activa tu ubicacion para recomendaciones cercanas.');

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          media_type,
          category,
          is_sub_only,
          created_at,
          creators (
            display_name,
            profile_image_url,
            location_city,
            location_country,
            latitude,
            longitude,
            users ( email )
          )
        `)
        .order('created_at', { ascending: false });

      setPosts((data || []) as DiscoverPost[]);
      setLoading(false);
    }

    void fetchPosts();
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(posts.map((post) => post.category).filter(Boolean) as string[]));
  }, [posts]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(posts.map((post) => post.creators?.location_city).filter(Boolean) as string[]),
    );
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedCity = cityFilter.trim().toLowerCase();

    return posts
      .map((post) => ({ post, distance: distanceFromUser(userLocation, post) }))
      .filter(({ post, distance }) => {
        const creatorName = getCreatorName(post);
        const searchable = [post.title, post.description, post.category, creatorName, post.creators?.location_city]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        const matchesType = typeFilter === 'all' || post.media_type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
        const matchesMembers = !memberOnly || Boolean(post.is_sub_only);
        const matchesCity = !normalizedCity || post.creators?.location_city?.toLowerCase().includes(normalizedCity);
        const matchesRadius = !userLocation || distance === null || distance <= radiusKm;

        return matchesQuery && matchesType && matchesCategory && matchesMembers && matchesCity && matchesRadius;
      })
      .sort((a, b) => {
        if (userLocation) return (a.distance ?? Number.MAX_SAFE_INTEGER) - (b.distance ?? Number.MAX_SAFE_INTEGER);
        return new Date(b.post.created_at).getTime() - new Date(a.post.created_at).getTime();
      });
  }, [categoryFilter, cityFilter, memberOnly, posts, query, radiusKm, typeFilter, userLocation]);

  const nearbyRecommendations = filteredPosts.slice(0, 4);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Tu navegador no permite geolocalizacion.');
      return;
    }

    setLocationMessage('Solicitando ubicacion...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationMessage('Recomendaciones ordenadas por cercania.');
      },
      () => setLocationMessage('No pudimos acceder a tu ubicacion. Puedes filtrar por ciudad.'),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-6 rounded-2xl bg-deep-navy p-6 text-cream shadow-sm md:p-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-heritage-gold">
          <Compass size={14} />
          Filtros inteligentes
        </p>
        <h1 className="mb-3 text-4xl font-bold md:text-5xl">Encuentra relatos por tema, formato y cercania.</h1>
        <p className="max-w-3xl text-lg leading-7 text-cream/70">
          Combina busqueda, ciudad, categoria y ubicacion para descubrir creadores cercanos o historias parecidas a lo que quieres leer.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl bg-surface-elevated p-4 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-deep-navy">Filtros</h2>

            <label className="mb-4 block text-sm font-bold uppercase tracking-widest text-deep-navy/55">
              Buscar
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-navy/35" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tema, creador, ciudad"
                  className="min-h-12 w-full rounded-xl bg-surface-subtle py-3 pl-10 pr-3 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
                />
              </div>
            </label>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {contentTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTypeFilter(item.id)}
                    className={cn(
                      'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold',
                      typeFilter === item.id ? 'bg-deep-navy text-cream' : 'bg-surface-subtle text-deep-navy/65',
                    )}
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <label className="mb-4 block text-sm font-bold uppercase tracking-widest text-deep-navy/55">
              Categoria
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-3 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="mb-4 block text-sm font-bold uppercase tracking-widest text-deep-navy/55">
              Ciudad
              <input
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                list="cities"
                placeholder="Ej: Santiago"
                className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-3 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
              />
              <datalist id="cities">
                {cities.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </label>

            <label className="mb-4 flex min-h-12 items-center justify-between rounded-xl bg-surface-subtle px-3 font-bold text-deep-navy">
              Solo miembros gratis
              <input type="checkbox" checked={memberOnly} onChange={(event) => setMemberOnly(event.target.checked)} />
            </label>

            <label className="block text-sm font-bold uppercase tracking-widest text-deep-navy/55">
              Radio cercano: {radiusKm} km
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={radiusKm}
                onChange={(event) => setRadiusKm(Number(event.target.value))}
                className="mt-3 w-full"
              />
            </label>
          </div>

          <div className="rounded-2xl bg-heritage-gold p-4 text-deep-navy shadow-sm">
            <MapPin className="mb-3" size={28} />
            <h2 className="mb-2 text-2xl font-bold">Recomendaciones por ubicacion</h2>
            <p className="mb-4 text-sm leading-6">{locationMessage}</p>
            <button
              onClick={requestLocation}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-deep-navy px-4 font-bold text-cream"
            >
              <MapPin size={18} />
              Usar mi ubicacion
            </button>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-2xl bg-surface-elevated p-5 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-deep-navy">Recomendados para ti</h2>
            {loading ? (
              <div className="h-32 animate-pulse rounded-xl bg-surface-subtle" />
            ) : nearbyRecommendations.length === 0 ? (
              <p className="text-deep-navy/60">No hay resultados con esos filtros todavia.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {nearbyRecommendations.map(({ post, distance }) => (
                  <RecommendationCard key={post.id} post={post} distance={distance} />
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3">
            {filteredPosts.map(({ post, distance }) => (
              <ResultRow key={post.id} post={post} distance={distance} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function RecommendationCard({ post, distance }: { post: DiscoverPost; distance: number | null }) {
  return (
    <article className="rounded-xl bg-surface-subtle p-4">
      <div className="mb-3 flex items-center gap-3">
        <img src={getAvatar(post)} alt={getCreatorName(post)} className="h-10 w-10 rounded-full object-cover" />
        <div className="min-w-0">
          <h3 className="truncate font-bold text-deep-navy">{getCreatorName(post)}</h3>
          <p className="text-xs text-deep-navy/50">{formatLocation(post, distance)}</p>
        </div>
      </div>
      <p className="mb-2 text-lg font-bold text-deep-navy">{post.title}</p>
      <Badge label={post.category || post.media_type} />
    </article>
  );
}

function ResultRow({ post, distance }: { post: DiscoverPost; distance: number | null }) {
  const Icon = post.media_type === 'audio' ? Mic : post.media_type === 'video' ? Video : FileText;

  return (
    <article className="flex items-start gap-4 rounded-2xl bg-surface-elevated p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-deep-navy">
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge label={post.category || 'Sin categoria'} />
          {post.is_sub_only && <Badge label="Miembros gratis" />}
        </div>
        <h3 className="text-xl font-bold text-deep-navy">{post.title}</h3>
        <p className="mt-1 text-sm text-deep-navy/60">{post.description || 'Relato compartido por la comunidad.'}</p>
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-deep-navy/55">
          <MapPin size={16} />
          {formatLocation(post, distance)}
        </p>
      </div>
    </article>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold uppercase tracking-widest text-deep-navy/60">{label}</span>;
}

function getCreatorName(post: DiscoverPost) {
  return post.creators?.display_name || post.creators?.users?.email?.split('@')[0] || 'Creador PastFinder';
}

function getAvatar(post: DiscoverPost) {
  const name = getCreatorName(post);
  return post.creators?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=D4AF37`;
}

function formatLocation(post: DiscoverPost, distance: number | null) {
  const city = post.creators?.location_city;
  const country = post.creators?.location_country;
  const place = [city, country].filter(Boolean).join(', ') || 'Ubicacion no indicada';
  return distance === null ? place : `${place} - ${Math.round(distance)} km`;
}

function distanceFromUser(userLocation: LocationPoint | null, post: DiscoverPost) {
  const latitude = post.creators?.latitude;
  const longitude = post.creators?.longitude;

  if (!userLocation || typeof latitude !== 'number' || typeof longitude !== 'number') return null;

  return haversineKm(userLocation.latitude, userLocation.longitude, latitude, longitude);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
