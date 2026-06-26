import React from 'react';
import dietRecoIcon from '../assets/diet-reco.png';
import plantIcon from '../assets/plant-checker.png';
import dashboardIcon from '../assets/dashboard.png';
import calendarIcon from '../assets/calendar.png';
import settingsIcon from '../assets/settings.png';

export type BottomNavItemKey = 'diet-reco' | 'plant' | 'dashboard' | 'calendar' | 'settings';

export interface BottomNavProps {
    activeItem?: BottomNavItemKey;
    onItemClick?: (item: BottomNavItemKey) => void;
    className?: string;
}

const NAV_ITEMS: Array<{
    key: BottomNavItemKey;
    label: string;
    icon: string;
}> = [
    { key: 'diet-reco', label: 'Diet', icon: dietRecoIcon },
    { key: 'plant', label: 'Plant', icon: plantIcon },
    { key: 'dashboard', label: 'Dashboard', icon: dashboardIcon },
    { key: 'calendar', label: 'Calendar', icon: calendarIcon },
    { key: 'settings', label: 'Settings', icon: settingsIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeItem = 'dashboard', onItemClick, className = '' }) => {
    return (
        <nav
            aria-label="Bottom navigation"
            className={`mx-auto w-fit rounded-[1.75rem] border-2 border-slate-200 bg-white/95 px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur ${className}`}
        >
            <div className="flex items-center gap-6 sm:gap-8">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeItem === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onItemClick?.(item.key)}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all duration-200 ${
                                isActive
                                    ? 'border-teal-500 bg-teal-50 shadow-[0_6px_16px_rgba(20,184,166,0.15)]'
                                    : 'border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <img src={item.icon} alt="" className="h-8 w-8 object-contain" />
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;