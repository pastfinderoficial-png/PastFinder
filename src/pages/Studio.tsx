import { useEffect, useMemo, useState } from 'react';
import { GiantRecordButton } from '../components/GiantRecordButton';
import { AudioPlayer } from '../components/AudioPlayer';
import { supabase } from '../services/supabase';
import { ensureCreatorProfile } from '../services/profile';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Mic, Upload, Video, Crown, Globe2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils';
import { CATEGORIES as categories } from '../constants/categories';

type StudioType = 'audio' | 'text' | 'video';
type AccessType = 'free' | 'subscribers';

export function Studio() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [activeType, setActiveType] = useState<StudioType>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [accessType, setAccessType] = useState<AccessType>('free');
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(editId));
  const [notOwner, setNotOwner] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadForEdit() {
      if (!editId || !user) return;
      setLoadingExisting(true);

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', editId)
        .eq('creator_id', user.id)
        .maybeSingle();

      if (error || !data) {
        setNotOwner(true);
        setLoadingExisting(false);
        return;
      }

      setTitle(data.title || '');
      setDescription(data.description || '');
      setTextContent(data.text_content || '');
      setAccessType(data.is_sub_only ? 'subscribers' : 'free');
      setActiveType(data.media_type === 'photo' ? 'text' : (data.media_type as StudioType));
      setExistingMediaUrl(data.media_url || null);

      if (data.category && !categories.includes(data.category)) {
        setIsCustomCategory(true);
        setCustomCategory(data.category);
      } else {
        setCategory(data.category || categories[0]);
      }

      setLoadingExisting(false);
    }

    void loadForEdit();
  }, [editId, user]);

  const canPublish = useMemo(() => {
    if (!title.trim()) return false;
    if (activeType === 'text') return Boolean(textContent.trim());
    if (activeType === 'audio') return Boolean(recordedBlob) || Boolean(existingMediaUrl);
    return Boolean(videoFile) || Boolean(existingMediaUrl);
  }, [activeType, existingMediaUrl, recordedBlob, textContent, title, videoFile]);

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
      if (!user) throw new Error('Debes iniciar sesion para publicar.');

      await ensureCreatorProfile(user.id, user.email || '');

      let mediaUrl = existingMediaUrl || '';
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

      const payload = {
        creator_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        media_type: mediaType,
        media_url: mediaUrl || null,
        text_content: activeType === 'text' ? textContent.trim() : null,
        category: (isCustomCategory ? customCategory.trim() : category) || categories[0],
        is_sub_only: accessType === 'subscribers',
      };

      const { error: dbError } = editId
        ? await supabase.from('posts').update(payload).eq('id', editId).eq('creator_id', user.id)
        : await supabase.from('posts').insert({ ...payload, is_ppv: false, price: 0 });

      if (dbError) throw dbError;

      setMessage(editId ? 'Cambios guardados. Te llevamos a tus historias...' : 'Publicado con exito. Te llevamos a tus historias...');

      if (!editId) {
        setTitle('');
        setDescription('');
        setTextContent('');
        setRecordedBlob(null);
        setVideoFile(null);
        setIsCustomCategory(false);
        setCustomCategory('');
      }

      window.setTimeout(() => navigate('/mis-historias'), 1200);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado al publicar.';
      setMessage(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  if (editId && loadingExisting) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
      </div>
    );
  }

  if (editId && notOwner) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-deep-navy">No puedes editar esta historia</h1>
        <p className="mt-2 text-deep-navy/60">No existe o no te pertenece.</p>
        <button
          onClick={() => navigate('/mis-historias')}
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-deep-navy px-6 font-bold text-cream"
        >
          Volver a mis historias
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:py-10">
      <section className="mb-8 rounded-2xl bg-deep-navy p-6 text-cream shadow-sm md:p-8">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-heritage-gold">Estudio 60+</p>
        <h1 className="mb-3 text-4xl font-bold md:text-5xl">
          {editId ? 'Edita tu historia.' : 'Comparte una historia, un texto o un video corto.'}
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-cream/70">
          {editId
            ? 'Actualiza el titulo, la descripcion, el tema o el acceso de tu historia.'
            : 'Publica contenido abierto a todos o exclusivo para tus suscriptores premium. Mantuvimos los controles grandes y claros para que grabar sea simple.'}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl bg-surface-elevated p-4 shadow-sm">
          {editId && (
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-deep-navy/45">
              El tipo de contenido no se puede cambiar al editar.
            </p>
          )}
          <div className="grid gap-2">
            <TypeButton
              active={activeType === 'text'}
              disabled={Boolean(editId)}
              icon={FileText}
              title="Relato escrito"
              description="Una memoria, carta o pensamiento."
              onClick={() => setActiveType('text')}
            />
            <TypeButton
              active={activeType === 'audio'}
              disabled={Boolean(editId)}
              icon={Mic}
              title="Audio"
              description="Graba tu voz desde el navegador."
              onClick={() => setActiveType('audio')}
            />
            <TypeButton
              active={activeType === 'video'}
              disabled={Boolean(editId)}
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
              <AccessButton active={accessType === 'subscribers'} icon={Crown} label="Premium (solo suscriptores)" onClick={() => setAccessType('subscribers')} />
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
                value={isCustomCategory ? '__custom__' : category}
                onChange={(event) => {
                  if (event.target.value === '__custom__') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategory(event.target.value);
                  }
                }}
                className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="__custom__">Otro (escribir el mío)</option>
              </select>
              {isCustomCategory && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  placeholder="Escribe tu propio tema"
                  className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-base font-normal normal-case tracking-normal text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
                />
              )}
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
              {existingMediaUrl && !recordedBlob && (
                <div className="mb-4">
                  <p className="mb-2 text-sm font-bold text-deep-navy/60">Audio actual:</p>
                  <AudioPlayer audioUrl={existingMediaUrl} isPpv={false} hasAccess />
                </div>
              )}
              <GiantRecordButton isRecording={isRecording} onRecordStart={handleStart} onRecordStop={handleStop} />
              {recordedBlob && (
                <p className="mt-4 text-center text-sm font-bold text-deep-navy/60">
                  Audio nuevo listo. Se reemplazara el anterior al guardar.
                </p>
              )}
            </div>
          )}

          {activeType === 'video' && (
            <div className="mt-6 rounded-2xl bg-surface-subtle p-6">
              {existingMediaUrl && !videoFile && (
                <div className="mb-4">
                  <p className="mb-2 text-sm font-bold text-deep-navy/60">Video actual:</p>
                  <video className="aspect-video w-full rounded-xl bg-deep-navy object-cover" src={existingMediaUrl} controls playsInline preload="metadata" />
                </div>
              )}
              <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl bg-cream p-6 text-center text-deep-navy transition-all hover:shadow-sm">
                <Upload className="mb-3 text-heritage-gold" size={40} />
                <span className="text-xl font-bold">{existingMediaUrl ? 'Reemplazar video corto' : 'Seleccionar video corto'}</span>
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
            {isPublishing ? (editId ? 'Guardando...' : 'Publicando...') : editId ? 'Guardar cambios' : 'Publicar ahora'}
          </button>
        </form>
      </div>
    </div>
  );
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
  disabled,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-20 items-center gap-3 rounded-xl p-3 text-left transition-all',
        active ? 'bg-deep-navy text-cream shadow-sm' : 'bg-surface-subtle text-deep-navy hover:bg-cream',
        disabled && 'cursor-not-allowed opacity-60',
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
