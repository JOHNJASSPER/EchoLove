'use client';

import { Home, Sparkles, User, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export function BottomNav() {
    const [active, setActive] = useState('home');
    const { setEngineOpen, setSettingsOpen, activeContact } = useAppStore();

    const handleNav = (id: string) => {
        setActive(id);

        switch (id) {
            case 'home':
                setEngineOpen(false);
                setSettingsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'engine':
                if (activeContact) {
                    setEngineOpen(true);
                } else {
                    // Shake effect or toast could go here
                }
                break;
            case 'profile':
                setSettingsOpen(true);
                break;
        }
    };

    const navItems = [
        { id: 'home', icon: Home, label: 'Garden' },
        { id: 'engine', icon: Sparkles, label: 'Echo' },
        { id: 'profile', icon: User, label: 'Me' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
            <div className="glass rounded-full px-6 py-4 flex justify-between items-center shadow-2xl shadow-rose-500/10">
                {navItems.map((item) => {
                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNav(item.id)}
                            className="relative flex flex-col items-center justify-center w-12 h-12"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-rose-500/10 rounded-full blur-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <item.icon
                                className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-rose-500' : 'text-gray-400'
                                    }`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
