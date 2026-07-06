import React from 'react';
import AnimatedAvatarGroup, { type AvatarData } from '../ui/smoothui/animated-avatar-group';

export interface GreetingHeaderProps {
    title: string;
    subtitle: string;
    /** Avatars for the profile switcher. Omit to hide the switcher entirely. */
    avatars?: AvatarData[];
    onAvatarClick?: (id: string) => void;
    /** Defaults to navigating to /settings, matching the diet recommender's "add cat" flow. */
    onAddClick?: () => void;
    className?: string;
}

/**
 * Shared greeting + profile-switcher header, lifted from DietDashboardView so
 * /dashboard, /behavior-chat, and /pregnancy-tracker can present the same
 * layout with their own copy.
 */
export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
    title,
    subtitle,
    avatars,
    onAvatarClick,
    onAddClick,
    className = '',
}) => {
    return (
        <div className={`w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className}`}>
            <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{title}</h1>
                <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{subtitle}</p>
            </div>

            {avatars && avatars.length > 0 && (
                <div className="relative self-stretch sm:self-auto flex items-center">
                    <AnimatedAvatarGroup
                        avatars={avatars}
                        onAvatarClick={onAvatarClick}
                        onAddClick={onAddClick}
                    />
                </div>
            )}
        </div>
    );
};

export default GreetingHeader;
