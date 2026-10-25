import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
};

export function AnimatedCounter({ value, suffix = '', prefix = '', label }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <span className="block text-4xl font-bold tracking-tight text-deep-navy md:text-5xl">
        {prefix}
        {display.toLocaleString('es-CL')}
        {suffix}
      </span>
      <span className="mt-1 block text-sm font-bold uppercase tracking-widest text-heritage-gold">{label}</span>
    </motion.div>
  );
}
