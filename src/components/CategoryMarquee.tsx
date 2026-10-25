import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

type CategoryItem = { name: string; icon: LucideIcon };

export function CategoryMarquee({ items }: { items: CategoryItem[] }) {
  const [paused, setPaused] = useState(false);
  const loop = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface-base to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface-base to-transparent md:w-32" />

      <motion.div
        className="flex w-max gap-4 px-4"
        animate={paused ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {loop.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={`${item.name}-${index}`}
              to={`/historias?categoria=${encodeURIComponent(item.name)}`}
              className="flex w-52 shrink-0 flex-col justify-between rounded-3xl bg-deep-navy p-6 text-cream shadow-[0_20px_40px_-24px_rgba(55,66,74,0.4)] transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98] md:w-60"
            >
              <Icon className="mb-10 text-heritage-gold" size={28} />
              <span className="text-lg font-bold leading-snug">{item.name}</span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
