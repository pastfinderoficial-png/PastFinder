import type { ReactNode } from 'react';
import { cn } from '../utils';

type PhotoBannerProps = {
  image: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export function PhotoBanner({ image, className, contentClassName, children }: PhotoBannerProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl shadow-sm', className)}
      style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(120deg, rgba(51,66,76,0.93) 0%, rgba(51,66,76,0.78) 45%, rgba(51,66,76,0.5) 100%)',
        }}
      />
      <div className={cn('relative z-10 text-cream', contentClassName)}>{children}</div>
    </div>
  );
}
