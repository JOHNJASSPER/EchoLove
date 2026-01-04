'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const VIBES = [
    { id: 'chill', label: 'Chill', color: 'bg-blue-400' },
    { id: 'sweet', label: 'Sweet', color: 'bg-rose-400' },
    { id: 'playful', label: 'Playful', color: 'bg-yellow-400' },
    { id: 'deep', label: 'Deep', color: 'bg-indigo-400' },
];

interface VibeSliderProps {
    value: string;
    onChange: (vibe: string) => void;
}

export function VibeSlider({ value, onChange }: VibeSliderProps) {
    return (
        <div className="relative w-full overflow-hidden py-4">
            <div className="flex justify-between items-center relative z-10">
                {VIBES.map((v) => {
                    const isActive = value === v.id;
                    return (
                        <button
                            key={v.id}
                            onClick={() => {
                                onChange(v.id);
                                if (typeof window !== 'undefined' && navigator.vibrate) {
                                    navigator.vibrate(10);
                                }
                            }}
                            className={cn(
                                "relative z-10 flex-1 py-1 text-sm font-medium transition-colors duration-300",
                                isActive ? "text-gray-900" : "text-gray-400"
                            )}
                        >
                            {v.label}
                            {isActive && (
                                <motion.div
                                    layoutId="vibe-pill"
                                    className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-rose-500"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Background Track */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] bg-gray-100 rounded-full" />
        </div>
    );
}
