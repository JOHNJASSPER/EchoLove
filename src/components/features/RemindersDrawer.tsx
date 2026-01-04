'use client';

import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Bell, X, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Reminder {
    id: number;
    contactId: number;
    contactName: string;
    time: string;
    scheduledFor: string;
}

export function RemindersDrawer() {
    const [reminders, setReminders] = useState<Reminder[]>([]);

    // Load reminders from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('echolove_reminders');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Filter out past reminders
                const future = parsed.filter((r: Reminder) => new Date(r.scheduledFor) > new Date());
                setReminders(future);
                // Update localStorage with only future reminders
                localStorage.setItem('echolove_reminders', JSON.stringify(future));
            } catch {
                setReminders([]);
            }
        }
    }, []);

    const deleteReminder = (id: number) => {
        const updated = reminders.filter(r => r.id !== id);
        setReminders(updated);
        localStorage.setItem('echolove_reminders', JSON.stringify(updated));
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative" aria-label="View reminders">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {reminders.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] text-white flex items-center justify-center">
                            {reminders.length}
                        </span>
                    )}
                </button>
            </DrawerTrigger>
            <DrawerContent className="bg-white/95 backdrop-blur-2xl">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <div className="flex items-center justify-between">
                            <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-500" />
                                Reminders
                            </DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>

                    <div className="px-4 pb-8 space-y-3 max-h-[60vh] overflow-y-auto">
                        {reminders.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No reminders set</p>
                                <p className="text-sm mt-1">Tap a contact and set a reminder to water them!</p>
                            </div>
                        ) : (
                            reminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="glass-card p-4 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800">{reminder.contactName}</p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(reminder.scheduledFor), 'MMM d')} at {reminder.time}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteReminder(reminder.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        aria-label="Delete reminder"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
