import React from 'react';
import { Activity, Utensils, Heart, Flame } from 'lucide-react';
import type { HealthEvent, EventSource } from '../../../../../pawwiz-backend/src/types/shared.js';

// Source accent colors — consistent with the dashboard's neo-brutalist palette
const SOURCE_COLORS: Record<EventSource, string> = {
  behavior: '#4ECDC4',
  diet: '#FF6B35',
  pregnancy: '#F98080',
  heat: '#a855f7',
};

// Helper to generate icon elements with the correct color using inline style
function getSourceIcon(source: EventSource, color: string) {
  const iconProps = {
    className: 'w-5 h-5',
    strokeWidth: 2.5,
    style: { stroke: color },
  };
  
  const icons: Record<EventSource, React.ReactNode> = {
    behavior: <Activity {...iconProps} />,
    diet: <Utensils {...iconProps} />,
    pregnancy: <Heart {...iconProps} />,
    heat: <Flame {...iconProps} />,
  };
  
  return icons[source];
}

/**
 * Format an ISO 8601 UTC timestamp to "Month D, YYYY h:mm AM/PM" in the
 * user's local timezone using the Intl API (Requirement 6.3).
 */
function formatOccurredAt(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

interface TimelineCardProps {
  event: HealthEvent;
}

/**
 * Stateless timeline card component.
 *
 * Renders a single HealthEvent in PawWiz's neo-brutalist Tailwind style,
 * consistent with the dashboard's border-4 / rounded-2xl / font-black pattern.
 *
 * Validates: Requirements 6.3
 */
const TimelineCard: React.FC<TimelineCardProps> = ({ event }) => {
  const accentColor = SOURCE_COLORS[event.source];
  const formattedDate = formatOccurredAt(event.occurredAt);

  return (
    <article
      className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5 shadow-[4px_4px_0_0_#1a1a1a] flex gap-4 items-start"
      aria-label={`${event.source} event: ${event.title}`}
    >
      {/* Source icon badge */}
      <div
        className="shrink-0 w-12 h-12 flex items-center justify-center border-3 border-[#1a1a1a] rounded-xl"
        style={{ backgroundColor: accentColor + '22' }}
        aria-hidden="true"
      >
        {getSourceIcon(event.source, accentColor)}
      </div>

      {/* Event body */}
      <div className="flex-1 min-w-0">
        {/* Source label + title row */}
        <div className="flex flex-wrap items-baseline gap-2 mb-1">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-[#1a1a1a] rounded-lg"
            style={{ color: accentColor, backgroundColor: accentColor + '1A' }}
          >
            {event.source}
          </span>
          <h3 className="text-sm font-black text-[#1a1a1a] truncate">{event.title}</h3>
        </div>

        {/* Description */}
        <p className="text-xs font-bold text-[#555] leading-relaxed mb-2 line-clamp-2">
          {event.description}
        </p>

        {/* Timestamp */}
        <time
          dateTime={event.occurredAt}
          className="text-[10px] font-black text-[#888] uppercase tracking-widest"
        >
          {formattedDate}
        </time>
      </div>
    </article>
  );
};

export default TimelineCard;
