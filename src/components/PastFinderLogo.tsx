import { cn } from '../utils';

type PastFinderLogoProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export function PastFinderLogo({ compact = false, inverse = false, className }: PastFinderLogoProps) {
  const textColor = inverse ? 'text-cream' : 'text-deep-navy';

  return (
    <div className={cn('inline-flex items-center gap-3', className)} aria-label="PastFinder">
      {!compact && (
        <span className={cn('font-newsreader text-3xl font-bold tracking-normal md:text-4xl', textColor)}>
          PastFinder
        </span>
      )}
      <CompassMark className={compact ? 'h-10 w-10' : 'h-12 w-12 md:h-14 md:w-14'} />
    </div>
  );
}

export function CompassMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none" role="img" aria-label="Brujula PastFinder">
      <circle cx="64" cy="64" r="42" stroke="#5C7F93" strokeWidth="3" />
      <circle cx="64" cy="64" r="34" stroke="#5C7F93" strokeWidth="2" opacity="0.75" />
      <circle cx="64" cy="64" r="24" stroke="#5C7F93" strokeWidth="2" opacity="0.55" />
      <path d="M64 8L72 55L120 64L72 73L64 120L56 73L8 64L56 55L64 8Z" fill="#7A9BB0" stroke="#5C7F93" strokeWidth="3" />
      <path d="M38 38L58 57L46 28L70 54L90 28L75 58L100 38L80 66L100 90L72 75L64 120L56 73L28 90L50 66L28 64L54 58L38 38Z" stroke="#5C7F93" strokeWidth="2" opacity="0.85" />
      <circle cx="64" cy="64" r="9" fill="#EFEBE1" stroke="#5C7F93" strokeWidth="3" />
      <circle cx="64" cy="64" r="4" fill="#7A9BB0" />
    </svg>
  );
}
