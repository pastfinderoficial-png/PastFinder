import { useMemo, useState } from 'react';
import { GiantRecordButton } from '../components/GiantRecordButton';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { FileText, Mic, Upload, Video, Users, Globe2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils';

type StudioType = 'audio' | 'text' | 'video';
type AccessType = 'free' | 'subscribers';

const categories = [
  'Amor y compania',
  'Memorias de juventud',
  'Consejos de vida',
  'Viajes',
  'Familia',
  'Picardia elegante',
];

export function Studio() {
  const [activeType, setActiveType] = useState<StudioType>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [accessType, setAccessType] = useState<AccessType>('free');
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const canPublish = useMemo(() => {
    if (!title.trim()) return false;
    if (activeType === 'text') return Boolean(textContent.trim());
    if (activeType === 'audio') return Boolean(recordedBlob);
    return Boolean(videoFile);
  }, [activeType, recordedBlob, textContent, title, videoFile]);

  const handleStart = () => {
    setIsRecording(true);
    setRecordedBlob(null);
    setMessage(null);
  };

  const handleStop = (blob: Blob) => {
    setIsRecording(false);
    setRecordedBlob(blob);
  };

  const handlePublish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canPublish) return;

    setIsPublishing(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error('Debes iniciar sesion para publicar.');

      await ensureCreatorProfile(user.id, user.email || '');

      let mediaUrl = '';
      const mediaType: 'audio' | 'photo' | 'video' = activeType === 'text' ? 'photo' : activeType;

      if (activeType === 'audio' && recordedBlob) {
        mediaUrl = await uploadMedia(user.id, recordedBlob, `audio-${Date.now()}.webm`);
      }

      if (activeType === 'video' && videoFile) {
        if (videoFile.size > 80 * 1024 * 1024) {
          throw new Error('El video debe pesar menos de 80 MB para mantenerlo corto y agil.');
        }
        mediaUrl = await uploadMedia(user.id, videoFile, `video-${Date.now()}-${videoFile.name}`);
      }

      const { error: dbError } = await supabase.from('posts').insert({
        creator_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        media_type: mediaType,
        media_url: mediaUrl || null,
        text_content: activeType === 'text' ? textContent.trim() : null,
        category,
        is_ppv: false,
        is_sub_only: accessType === 'subscribers',
        price: 0,
      });

      if (dbError) throw dbError;

      setMessage('Publicado con exito. Te llevamos a tu perfil...');
      setTitle('');
      setDescription('');
      setTextContent('');
      setRecordedBlob(null);
      setVideoFile(null);

      window.setTimeout(() => navigate('/profile'), 1200);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado al publicar.';
      setMessage(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 rounded-2xl bg-deep-navy p-6 text-cream shadow-sm md:p-8">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-heritage-gold">Estudio 60+</p>
        <h1 className="mb-3 text-4xl font-bold md:text-5xl">Comparte una historia, un texto o un video corto.</h1>
        <p className="max-w-3xl text-lg leading-7 text-cream/70">
          Publica contenido abierto o solo para miembros gratuitos. Mantuvimos los controles
          grandes y claros para que grabar sea simple.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl bg-surface-elevated p-4 shadow-sm">
          <div className="grid gap-2">
            <TypeButton
              active={activeType === 'text'}
              icon={FileText}
              title="Relato escrito"
              description="Una memoria, carta o pensamiento."
              onClick={() => setActiveType('text')}
            />
            <TypeButton
              active={activeType === 'audio'}
              icon={Mic}
              title="Audio"
              description="Graba tu voz desde el navegador."
              onClick={() => setActiveType('audio')}
            />
            <TypeButton
              active={activeType === 'video'}
              icon={Video}
              title="Video corto"
              description="Sube un clip vertical u horizontal."
              onClick={() => setActiveType('video')}
            />
          </div>

          <div className="mt-5 rounded-xl bg-surface-subtle p-4">
            <h2 className="mb-2 text-xl font-bold text-deep-navy">Acceso</h2>
            <div className="grid gap-2">
              <AccessButton active={accessType === 'free'} icon={Globe2} label="Gratis" onClick={() => setAccessType('free')} />
              <AccessButton active={accessType === 'subscribers'} icon={Users} label="Miembros gratis" onClick={() => setAccessType('subscribers')} />
            </div>
          </div>
        </aside>

        <form onSubmit={handlePublish} className="rounded-2xl bg-surface-elevated p-5 shadow-sm md:p-6">
          {message && (
            <div className="mb-5 rounded-xl bg-surface-subtle p-4 text-sm font-semibold text-deep-navy">
              {message}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
              Titulo
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej: Mi primer baile en Valparaiso"
                className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
                required
              />
            </label>

            <label className="block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
              Tema
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Descripcion breve
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Cuenta de que trata antes de entrar al relato."
              rows={3}
              className="mt-2 w-full resize-none rounded-xl bg-surface-subtle p-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>

          {activeType === 'text' && (
            <label className="mt-4 block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
              Relato
              <textarea
                value={textContent}
                onChange={(event) => setTextContent(event.target.value)}
                placeholder="Escribe tu historia con calma..."
                rows={10}
                className="mt-2 w-full resize-y rounded-xl bg-surface-subtle p-4 text-lg font-normal normal-case leading-8 tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
                required
              />
            </label>
          )}

          {activeType === 'audio' && (
            <div className="mt-6 rounded-2xl bg-surface-subtle p-6">
              <GiantRecordButton isRecording={isRecording} onRecordStart={handleStart} onRecordStop={handleStop} />
              {recordedBlob && (
                <p className="mt-4 text-center text-sm font-bold text-deep-navy/60">
                  Audio listo para publicar. Puedes grabar de nuevo si quieres reemplazarlo.
                </p>
              )}
            </div>
          )}

          {activeType === 'video' && (
            <div className="mt-6 rounded-2xl bg-surface-subtle p-6">
              <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl bg-cream p-6 text-center text-deep-navy transition-all hover:shadow-sm">
                <Upload className="mb-3 text-heritage-gold" size={40} />
                <span className="text-xl font-bold">Seleccionar video corto</span>
                <span className="mt-2 max-w-sm text-sm text-deep-navy/60">
                  MP4, WebM o MOV. Recomendado: menos de 80 MB.
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  className="sr-only"
                  onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                />
              </label>

              {videoFile && (
                <div className="mt-4">
                  <p className="mb-3 text-sm font-bold text-deep-navy/60">{videoFile.name}</p>
                  <video className="aspect-video w-full rounded-xl bg-deep-navy object-cover" src={URL.createObjectURL(videoFile)} controls />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!canPublish || isPublishing}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-deep-navy px-8 py-4 text-lg font-bold text-cream transition-all hover:bg-deep-navy/90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isPublishing ? 'Publicando...' : 'Publicar ahora'}
          </button>
        </form>
      </div>
    </div>
  );
}

async function ensureCreatorProfile(userId: string, email: string) {
  await supabase.from('users').upsert({
    id: userId,
    email,
    role: 'creator',
  });

  await supabase.from('creators').upsert({
    user_id: userId,
    bio: 'Creador de PastFinder 60+',
    monthly_price: 0,
    kyc_status: 'pending',
  });

  await supabase.from('fans').upsert({
    user_id: userId,
    display_name: email.split('@')[0] || 'Miembro',
  });
}

async function uploadMedia(userId: string, file: Blob, fileName: string) {
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${userId}/${cleanName}`;
  const { error } = await supabase.storage.from('media').upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    if (error.message.toLowerCase().includes('bucket')) {
      throw new Error('Falta crear el bucket publico "media" en Supabase Storage.');
    }
    throw error;
  }

  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

function TypeButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-20 items-center gap-3 rounded-xl p-3 text-left transition-all',
        active ? 'bg-deep-navy text-cream shadow-sm' : 'bg-surface-subtle text-deep-navy hover:bg-cream',
      )}
    >
      <span className={cn('rounded-xl p-3', active ? 'bg-cream/10 text-heritage-gold' : 'bg-cream text-deep-navy/65')}>
        <Icon size={22} />
      </span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className={cn('text-sm', active ? 'text-cream/65' : 'text-deep-navy/55')}>{description}</span>
      </span>
    </button>
  );
}

function AccessButton({
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
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-all',
        active ? 'bg-deep-navy text-cream' : 'bg-cream text-deep-navy/65 hover:text-deep-navy',
      )}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}
