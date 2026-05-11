import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Lock } from 'lucide-react';


interface AudioPlayerProps {
  audioUrl: string;
  isPpv: boolean;
  hasAccess: boolean;
  price?: string;
}

export function AudioPlayer({ audioUrl, isPpv, hasAccess }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const TEASER_LIMIT = 15; // 15 seconds

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#D4AF37', // Heritage Gold
      progressColor: '#0F172A', // Deep Navy
      cursorColor: 'transparent',
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 64,
    });

    ws.load(audioUrl).catch((err) => {
      // Ignore AbortError which happens naturally in React Strict Mode 
      // when the component unmounts before loading finishes
      if (err.name !== 'AbortError') {
        console.error('Error loading audio:', err);
      }
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    
    ws.on('audioprocess', (currentTime) => {
      if (isPpv && !hasAccess && currentTime >= TEASER_LIMIT) {
        ws.pause();
        ws.setTime(TEASER_LIMIT);
        setIsLocked(true);
      }
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl, isPpv, hasAccess]);

  const togglePlay = () => {
    if (isLocked) return;
    if (wavesurferRef.current?.isPlaying()) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current?.play();
    }
  };

  return (
    <div className="relative w-full bg-surface-subtle rounded-xl p-4 my-2">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          disabled={isLocked}
          className="w-14 h-14 shrink-0 rounded-full bg-deep-navy text-cream flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-deep-navy/90"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        
        <div className="flex-1 overflow-hidden" ref={containerRef} />
      </div>

      {isLocked && (
        <div className="absolute inset-0 bg-surface-base/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 z-10 animate-in fade-in">
          <Lock className="text-heritage-gold mb-2" size={32} />
          <h3 className="font-newsreader text-xl font-semibold text-deep-navy mb-1 text-center">
            Para escuchar el resto de esta historia
          </h3>
          <p className="text-deep-navy/70 mb-3 text-center text-sm">
            Suscribete gratis al creador para desbloquear el contenido completo.
          </p>
          <button className="btn-gold text-sm px-6 py-2 min-h-[44px]">
            Suscribirme gratis
          </button>
        </div>
      )}
    </div>
  );
}
