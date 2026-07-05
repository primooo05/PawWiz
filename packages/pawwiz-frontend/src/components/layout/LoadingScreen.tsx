import React, { useEffect, useState } from 'react';
import loadingGif from '../../assets/loading.gif';

interface LoadingScreenProps {
    onComplete?: () => void;
    durationMs?: number; // Simulated loading time in milliseconds
    catName?: string;
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
    onComplete, 
    durationMs = 3000,
    catName,
    message
}) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const intervalTime = 30; // Update progress every 30ms
        const totalSteps = durationMs / intervalTime;
        const increment = 100 / totalSteps;
        let timeoutId: ReturnType<typeof setTimeout>;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(timer);
                    if (onComplete) {
                        // Small delay to let user see 100% progress
                        timeoutId = setTimeout(onComplete, 200);
                    }
                    return 100;
                }
                return next;
            });
        }, intervalTime);

        return () => {
            clearInterval(timer);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [durationMs, onComplete]);

    return (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#FAFAFA] px-6 font-sans">
            <div className="flex flex-col items-center max-w-xs sm:max-w-sm w-full text-center">
                {/* Loading GIF Container */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 mb-8 overflow-hidden rounded-[2rem] border-4 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] bg-white flex items-center justify-center">
                    <img 
                        src={loadingGif} 
                        alt="Loading..." 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-100 border-2 border-slate-900 rounded-full h-6 overflow-hidden shadow-[2px_2px_0_0_rgba(15,23,42,1)] mb-4 p-0.5 flex items-center">
                    <div 
                        className="bg-[#15AFB4] h-full rounded-full transition-all duration-75 ease-out border-r border-slate-900"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Status Text and Percentage */}
                <div className="flex justify-between items-center w-full px-1 text-slate-800">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest animate-pulse">
                        {message || (catName ? `Loading ${catName}'s stats...` : "Loading cat's stats...")}
                    </span>
                    <span className="text-xs sm:text-sm font-black tabular-nums">
                        {Math.floor(progress)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
