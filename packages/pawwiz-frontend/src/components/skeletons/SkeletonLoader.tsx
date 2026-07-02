import React from 'react';

/**
 * Base skeleton line component - animated pulse placeholder
 */
export const SkeletonLine: React.FC<{ 
  width?: string
  height?: string
  className?: string 
}> = ({ 
  width = 'w-full',
  height = 'h-3',
  className = '' 
}) => (
  <div className={`bg-slate-200/60 rounded animate-pulse ${width} ${height} ${className}`} />
);

/**
 * Skeleton avatar circle - commonly used in messages and profiles
 */
export const SkeletonAvatar: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}> = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeClass = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }[size];

  return (
    <div className={`${sizeClass} rounded-full bg-slate-200 animate-pulse flex-shrink-0 ${className}`} />
  );
};

/**
 * Skeleton chat bubble - for loading messages
 */
export const SkeletonChatBubble: React.FC<{ 
  isUser?: boolean
  variant?: 'compact' | 'full'
}> = ({ 
  isUser = false,
  variant = 'full'
}) => (
  <div className={`flex items-end gap-2.5 animate-fadeInUp ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
    <SkeletonAvatar size="md" />
    <div className={`max-w-[78%] px-4 py-3 rounded-2xl ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'} bg-white border border-slate-200/80 shadow-sm`}>
      {variant === 'full' ? (
        <>
          <SkeletonLine width="w-12" className="mb-1.5" />
          <SkeletonLine width="w-48" className="mb-1" />
          <SkeletonLine width="w-36" className="mb-1" />
          <SkeletonLine width="w-40" />
        </>
      ) : (
        <SkeletonLine width="w-32" />
      )}
    </div>
  </div>
);

/**
 * Skeleton header - for chat or page headers
 */
export const SkeletonHeader: React.FC<{ 
  showStatus?: boolean
}> = ({ 
  showStatus = true 
}) => (
  <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b-2 border-slate-200 bg-slate-100">
    <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse md:hidden" />
    <SkeletonAvatar size="lg" />
    <div className="flex-1 min-w-0">
      <SkeletonLine width="w-16" className="mb-1.5" />
      <SkeletonLine width="w-32" height="h-2.5" />
    </div>
    {showStatus && (
      <div className="hidden sm:flex items-center gap-1.5 bg-slate-200 rounded-lg px-2.5 py-1.5 animate-pulse">
        <div className="w-3.5 h-3.5 rounded bg-slate-300" />
        <SkeletonLine width="w-10" height="h-2" />
      </div>
    )}
  </div>
);

/**
 * Skeleton messages group - multiple loading bubbles
 */
export const SkeletonMessages: React.FC<{ 
  count?: number
  variant?: 'compact' | 'full'
}> = ({ 
  count = 3,
  variant = 'full'
}) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonChatBubble 
        key={i}
        isUser={i % 2 === 1}
        variant={variant}
      />
    ))}
  </div>
);

/**
 * Skeleton profile card - for settings/profile pages
 */
export const SkeletonProfileCard: React.FC<{ 
  className?: string 
}> = ({ className = '' }) => (
  <div className={`bg-white border-2 border-slate-200 rounded-2xl p-6 ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <SkeletonAvatar size="lg" />
      <div className="flex-1">
        <SkeletonLine width="w-32" className="mb-2" />
        <SkeletonLine width="w-48" height="h-2" />
      </div>
    </div>
    <div className="space-y-3">
      <SkeletonLine width="w-full" />
      <SkeletonLine width="w-4/5" />
      <SkeletonLine width="w-3/4" />
    </div>
  </div>
);

/**
 * Skeleton card with image - for diet profiles, photos, etc.
 */
export const SkeletonImageCard: React.FC<{ 
  hasImage?: boolean
  className?: string 
}> = ({ 
  hasImage = true,
  className = '' 
}) => (
  <div className={`bg-white border-2 border-slate-200 rounded-2xl overflow-hidden ${className}`}>
    {hasImage && (
      <div className="w-full h-48 bg-slate-200 animate-pulse" />
    )}
    <div className="p-4 space-y-3">
      <SkeletonLine width="w-32" />
      <SkeletonLine width="w-full" />
      <SkeletonLine width="w-2/3" />
    </div>
  </div>
);
