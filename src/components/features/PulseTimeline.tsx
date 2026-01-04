'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, Contact } from '@/lib/db';
import { motion } from 'framer-motion';
import { differenceInDays, parse, setYear } from 'date-fns';
import { Cake, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

interface UpcomingBirthday {
    contact: Contact;
    daysUntil: number;
}

export function PulseTimeline() {
    const contacts = useLiveQuery(() => db.contacts.toArray());
    const { setActiveContact, setEngineOpen } = useAppStore();

    if (!contacts) return null;

    const today = new Date();
    const upcomingBirthdays: UpcomingBirthday[] = contacts
        .filter((c) => c.birthday)
        .map((contact) => {
            const bday = parse(contact.birthday!, 'yyyy-MM-dd', new Date());
            let nextBirthday = setYear(bday, today.getFullYear());

            if (nextBirthday < today) {
                nextBirthday = setYear(bday, today.getFullYear() + 1);
            }

            const daysUntil = differenceInDays(nextBirthday, today);
            return { contact, daysUntil };
        })
        .filter((b) => b.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil);

    if (upcomingBirthdays.length === 0) return null;

    const handleClick = (contact: Contact) => {
        setActiveContact(contact);
        setEngineOpen(true);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    The Pulse
                </h2>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                {upcomingBirthdays.map(({ contact, daysUntil }) => (
                    <motion.button
                        key={contact.id}
                        onClick={() => handleClick(contact)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "flex-shrink-0 w-24 p-3 rounded-2xl text-center transition-all",
                            daysUntil === 0
                                ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30"
                                : daysUntil <= 7
                                    ? "glass-card border-rose-200"
                                    : "glass-card"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2",
                            daysUntil === 0 ? "bg-white/20" : "bg-rose-100"
                        )}>
                            <Cake className={cn(
                                "w-5 h-5",
                                daysUntil === 0 ? "text-white" : "text-rose-500"
                            )} />
                        </div>

                        <p className={cn(
                            "text-xs font-bold truncate",
                            daysUntil === 0 ? "text-white" : "text-gray-800"
                        )}>
                            {contact.name.split(' ')[0]}
                        </p>

                        <p className={cn(
                            "text-[10px] font-medium mt-0.5",
                            daysUntil === 0 ? "text-white/80" : "text-gray-500"
                        )}>
                            {daysUntil === 0
                                ? "Today! 🎉"
                                : daysUntil === 1
                                    ? "Tomorrow"
                                    : `${daysUntil} days`
                            }
                        </p>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
