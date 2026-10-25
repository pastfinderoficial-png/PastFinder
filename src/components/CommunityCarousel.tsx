import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import senior2 from '../assets/carousel/senior-2.jpg';
import senior3 from '../assets/carousel/senior-3.jpg';
import senior4 from '../assets/carousel/senior-4.jpg';
import senior5 from '../assets/carousel/senior-5.jpg';
import senior6 from '../assets/carousel/senior-6.jpg';
import senior7 from '../assets/carousel/senior-7.jpg';
import senior8 from '../assets/carousel/senior-8.jpg';

const photos = [
  { src: senior4, name: 'Marta', quote: '"Volvi a sentirme escuchada."' },
  { src: senior7, name: 'Hernan', quote: '"Cada relato es un regalo."' },
  { src: senior2, name: 'Alicia', quote: '"Mis nietos leen mis historias."' },
  { src: senior6, name: 'Yun', quote: '"Encontre una comunidad real."' },
  { src: senior5, name: 'Pilar', quote: '"Escribir me devolvio la voz."' },
  { src: senior8, name: 'Jorge y Rosa', quote: '"Compartimos nuestra historia juntos."' },
  { src: senior3, name: 'Elena', quote: '"Nunca es tarde para contar."' },
];

function getOffset(index: number, active: number, length: number) {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

export function CommunityCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const length = photos.length;
  const dragX = useRef(0);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((current) => (current + 1) % length), 3200);
    return () => window.clearInterval(id);
  }, [paused, length]);

  const go = (direction: 1 | -1) => setActive((current) => (current + direction + length) % length);

  return (
    <section
      className="overflow-hidden bg-surface-sage py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto mb-10 max-w-6xl px-4 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-heritage-gold">Nuestra comunidad</p>
        <h2 className="text-2xl font-bold tracking-tight text-deep-navy md:text-3xl">
          Personas reales, con historias reales.
        </h2>
      </div>

      <div
        className="relative mx-auto h-[320px] max-w-5xl select-none md:h-[380px]"
        style={{ perspective: 1400 }}
      >
        {photos.map((photo, index) => {
          const offset = getOffset(index, active, length);
          const abs = Math.abs(offset);
          const visible = abs <= 2;

          return (
            <motion.button
              key={photo.name}
              type="button"
              aria-label={`Ver a ${photo.name}`}
              onClick={() => (offset === 0 ? undefined : setActive(index))}
              className="absolute left-1/2 top-1/2 w-44 cursor-pointer md:w-56"
              style={{ zIndex: 10 - abs }}
              animate={{
                x: `calc(-50% + ${offset * 150}px)`,
                y: '-50%',
                scale: offset === 0 ? 1 : 0.78 - abs * 0.06,
                rotateY: offset === 0 ? 0 : offset > 0 ? -38 : 38,
                opacity: visible ? (offset === 0 ? 1 : 0.55) : 0,
                pointerEvents: visible ? 'auto' : 'none',
              }}
              transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              drag={offset === 0 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragStart={() => (dragX.current = 0)}
              onDrag={(_event, info) => (dragX.current = info.offset.x)}
              onDragEnd={() => {
                if (dragX.current > 60) go(-1);
                else if (dragX.current < -60) go(1);
              }}
            >
              <div className="aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
                <img src={photo.src} alt={photo.name} className="h-full w-full object-cover" draggable={false} />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-5 px-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-lg font-semibold italic text-deep-navy">{photos[active].quote}</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest text-heritage-gold">{photos[active].name}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-deep-navy shadow-sm transition-all duration-200 hover:shadow-md active:scale-90"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-1.5">
            {photos.map((photo, index) => (
              <button
                key={photo.name}
                onClick={() => setActive(index)}
                aria-label={`Ir a ${photo.name}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === active ? 'w-6 bg-heritage-gold' : 'w-1.5 bg-deep-navy/15'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => go(1)}
            aria-label="Siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-deep-navy shadow-sm transition-all duration-200 hover:shadow-md active:scale-90"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
