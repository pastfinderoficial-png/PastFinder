import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'framer-motion';

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(springY, [0, 1], [8, -8]);
  const rotateY = useTransform(springX, [0, 1], [-8, 8]);
  const glowX = useTransform(springX, [0, 1], ['0%', '100%']);
  const glowY = useTransform(springY, [0, 1], ['0%', '100%']);
  const glowBackground = useMotionTemplate`radial-gradient(240px circle at ${glowX} ${glowY}, rgba(250,249,246,0.18), transparent 70%)`;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={className}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glowBackground }}
      />
      {children}
    </motion.div>
  );
}
