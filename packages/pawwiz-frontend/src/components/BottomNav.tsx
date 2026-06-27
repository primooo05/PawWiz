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
            className={`mx-auto w-full sm:w-fit rounded-[1.5rem] sm:rounded-[1.75rem] border-2 border-slate-900 bg-[#15AFB4] px-3 sm:px-5 py-2 sm:py-3 shadow-[0_4px_0_0_#1e293b] ${className}`}
        >
            <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-8 w-full">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeItem === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onItemClick?.(item.key)}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-xl border-2 transition-all duration-200 ${isActive
                                    ? 'border-slate-900 bg-[#FFB870] -translate-y-3.5 sm:-translate-y-5 shadow-[2px_3px_0_0_#1e293b]'
                                    : 'border-transparent bg-transparent hover:bg-black/10 translate-y-0 shadow-none'
                                }`}
                        >
                            <img
                                src={item.icon}
                                alt=""
                                className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                                style={{
                                    filter: isActive ? 'brightness(0)' : 'brightness(0) invert(1)',
                                }}
                            />
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;