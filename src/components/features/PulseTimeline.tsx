'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Contact } from '@/lib/db';
import { motion } from 'framer-motion';
import { differenceInDays, parse, setYear } from 'date-fns';
import { Cake, Sparkles, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getUpcomingHolidays, Holiday } from '@/lib/holidays';
import { toast } from 'sonner';
import { CalendarDrawer } from './CalendarDrawer';

type PulseItem =
    | { type: 'birthday'; contact: Contact; daysUntil: number; id: string }
    | { type: 'holiday'; holiday: Holiday; daysUntil: number; id: string };

export function PulseTimeline() {
    const contacts = useLiveQuery(() => db.contacts.toArray());
    const { setActiveContact, setEngineOpen, setCalendarOpen } = useAppStore();

    if (!contacts) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Calculate Birthdays
    const upcomingBirthdays: PulseItem[] = contacts
        .filter((c): c is Contact & { birthday: string } => Boolean(c.birthday))
        .map((contact) => {
            const bday = parse(contact.birthday, 'yyyy-MM-dd', new Date());
            let nextBirthday = setYear(bday, today.getFullYear());
            if (nextBirthday < today) {
                nextBirthday = setYear(bday, today.getFullYear() + 1);
            }
            const daysUntil = differenceInDays(nextBirthday, today);
            return { type: 'birthday' as const, contact, daysUntil, id: `bday-${contact.id}` };
        })
        .filter((b) => b.daysUntil <= 30);

    // 2. Calculate Holidays
    const holidays = getUpcomingHolidays(60);
    const upcomingHolidays: PulseItem[] = holidays.map(h => {
        const hDate = new Date(h.date);
        hDate.setHours(0, 0, 0, 0);
        const daysUntil = differenceInDays(hDate, today);
        return { type: 'holiday' as const, holiday: h, daysUntil, id: h.id };
    });

    // 3. Merge & Sort
    const pulseItems = [...upcomingBirthdays, ...upcomingHolidays]
        .sort((a, b) => a.daysUntil - b.daysUntil);

    const handleBirthdayClick = (contact: Contact) => {
        setActiveContact(contact);
        setEngineOpen(true);
    };

    const handleHolidayClick = (holiday: Holiday) => {
        toast.success(`It's almost ${holiday.name}! Tap a contact to send some love. 💖`);
        const gardenGrid = document.getElementById('garden-grid');
        if (gardenGrid) {
            gardenGrid.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div>
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
            )}

            <CalendarDrawer />
        </div>
    );
}
