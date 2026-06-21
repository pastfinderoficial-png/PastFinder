import { useEffect, useMemo, useState } from 'react';
import {
  Settings,
  Mic,
  FileText,
  PlayCircle,
  PlusCircle,
  Crown,
  Users,
  Heart,
  Camera,
  Save,
  X,
  MapPin,
  Wallet,
  DollarSign,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { AudioPlayer } from '../components/AudioPlayer';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

type ProfileTab = 'audios' | 'textos' | 'videos';

type CreatorProfile = {
  user_id: string;
  display_name?: string | null;
  bio?: string | null;
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  monthly_price?: number | string | null;
  location_city?: string | null;
  location_country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ProfilePost = {
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

const defaultBio = 'Creador 60+ compartiendo relatos, memorias y videos cortos en PastFinder.';

export function Profile() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('textos');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [earnings, setEarnings] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    async function getProfileAndPosts() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (user) {
        setCurrentUser(user);

        const [{ data: creatorData }, { data: postData }, { data: earningsData }] = await Promise.all([
          supabase.from('creators').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('posts').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }),
          supabase.from('earnings').select('net_amount').eq('creator_id', user.id).eq('status', 'available'),
        ]);

        setCreator((creatorData as CreatorProfile | null) || null);
        setPosts((postData || []) as ProfilePost[]);
        
        const totalEarnings = earningsData?.reduce((acc, curr) => acc + Number(curr.net_amount), 0) || 0;
        setEarnings(totalEarnings);
      }

      setLoading(false);
    }

    void getProfileAndPosts();
  }, []);

  const stats = useMemo(() => {
    return {
      textos: posts.filter((post) => post.media_type === 'photo' || post.text_content).length,
      audios: posts.filter((post) => post.media_type === 'audio').length,
      videos: posts.filter((post) => post.media_type === 'video').length,
      premium: posts.filter((post) => post.is_ppv || post.is_sub_only).length,
    };
  }, [posts]);

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
    latitude: creator?.latitude ?? null,
    longitude: creator?.longitude ?? null,
    monthly_price: creator?.monthly_price ?? 0,
  };

  const visiblePosts = posts.filter((post) => {
    if (activeTab === 'textos') return post.media_type === 'photo' || Boolean(post.text_content);
    if (activeTab === 'audios') return post.media_type === 'audio';
    return post.media_type === 'video';
  });

  const handleProfileSaved = (updatedProfile: CreatorProfile) => {
    setCreator(updatedProfile);
    setEditing(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 overflow-hidden rounded-2xl bg-surface-elevated shadow-sm">
        <div
          className="relative min-h-64 bg-deep-navy px-6 py-8 text-cream md:px-8"
          style={
            profile.cover
              ? { backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.92), rgba(15,23,42,.56)), url(${profile.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        >
          <button
            onClick={() => setEditing(true)}
            className="absolute right-5 top-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-cream/10 px-4 text-sm font-bold text-cream/80 transition-colors hover:text-cream"
          >
            <Settings size={18} />
            Editar perfil
          </button>

          <div className="flex min-h-48 flex-col justify-end gap-5 pt-16 md:flex-row md:items-end md:justify-start">
            <div className="relative">
              <img src={profile.avatar} alt="Tu foto de perfil" className="h-36 w-36 rounded-full border-4 border-cream object-cover shadow-md" />
              <button
                onClick={() => setEditing(true)}
                className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-heritage-gold text-deep-navy shadow-sm"
                aria-label="Cambiar foto"
              >
                <Camera size={18} />
              </button>
            </div>
            <div className="max-w-2xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-heritage-gold">Perfil de creador</p>
              <h1 className="text-4xl font-bold md:text-5xl">{profile.name}</h1>
              <p className="mt-3 text-cream/70">{profile.bio}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-cream px-4 text-sm font-bold text-deep-navy">
                  <Users size={16} />
                  {Number(profile.monthly_price) > 0 ? `Suscripción: S/ ${profile.monthly_price}` : 'Suscripción gratis'}
                </span>
                <button className="inline-flex min-h-10 items-center gap-2 rounded-full bg-heritage-gold px-4 text-sm font-bold text-deep-navy">
                  <Crown size={16} />
                  Vista creador
                </button>
                <button 
                  onClick={() => setShowWallet(true)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-deep-navy px-4 text-sm font-bold text-cream border border-heritage-gold/30 hover:bg-heritage-gold hover:text-deep-navy transition-colors"
                >
                  <Wallet size={16} />
                  Billetera
                </button>
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

      <div className="mb-6 flex rounded-2xl bg-surface-elevated p-2 shadow-sm">
        <TabButton active={activeTab === 'textos'} icon={FileText} label="Relatos" onClick={() => setActiveTab('textos')} />
        <TabButton active={activeTab === 'audios'} icon={Mic} label="Audios" onClick={() => setActiveTab('audios')} />
        <TabButton active={activeTab === 'videos'} icon={PlayCircle} label="Videos" onClick={() => setActiveTab('videos')} />
      </div>

      {loading ? (
        <div className="rounded-2xl bg-surface-elevated p-12 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
          <p className="mt-4 text-deep-navy/55">Cargando tus publicaciones...</p>
        </div>
      ) : visiblePosts.length === 0 ? (
        <EmptyState type={activeTab} onAction={() => navigate('/studio')} />
      ) : (
        <div className="grid gap-5">
          {visiblePosts.map((post) => (
            <ProfilePostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {editing && currentUser && (
        <EditProfileModal
          user={currentUser}
          profile={profile}
          creator={creator}
          onClose={() => setEditing(false)}
          onSaved={handleProfileSaved}
        />
      )}

      {showWallet && currentUser && (
        <WalletModal 
          user={currentUser} 
          earnings={earnings} 
          onClose={() => setShowWallet(false)} 
        />
      )}
    </div>
  );
}

function WalletModal({
  user,
  earnings,
  onClose,
}: {
  user: User;
  earnings: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(String(earnings));
  const [payoutMethod, setPayoutMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async () => {
    if (Number(amount) <= 0 || Number(amount) > earnings) {
      notifications.show({ title: 'Error', message: 'Monto inválido. No puede ser mayor a tus ganancias disponibles.', color: 'red' });
      return;
    }
    if (!payoutMethod.trim()) {
      notifications.show({ title: 'Error', message: 'Por favor indica un método de pago (ej. número de cuenta o correo de Mercado Pago).', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('withdrawals').insert({
        creator_id: user.id,
        amount: Number(amount),
        payout_method: payoutMethod.trim(),
        status: 'pending',
      });

      if (error) throw error;
      notifications.show({ title: 'Solicitud enviada', message: 'Solicitud de retiro enviada. El administrador procesará tu pago.', color: 'green' });
      onClose();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Error al enviar la solicitud: ' + (error instanceof Error ? error.message : 'Desconocido'), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-deep-navy/80 p-4">
      <div className="w-full max-w-md rounded-3xl bg-cream p-8 shadow-xl relative">
        <button onClick={onClose} className="absolute right-6 top-6 text-deep-navy/50 hover:text-deep-navy">
          <X size={20} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-heritage-gold text-deep-navy">
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-deep-navy">Tu Billetera</h2>
            <p className="text-sm font-bold text-heritage-gold">Ganancias Disponibles</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-surface-subtle p-6 text-center">
          <span className="text-5xl font-bold text-deep-navy">S/ {earnings.toFixed(2)}</span>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Monto a Retirar
            <input
              type="number"
              max={earnings}
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>
          <label className="block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Cuenta Bancaria o Correo
            <textarea
              rows={2}
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value)}
              placeholder="Ej: BCP: 123-456-789 a nombre de Juan Perez"
              className="mt-2 w-full resize-none rounded-xl bg-surface-subtle p-4 text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>
          <button
            onClick={handleRequest}
            disabled={submitting || earnings <= 0}
            className="mt-4 flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-deep-navy font-bold text-cream hover:bg-deep-navy/90 disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Solicitar Retiro'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditProfileModal({
  user,
  profile,
  creator,
  onClose,
  onSaved,
}: {
  user: User;
  profile: {
    name: string;
    bio: string;
    avatar: string;
    cover: string;
    city: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    monthly_price: number | string;
  };
  creator: CreatorProfile | null;
  onClose: () => void;
  onSaved: (profile: CreatorProfile) => void;
}) {
  const [displayName, setDisplayName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [city, setCity] = useState(profile.city);
  const [country, setCountry] = useState(profile.country);
  const [monthlyPrice, setMonthlyPrice] = useState(String(profile.monthly_price));
  const [latitude, setLatitude] = useState<number | null>(profile.latitude);
  const [longitude, setLongitude] = useState<number | null>(profile.longitude);
  const [locationStatus, setLocationStatus] = useState('Agrega ciudad o usa ubicacion aproximada.');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar;
  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : profile.cover;

  const handleSave = async () => {
    setSaving(true);

    try {
      let profileImageUrl = creator?.profile_image_url || null;
      let coverImageUrl = creator?.cover_image_url || null;

      if (avatarFile) {
        profileImageUrl = await uploadProfileAsset(user.id, avatarFile, 'avatar');
      }

      if (coverFile) {
        coverImageUrl = await uploadProfileAsset(user.id, coverFile, 'cover');
      }

      const updatedProfile: CreatorProfile = {
        user_id: user.id,
        display_name: displayName.trim() || user.email?.split('@')[0] || 'Creador',
        bio: bio.trim() || defaultBio,
        monthly_price: Number(monthlyPrice) || 0,
        profile_image_url: profileImageUrl,
        cover_image_url: coverImageUrl,
        location_city: city.trim() || null,
        location_country: country.trim() || null,
        latitude,
        longitude,
      };

      const { data, error } = await supabase.from('creators').upsert(updatedProfile).select('*').single();
      if (error) throw error;

      await supabase.auth.updateUser({
        data: {
          display_name: updatedProfile.display_name,
          avatar_url: updatedProfile.profile_image_url,
        },
      });

      notifications.show({ title: 'Perfil guardado', message: 'Tus cambios se han guardado exitosamente.', color: 'green' });
      onSaved((data as CreatorProfile) || updatedProfile);
    } catch (error) {
      notifications.show({ title: 'Error', message: error instanceof Error ? error.message : 'No se pudo guardar el perfil.', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Tu navegador no permite geolocalizacion.');
      return;
    }

    setLocationStatus('Solicitando ubicacion...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationStatus('Ubicacion guardada para recomendarte cerca de otros usuarios.');
      },
      () => setLocationStatus('No pudimos acceder a la ubicacion. Puedes escribir ciudad y pais.'),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-deep-navy/55 p-0 backdrop-blur-sm md:items-center md:justify-center md:p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-cream p-5 shadow-xl md:rounded-2xl md:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-heritage-gold">Configuracion</p>
            <h2 className="text-3xl font-bold text-deep-navy">Editar perfil</h2>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle text-deep-navy">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl bg-surface-elevated shadow-sm">
          <div
            className="flex min-h-40 items-end bg-deep-navy p-4"
            style={
              coverPreview
                ? { backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.85), rgba(15,23,42,.28)), url(${coverPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : undefined
            }
          >
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-cream px-4 text-sm font-bold text-deep-navy">
              <Camera size={16} />
              Cambiar portada
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="-mt-12 flex items-end gap-4 p-4">
            <img src={avatarPreview} alt="Vista previa de perfil" className="h-28 w-28 rounded-full border-4 border-cream object-cover shadow-md" />
            <label className="mb-2 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-deep-navy px-4 text-sm font-bold text-cream">
              <Camera size={16} />
              Cambiar foto
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Nombre publico
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>
          <label className="text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Precio Suscripción (Mensual)
            <input
              type="number"
              min="0"
              step="0.01"
              value={monthlyPrice}
              onChange={(event) => setMonthlyPrice(event.target.value)}
              placeholder="0.00"
              className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
          Biografia
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-xl bg-surface-subtle p-4 text-base font-normal normal-case leading-7 tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
          />
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Ciudad
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Ej: Santiago"
              className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>
          <label className="text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Pais
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="Ej: Chile"
              className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl bg-surface-subtle p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-deep-navy/60">{locationStatus}</p>
            <button
              onClick={handleUseLocation}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-heritage-gold px-4 text-sm font-bold text-deep-navy"
            >
              <MapPin size={17} />
              Usar ubicacion
            </button>
          </div>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-deep-navy px-6 font-bold text-cream disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

async function uploadProfileAsset(userId: string, file: File, kind: 'avatar' | 'cover') {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/profile-${kind}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from('media').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) throw error;

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

function ProfilePostCard({ post }: { post: ProfilePost }) {
  return (
    <article className="rounded-2xl bg-surface-elevated p-5 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {post.category && <Badge label={post.category} />}
            {post.is_sub_only && <Badge label="Miembros gratis" />}
            {post.is_ppv && <Badge label="Miembros gratis" />}
          </div>
          <h2 className="text-2xl font-bold text-deep-navy">{post.title}</h2>
          <p className="mt-1 text-sm text-deep-navy/50">{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-4 text-sm font-bold text-deep-navy/50">
          <span className="inline-flex items-center gap-1">
            <Users size={16} />
            0
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={16} />
            0
          </span>
        </div>
      </div>

      {post.description && <p className="mb-4 text-deep-navy/70">{post.description}</p>}

      {post.text_content && (
        <div className="rounded-xl bg-cream/60 p-5 leading-8 text-deep-navy/80 whitespace-pre-wrap">{post.text_content}</div>
      )}

      {post.media_type === 'audio' && post.media_url && <AudioPlayer audioUrl={post.media_url} isPpv={false} hasAccess />}

      {post.media_type === 'video' && post.media_url && (
        <video className="aspect-video w-full rounded-xl bg-deep-navy object-cover" src={post.media_url} controls playsInline preload="metadata" />
      )}
    </article>
  );
}

function EmptyState({ type, onAction }: { type: ProfileTab; onAction: () => void }) {
  const copy = {
    textos: ['relatos', 'Escribe tu primera memoria para la comunidad.'],
    audios: ['audios', 'Graba tu voz contando una historia.'],
    videos: ['videos', 'Sube un clip corto para tus seguidores.'],
  };

  return (
    <div className="rounded-2xl bg-surface-elevated p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-subtle text-deep-navy/40">
        <PlusCircle size={32} />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-deep-navy">Aun no tienes {copy[type][0]}</h2>
      <p className="mb-6 text-deep-navy/60">{copy[type][1]}</p>
      <button onClick={onAction} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-deep-navy px-6 font-bold text-cream">
        <PlusCircle size={20} />
        Crear ahora
      </button>
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
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

function ProfileMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-subtle p-4">
      <Icon className="mb-3 text-heritage-gold" size={22} />
      <span className="block text-2xl font-bold text-deep-navy">{value}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-deep-navy/55">{label}</span>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-surface-subtle px-3 py-1 text-xs font-bold uppercase tracking-widest text-deep-navy/60">{label}</span>;
}
