'use client';

import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { MessageCircle, Calendar, Bell } from 'lucide-react';

export function QuickActions() {
    const { setCalendarOpen } = useAppStore();

    const actions = [
        {
            icon: <MessageCircle className="w-6 h-6" />,
            label: 'Send Love',
            color: 'from-rose-500 to-pink-500',
            onClick: () => {
                // Scroll to garden to pick a contact
                const garden = document.getElementById('garden-grid');
                if (garden) garden.scrollIntoView({ behavior: 'smooth' });
            }
        },
        {
            icon: <Calendar className="w-6 h-6" />,
            label: 'Calendar',
            color: 'from-violet-500 to-purple-500',
            onClick: () => setCalendarOpen(true)
        },
        {
            icon: <Bell className="w-6 h-6" />,
            label: 'Reminders',
            color: 'from-amber-500 to-orange-500',
            onClick: () => {
                // Scroll to garden - reminders are per-contact
                const garden = document.getElementById('garden-grid');
                if (garden) garden.scrollIntoView({ behavior: 'smooth' });
            }
        }
    ];

    return (
        <div className="flex gap-3 mb-6">
            {actions.map((action, i) => (
                <motion.button
                    key={action.label}
                    onClick={action.onClick}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                    className={`flex-1 p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg flex flex-col items-center gap-2`}
                >
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        {action.icon}
                    </div>
                    <span className="text-xs font-semibold">{action.label}</span>
                </motion.button>
            ))}
        </div>
    );
}
