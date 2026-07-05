import React from 'react';
import { UtensilsCrossed, MessageCircle, LayoutDashboard, CalendarDays, Settings } from 'lucide-react';

// Nav icons are now lucide-react components — zero HTTP requests vs the previous 5 PNG files
// (each was ~300–416ms in dev, still an avoidable round-trip in production).
// The CSS filter trick (brightness(0)/invert) that the PNGs relied on is replaced
// with explicit Tailwind color classes that respect the active/inactive state directly.

export type BottomNavItemKey = 'diet-reco' | 'behavior' | 'dashboard' | 'calendar' | 'settings';

export interface BottomNavProps {
    activeItem?: BottomNavItemKey;
    onItemClick?: (item: BottomNavItemKey) => void;
    className?: string;
}

const NAV_ITEMS: Array<{
    key: BottomNavItemKey;
    label: string;
    Icon: React.FC<{ className?: string }>;
}> = [
    { key: 'diet-reco',  label: 'Diet',         Icon: UtensilsCrossed },
    { key: 'behavior',   label: 'Cat Behavior',  Icon: MessageCircle  },
    { key: 'dashboard',  label: 'Dashboard',     Icon: LayoutDashboard },
    { key: 'calendar',   label: 'Calendar',      Icon: CalendarDays   },
    { key: 'settings',   label: 'Settings',      Icon: Settings       },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeItem = 'dashboard', onItemClick, className = '' }) => {
    return (
        <nav
            aria-label="Bottom navigation"
            className={`mx-auto w-full sm:w-fit rounded-[1.5rem] sm:rounded-[1.75rem] border-2 border-slate-900 bg-[#15AFB4] px-3 sm:px-5 py-2 sm:py-3 shadow-[0_4px_0_0_#1e293b] transition-all duration-300 ease-in-out ${className}`}
        >
            <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-3 w-full">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeItem === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onItemClick?.(item.key)}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex h-12 sm:h-16 items-center justify-center rounded-xl border-2 transition-all duration-300 ease-in-out group active:scale-95 ${isActive
                                    ? 'border-slate-900 bg-[#FFB870] -translate-y-3.5 sm:-translate-y-5 shadow-[2px_3px_0_0_#1e293b] w-32 sm:w-48 px-3 sm:px-4'
                                    : 'border-transparent bg-transparent hover:bg-black/10 translate-y-0 shadow-none w-12 sm:w-16 px-0 hover:w-32 hover:sm:w-48 hover:px-3 hover:sm:px-4'
                                }`}
                        >
                            <item.Icon
                                className={`h-6 w-6 sm:h-8 sm:w-8 shrink-0 ${isActive ? 'text-slate-900' : 'text-white'}`}
                            />
                            <span
                                className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-xs sm:text-sm font-extrabold ${isActive
                                        ? 'max-w-40 opacity-100 ml-2 text-slate-900'
                                        : 'max-w-0 opacity-0 group-hover:max-w-40 group-hover:opacity-100 group-hover:ml-2 text-slate-900'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
