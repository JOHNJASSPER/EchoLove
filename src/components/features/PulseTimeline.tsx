'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Contact } from '@/lib/db';
import { motion } from 'framer-motion';
import { differenceInDays, parse, setYear } from 'date-fns';
import { Cake, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

import { CalendarDrawer } from './CalendarDrawer';

// ... existing imports

export function PulseTimeline() {
    const contacts = useLiveQuery(() => db.contacts.toArray());
    const { setActiveContact, setEngineOpen, setCalendarOpen } = useAppStore();

    // ... existing logic ...

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        The Pulse
                    </h2>
                </div>
                <button
                    onClick={() => setCalendarOpen(true)}
                    className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                >
                    View All <Calendar className="w-3 h-3" />
                </button>
            </div>

            {pulseItems.length === 0 ? (
                <div className="glass-card p-4 text-center">
                    <p className="text-sm text-gray-500 italic">
                        No upcoming vibes soon. <br />
                        Plant more seeds or wait for a holiday! 🌱
                    </p>
                </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                    {pulseItems.map((item) => {
                        const isBirthday = item.type === 'birthday';

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => isBirthday ? handleBirthdayClick(item.contact) : handleHolidayClick(item.holiday)}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "flex-shrink-0 w-24 p-3 rounded-2xl text-center transition-all",
                                    item.daysUntil === 0
                                        ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30"
                                        : item.daysUntil <= 7
                                            ? "glass-card border-rose-200"
                                            : "glass-card"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2",
                                    item.daysUntil === 0 ? "bg-white/20" : isBirthday ? "bg-rose-100" : "bg-purple-100"
                                )}>
                                    {isBirthday ? (
                                        <Cake className={cn("w-5 h-5", item.daysUntil === 0 ? "text-white" : "text-rose-500")} />
                                    ) : (
                                        <Calendar className={cn("w-5 h-5", item.daysUntil === 0 ? "text-white" : "text-purple-500")} />
                                    )}
                                </div>

                                <p className={cn(
                                    "text-xs font-bold truncate",
                                    item.daysUntil === 0 ? "text-white" : "text-gray-800"
                                )}>
                                    {isBirthday ? item.contact.name.split(' ')[0] : item.holiday.name}
                                </p>

                                <p className={cn(
                                    "text-[10px] font-medium mt-0.5",
                                    item.daysUntil === 0 ? "text-white/80" : "text-gray-500"
                                )}>
                                    {item.daysUntil === 0
                                        ? "Today! 🎉"
                                        : item.daysUntil === 1
                                            ? "Tomorrow"
                                            : `${item.daysUntil} days`
                                    }
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
                            </motion.button>
    );
})}
                </div >
            )}

<CalendarDrawer />
        </div >
    );
}
