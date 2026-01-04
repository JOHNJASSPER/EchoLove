'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { db } from '@/lib/db';
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VibeSlider } from './VibeSlider';
import { Sparkles, RefreshCw, X, Droplets, MessageSquare, Mail, Phone, Bell, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { sendSMS } from '@/lib/platform';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { getUpcomingHolidays } from '@/lib/holidays';

declare global {
    interface Window {
        timerWorker: Worker;
    }
}

export function EchoEngineDrawer() {
    const { activeContact, isEngineOpen, setEngineOpen, eventContext, holidayName, setEventContext } = useAppStore();
    const [vibe, setVibe] = useState('chill');
    const [draft, setDraft] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const [showReminder, setShowReminder] = useState(false);
    const [reminderTime, setReminderTime] = useState('09:00');

    const drawerKey = activeContact?.id || 'none';

    const hasPhone = Boolean(activeContact?.phoneNumber);
    const hasEmail = Boolean(activeContact?.email);
    const hasAnyContact = hasPhone || hasEmail;

    // Initialize Worker for background timing
    useEffect(() => {
        if (typeof window !== 'undefined' && Worker) {
            const worker = new Worker('/timer-worker.js');
            window.timerWorker = worker;
            console.log("🔔 Timer Worker Initialized");

            // Sync existing reminders
            const saved = JSON.parse(localStorage.getItem('echolove_reminders') || '[]');
            worker.postMessage({ reminders: saved });

            // Listen for checks
            worker.onmessage = (e) => {
                console.log("🔔 Worker Message:", e.data);
                if (e.data.type === 'FIRE' && e.data.reminder) {
                    const r = e.data.reminder;

                    // Verify if we should play (double check)
                    // Play sound
                    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=notification-sound-7062.mp3');
                    audio.volume = 0.5;
                    audio.play().catch(console.error);

                    // Show notification
                    if (Notification.permission === 'granted') {
                        new Notification(`Time to water ${r.contactName}!`, {
                            body: "Tap to send some love found in your garden 💕",
                            icon: '/icons/icon-192x192.png',
                            badge: '/icons/icon-96x96.png',
                            tag: `echolove-${r.contactId}`,
                            requireInteraction: true,
                            silent: false
                        });
                    }

                    // Remove from list to prevent re-firing in same minute
                    const current = JSON.parse(localStorage.getItem('echolove_reminders') || '[]');
                    const updated = current.filter((i: { id: number }) => i.id !== r.id);
                    localStorage.setItem('echolove_reminders', JSON.stringify(updated));
                    worker.postMessage({ reminders: updated });
                }
            };

            return () => {
                worker.terminate();
            };
        }
    }, []);

    const generateEcho = async () => {
        if (!activeContact || !activeContact.id) return;
        setIsGenerating(true);
        setIsManual(false);

        // Check for holidays happening TODAY (range 0 means today)
        const todaysHolidays = getUpcomingHolidays(0);
        const activeHoliday = todaysHolidays.length > 0 ? todaysHolidays[0].name : null;

        // Fetch recent messages for this contact to avoid repetition
        let recentMessages: string[] = [];
        try {
            const recent = await db.generatedMessages
                .where('contactId')
                .equals(activeContact.id)
                .reverse()
                .limit(5)
                .toArray();
            recentMessages = recent.map(m => m.content);
        } catch {
            // Ignore if table doesn't exist yet
        }

        // Determine message type from context
        const messageType = eventContext === 'birthday' ? 'birthday'
            : eventContext === 'holiday' ? 'holiday'
                : 'checkin';

        try {
            const response = await fetch(`/api/echo?ts=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                body: JSON.stringify({
                    contactName: activeContact.name,
                    relationship: activeContact.relationship,
                    vibe: vibe,
                    holiday: holidayName || activeHoliday,
                    messageType: messageType,
                    recentMessages
                }),
            });

            const data = await response.json();
            if (data.echo) {
                setDraft(data.echo);

                // Save generated message for future freshness
                try {
                    await db.generatedMessages.add({
                        contactId: activeContact.id,
                        content: data.echo,
                        vibe: vibe,
                        holiday: activeHoliday || undefined,
                        createdAt: new Date()
                    });
                } catch {
                    // Ignore save errors
                }
            } else {
                throw new Error(data.error || 'Failed to generate');
            }
        } catch {
            toast.error("AI connection spotty. Using offline inspiration! ✨");
            const FALLBACKS = [
                `Thinking of you, ${activeContact.name}! Hope your day is going great. 💕`,
                `Hey ${activeContact.name}, sending you a big hug! 🤗`,
                `Just wanted to say I appreciate you, ${activeContact.name}. ✨`,
                `Hope you're smiling today, ${activeContact.name}! 😊`,
                `Sending some good vibes your way, ${activeContact.name} ~ 🌟`
            ];
            setDraft(FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]);
        } finally {
            setIsGenerating(false);
        }
    };

    const logInteraction = async (type: 'sms' | 'whatsapp' | 'email') => {
        if (!activeContact?.id) return;
        try {
            await db.interactions.add({
                contactId: activeContact.id,
                type,
                note: draft.substring(0, 100),
                date: new Date(),
            });
            await db.contacts.update(activeContact.id, {
                lastContacted: new Date(),
            });
        } catch (error) {
            console.error('Interaction logging failed');
        }
    };

    const celebrate = () => {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f43f5e', '#ec4899', '#a855f7', '#22c55e'],
        });
    };

    const handleSendSMS = async () => {
        if (!draft || !hasPhone) return;
        const phone = activeContact?.phoneNumber?.replace(/\s/g, '') || ''; // Remove spaces and handle undefined

        toast.success("Opening SMS...");

        // Use platform utility for native support
        // Trigger navigation first to preserve user gesture
        await sendSMS(phone, draft);

        celebrate();
        await logInteraction('sms');

        setTimeout(() => {
            setEngineOpen(false);
            setDraft('');
        }, 500);
    };

    const handleSendWhatsApp = async () => {
        if (!draft || !hasPhone) return;
        const phone = activeContact?.phoneNumber?.replace(/\D/g, ''); // Remove non-digits

        toast.success("Opening WhatsApp...");

        // Trigger navigation safely
        const link = document.createElement('a');
        link.href = `https://wa.me/${phone}?text=${encodeURIComponent(draft)}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        celebrate();
        await logInteraction('whatsapp');

        setTimeout(() => {
            setEngineOpen(false);
            setDraft('');
        }, 500);
    };

    const handleSendEmail = async () => {
        if (!draft || !hasEmail) return;
        const email = activeContact?.email;

        toast.success("Opening Email...");

        // Trigger navigation safely
        const link = document.createElement('a');
        link.href = `mailto:${email}?subject=💕 A little note for you&body=${encodeURIComponent(draft)}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        celebrate();
        await logInteraction('email');

        setTimeout(() => {
            setEngineOpen(false);
            setDraft('');
        }, 500);
    };

    const handleSetReminder = async () => {
        if (!activeContact) return;

        const [hours, minutes] = reminderTime.split(':').map(Number);
        const now = new Date();
        const title = `Time to water ${activeContact.name}! 💕`;
        const body = "Tap to send a loving message";

        // Calculate schedule time
        const scheduleTime = new Date();
        scheduleTime.setHours(hours, minutes, 0, 0);
        if (scheduleTime <= now) {
            scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        const isNative = Capacitor.isNativePlatform();

        if (isNative) {
            // Native Android/iOS - use LocalNotifications
            try {
                const status = await LocalNotifications.requestPermissions();
                if (status.display === 'granted') {
                    await LocalNotifications.schedule({
                        notifications: [{
                            title,
                            body,
                            id: Date.now() & 0x7FFFFFFF,
                            schedule: { at: scheduleTime },
                            sound: "echolove_chime.wav",
                            actionTypeId: "",
                            extra: { contactId: activeContact.id }
                        }]
                    });
                    toast.success(`Reminder set for ${reminderTime}! 🔔`);
                    setShowReminder(false);
                } else {
                    toast.error("Notifications permission denied");
                }
            } catch {
                toast.error("Failed to schedule notification");
            }
        } else {
            // Web/PWA - use Notification API + localStorage
            try {
                if (!("Notification" in window)) {
                    toast.error("This browser doesn't support notifications");
                    return;
                }

                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    // Update main list
                    const newReminders = JSON.parse(localStorage.getItem('echolove_reminders') || '[]');
                    const reminder = {
                        id: Date.now(),
                        contactId: activeContact.id,
                        contactName: activeContact.name,
                        time: reminderTime,
                        scheduledFor: scheduleTime.toISOString()
                    };
                    newReminders.push(reminder);
                    localStorage.setItem('echolove_reminders', JSON.stringify(newReminders));

                    // Sync with worker
                    if (window.timerWorker) {
                        window.timerWorker.postMessage({ reminders: newReminders });
                    }

                    toast.success(`Reminder set for ${reminderTime}! 🔔`);
                    setShowReminder(false);
                }
            } catch {
                toast.error("Failed to set reminder");
            }
        }
    };


    // Determine if this is a special event
    const isBirthdayMode = eventContext === 'birthday';
    const isHolidayMode = eventContext === 'holiday';

    return (
        <Drawer open={isEngineOpen} onOpenChange={setEngineOpen}>
            <DrawerContent key={drawerKey} className={`backdrop-blur-2xl h-[95vh] ${isBirthdayMode ? 'bg-gradient-to-b from-rose-50 to-white' : isHolidayMode ? 'bg-gradient-to-b from-pink-50 to-white' : 'bg-white/95'}`}>
                <div className="mx-auto w-full max-w-sm flex flex-col h-full overflow-hidden">
                    <DrawerHeader className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <DrawerTitle className="text-2xl font-bold text-left flex items-center gap-2">
                                    {isBirthdayMode ? (
                                        <>
                                            <span className="text-2xl">🎂</span>
                                            {activeContact?.name}&apos;s Birthday!
                                        </>
                                    ) : isHolidayMode ? (
                                        <>
                                            <span className="text-2xl">💕</span>
                                            {holidayName} Message
                                        </>
                                    ) : (
                                        <>
                                            <Droplets className="w-5 h-5 text-blue-400" />
                                            Watering {activeContact?.name}
                                        </>
                                    )}
                                </DrawerTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    {isBirthdayMode && <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">🎉 Birthday Mode</span>}
                                    {isHolidayMode && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">💕 {holidayName}</span>}
                                    {hasPhone && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">📱 SMS</span>}
                                    {hasEmail && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✉️ Email</span>}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                    onClick={() => setShowReminder(!showReminder)}
                                >
                                    <Bell className="w-5 h-5 text-rose-500" />
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </DrawerClose>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 px-6 space-y-4 overflow-y-auto pt-2">
                        {/* Reminder Panel */}
                        <AnimatePresence>
                            {showReminder && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="glass-card p-4 space-y-3"
                                >
                                    <Label className="flex items-center gap-2 text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        Set Daily Reminder
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="time"
                                            value={reminderTime}
                                            onChange={(e) => setReminderTime(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleSetReminder} size="sm" className="bg-rose-500">
                                            <Bell className="w-4 h-4 mr-1" />
                                            Set
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        You&apos;ll get a notification to send a message at this time
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mode Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsManual(false)}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${!isManual ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4 inline mr-1" /> AI Generate
                            </button>
                            <button
                                onClick={() => { setIsManual(true); setDraft(''); }}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${isManual ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                ✍️ Write Manually
                            </button>
                        </div>

                        {/* Vibe Selection (AI mode only) */}
                        {!isManual && (
                            <div className="space-y-4">
                                <VibeSlider value={vibe} onChange={setVibe} />
                            </div>
                        )}

                        {/* Message Area */}
                        <div className="space-y-3">
                            {isManual ? (
                                <Textarea
                                    placeholder="Write your message..."
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    className="min-h-[120px] text-lg"
                                />
                            ) : (
                                <div className="relative min-h-[120px] flex flex-col items-center justify-center p-5 rounded-3xl border border-rose-100 bg-rose-50/30 overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {isGenerating ? (
                                            <motion.div
                                                key="generating"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col items-center space-y-3"
                                            >
                                                <RefreshCw className="w-7 h-7 text-rose-400 animate-spin" />
                                                <p className="text-rose-500 font-medium text-sm">Brewing affection...</p>
                                            </motion.div>
                                        ) : draft ? (
                                            <motion.div
                                                key="draft"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="space-y-3 text-center"
                                            >
                                                <p className="text-base leading-relaxed text-gray-800 font-medium italic">
                                                    &ldquo;{draft}&rdquo;
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={generateEcho}
                                                    className="text-gray-400 hover:text-rose-500 transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-1" />
                                                    Regenerate
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex flex-col items-center space-y-3"
                                            >
                                                <div className="w-10 h-10 bg-white rounded-full shadow-inner flex items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-rose-300" />
                                                </div>
                                                <p className="text-gray-400 text-sm">Tap Generate to create a message</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    <DrawerFooter className="px-6 pb-8 space-y-3">
                        {!draft && !isManual ? (
                            <Button
                                onClick={generateEcho}
                                className="w-full bg-rose-500 h-14 text-lg rounded-2xl shadow-xl shadow-rose-500/20"
                                disabled={isGenerating}
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Spark ✨
                            </Button>
                        ) : draft ? (
                            <div className="space-y-3">
                                <p className="text-xs text-center text-gray-500 font-medium">Send via:</p>
                                <div className={`grid gap-2 ${hasPhone && hasEmail ? 'grid-cols-3' : hasPhone ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {hasPhone && (
                                        <Button
                                            onClick={handleSendSMS}
                                            className="h-14 rounded-xl bg-green-500 hover:bg-green-600 flex-col"
                                        >
                                            <Phone className="w-5 h-5" />
                                            <span className="text-xs mt-1">SMS</span>
                                        </Button>
                                    )}
                                    {hasPhone && (
                                        <Button
                                            onClick={handleSendWhatsApp}
                                            className="h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex-col"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                            <span className="text-xs mt-1">WhatsApp</span>
                                        </Button>
                                    )}
                                    {hasEmail && (
                                        <Button
                                            onClick={handleSendEmail}
                                            className="h-14 rounded-xl bg-blue-500 hover:bg-blue-600 flex-col"
                                        >
                                            <Mail className="w-5 h-5" />
                                            <span className="text-xs mt-1">Email</span>
                                        </Button>
                                    )}
                                </div>
                                {!hasAnyContact && (
                                    <p className="text-center text-amber-600 text-sm">
                                        Edit this contact to add phone or email
                                    </p>
                                )}
                            </div>
                        ) : null}
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
