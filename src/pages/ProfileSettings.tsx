import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Save } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

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

const defaultBio = 'Creador 60+ compartiendo relatos, memorias y videos cortos en PastFinder.';

export function ProfileSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('0');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState('Agrega ciudad o usa ubicacion aproximada.');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from('creators').select('*').eq('user_id', user.id).maybeSingle();
      const creatorData = (data as CreatorProfile | null) || null;
      setCreator(creatorData);
      setDisplayName(creatorData?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || '');
      setBio(creatorData?.bio || defaultBio);
      setCity(creatorData?.location_city || '');
      setCountry(creatorData?.location_country || '');
      setMonthlyPrice(String(creatorData?.monthly_price ?? 0));
      setLatitude(creatorData?.latitude ?? null);
      setLongitude(creatorData?.longitude ?? null);
      setLoading(false);
    }

    void load();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
      </div>
    );
  }

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : creator?.profile_image_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=0F172A&color=D4AF37&size=150`;
  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : creator?.cover_image_url || '';

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

  const handleSave = async () => {
    setSaving(true);

    try {
      let profileImageUrl = creator?.profile_image_url || null;
      let coverImageUrl = creator?.cover_image_url || null;

      if (avatarFile) profileImageUrl = await uploadProfileAsset(user.id, avatarFile, 'avatar');
      if (coverFile) coverImageUrl = await uploadProfileAsset(user.id, coverFile, 'cover');

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

      const { error } = await supabase.from('creators').upsert(updatedProfile).select('*').single();
      if (error) throw error;

      await supabase.auth.updateUser({
        data: { display_name: updatedProfile.display_name, avatar_url: updatedProfile.profile_image_url },
      });

      notifications.show({ title: 'Perfil guardado', message: 'Tus cambios se han guardado exitosamente.', color: 'green' });
      navigate('/perfil');
    } catch (error) {
      notifications.show({ title: 'Error', message: error instanceof Error ? error.message : 'No se pudo guardar el perfil.', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-32 md:py-10">
      <p className="text-sm font-bold uppercase tracking-widest text-heritage-gold">Configuracion</p>
      <h1 className="mb-6 text-3xl font-bold text-deep-navy md:text-4xl">Editar perfil</h1>

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
          Precio Suscripción Mensual (CLP)
          <input
            type="number"
            min="0"
            step="100"
            value={monthlyPrice}
            onChange={(event) => setMonthlyPrice(event.target.value)}
            placeholder="0"
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
