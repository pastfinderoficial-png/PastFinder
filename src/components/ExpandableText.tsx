import { useState } from 'react';
import { cn } from '../utils';

const DEFAULT_LIMIT = 320;

export function ExpandableText({
  text,
  limit = DEFAULT_LIMIT,
  className,
}: {
  text: string;
  limit?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > limit;
  const shown = expanded || !isLong ? text : `${text.slice(0, limit).trimEnd()}…`;

  return (
    <div className={className}>
      {shown}
      {isLong && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setExpanded((value) => !value);
          }}
          className={cn('mt-2 block text-sm font-bold text-heritage-gold hover:underline')}
        >
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}
