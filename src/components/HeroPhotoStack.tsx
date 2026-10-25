import { motion } from 'framer-motion';
import { CompassMark } from './PastFinderLogo';
import hero1 from '../assets/carousel/hero-1.jpg';
import hero2 from '../assets/carousel/hero-2.jpg';
import hero3 from '../assets/carousel/hero-3.jpg';
import hero4 from '../assets/carousel/hero-4.jpg';
import hero5 from '../assets/carousel/hero-5.jpg';
import hero6 from '../assets/carousel/hero-6.jpg';
import hero7 from '../assets/carousel/hero-7.jpg';

const columnA = [hero2, hero5, hero7];
const columnB = [hero4, hero1, hero6, hero3];

function Column({ photos, duration, reverse }: { photos: string[]; duration: number; reverse?: boolean }) {
  const loop = [...photos, ...photos];

  return (
    <motion.div
      className="flex flex-col gap-5"
      animate={{ y: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
      transition={{ duration, ease: 'linear', repeat: Infinity }}
    >
      {loop.map((src, index) => (
        <div
          key={index}
          className="aspect-[3/4] w-48 shrink-0 overflow-hidden rounded-[1.5rem] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)] md:w-60"
        >
          <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ))}
    </motion.div>
  );
}

export function HeroPhotoStack() {
  return (
    <div className="relative mx-auto h-[560px] w-full max-w-lg">
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <CompassMark className="h-96 w-96" />
      </div>

      <div
        className="relative z-10 flex h-full justify-center gap-5 overflow-hidden"
        style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)' }}
      >
        <Column photos={columnA} duration={28} />
        <Column photos={columnB} duration={34} reverse />
      </div>
    </div>
  );
}
