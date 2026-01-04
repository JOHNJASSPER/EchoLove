'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Contact } from '@/lib/db';
import { getUpcomingHolidays, Holiday } from '@/lib/holidays';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Gift, Calendar } from 'lucide-react';
import { differenceInDays, parse, setYear } from 'date-fns';

interface EventContext {
    type: 'holiday' | 'birthday' | 'anniversary';
    name: string;
    contact?: Contact;
    icon: React.ReactNode;
    color: string;
    promptContext: string;
}

export function EventBanner() {
    const contacts = useLiveQuery(() => db.contacts.toArray());
    const { setActiveContact, setEngineOpen } = useAppStore();

    if (!contacts) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for today's holidays
    const todaysHolidays = getUpcomingHolidays(0);

    // Check for today's birthdays
    const todaysBirthdays = contacts.filter(c => {
        if (!c.birthday) return false;
        const bday = parse(c.birthday, 'yyyy-MM-dd', new Date());
        const thisBday = setYear(bday, today.getFullYear());
        return differenceInDays(thisBday, today) === 0;
    });

    // Build event list
    const events: EventContext[] = [];

    // Add holidays
    todaysHolidays.forEach(h => {
        events.push({
            type: 'holiday',
            name: h.name,
            icon: getHolidayIcon(h.name),
            color: getHolidayColor(h.name),
            promptContext: `Today is ${h.name}`
        });
    });

    // Add birthdays
    todaysBirthdays.forEach(c => {
        events.push({
            type: 'birthday',
            name: `${c.name}'s Birthday`,
            contact: c,
            icon: <Gift className="w-5 h-5" />,
            color: 'from-amber-500 to-orange-500',
            promptContext: `Today is ${c.name}'s birthday`
        });
    });

    if (events.length === 0) return null;

    const handleEventClick = (event: EventContext) => {
        if (event.contact) {
            setActiveContact(event.contact);
            setEngineOpen(true);
        } else {
            // For holidays without specific contact, just scroll to garden
            const garden = document.getElementById('garden-grid');
            if (garden) garden.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 space-y-3"
            >
                {events.map((event, i) => (
                    <motion.button
                        key={`${event.type}-${event.name}-${i}`}
                        onClick={() => handleEventClick(event)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-2xl bg-gradient-to-r ${event.color} text-white shadow-lg flex items-center gap-4`}
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            {event.icon}
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-bold text-lg">{event.name}</p>
                            <p className="text-white/80 text-sm">
                                {event.contact
                                    ? `Tap to send ${event.contact.name} a special message!`
                                    : 'Tap a contact below to spread the love! 💕'}
                            </p>
                        </div>
                        <Sparkles className="w-6 h-6 text-white/60" />
                    </motion.button>
                ))}
            </motion.div>
        </AnimatePresence>
    );
}

function getHolidayIcon(name: string): React.ReactNode {
    const lower = name.toLowerCase();
    if (lower.includes('valentine')) return <Heart className="w-5 h-5" fill="currentColor" />;
    if (lower.includes('mother') || lower.includes('father')) return <Heart className="w-5 h-5" />;
    if (lower.includes('christmas')) return <Gift className="w-5 h-5" />;
    return <Calendar className="w-5 h-5" />;
}

function getHolidayColor(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('valentine')) return 'from-rose-500 to-pink-600';
    if (lower.includes('mother')) return 'from-pink-500 to-rose-500';
    if (lower.includes('father')) return 'from-blue-500 to-indigo-600';
    if (lower.includes('christmas')) return 'from-red-600 to-green-600';
    if (lower.includes('halloween')) return 'from-orange-500 to-purple-600';
    if (lower.includes('thanksgiving')) return 'from-amber-500 to-orange-600';
    return 'from-violet-500 to-purple-600';
}
