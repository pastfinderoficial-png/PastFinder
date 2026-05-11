import { useState, useEffect, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { cn } from '../utils';

interface GiantRecordButtonProps {
  onRecordStart: () => void;
  onRecordStop: (audioBlob: Blob) => void;
  isRecording: boolean;
}

export function GiantRecordButton({ onRecordStart, onRecordStop, isRecording }: GiantRecordButtonProps) {
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setTimer(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordStop(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Apagar el micrófono
      };

      mediaRecorder.start();
      onRecordStart();
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor, revisa los permisos de tu navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setTimer(0);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          "w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-md outline-none focus:ring-4 focus:ring-heritage-gold",
          isRecording 
            ? "bg-red-100 text-red-600 animate-pulse" 
            : "bg-deep-navy text-cream hover:bg-deep-navy/90"
        )}
        aria-label={isRecording ? "Detener grabación" : "Iniciar grabación"}
      >
        {isRecording ? <Square size={64} fill="currentColor" /> : <Mic size={64} />}
      </button>
      
      {isRecording && (
        <div className="text-3xl font-newsreader font-bold text-deep-navy">
          {formatTime(timer)}
        </div>
      )}
      
      {!isRecording && (
        <p className="text-lg text-deep-navy/80 font-medium max-w-xs text-center">
          Toca el micrófono grande para empezar a grabar tu historia.
        </p>
      )}
    </div>
  );
}
