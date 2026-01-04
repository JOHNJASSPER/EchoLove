'use client';

import { useState } from 'react';
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
import { Sparkles, Send, RefreshCw, X, Droplets, MessageSquare, Mail, Phone, Bell, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { sendSMS } from '@/lib/platform';

export function EchoEngineDrawer() {
    const { activeContact, isEngineOpen, setEngineOpen } = useAppStore();
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

    const generateEcho = async () => {
        if (!activeContact) return;
        setIsGenerating(true);
        setIsManual(false);
        try {
            const response = await fetch('/api/echo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contactName: activeContact.name,
                    relationship: activeContact.relationship,
                    vibe: vibe,
                }),
            });

            const data = await response.json();
            if (data.echo) {
                setDraft(data.echo);
            } else {
                throw new Error(data.error || 'Failed to generate');
            }
        } catch (error) {
            console.error(error);
            toast.error("AI generation failed. Using fallback message.");
            setDraft(`Thinking of you, ${activeContact.name}! Hope your day is going great. 💕`);
        } finally {
            setIsGenerating(false);
        }
    };

    const logInteraction = async (type: 'sms' | 'whatsapp' | 'email') => {
        if (!activeContact) return;
        try {
            await db.interactions.add({
                contactId: activeContact.id!,
                type,
                note: draft.substring(0, 100),
                date: new Date(),
            });
            await db.contacts.update(activeContact.id!, {
                lastContacted: new Date(),
            });
        } catch (error) {
            console.error('Failed to log interaction:', error);
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

        // Trigger navigation first
        window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(draft)}`;

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

        // Trigger navigation first
        window.location.href = `mailto:${email}?subject=💕 A little note for you&body=${encodeURIComponent(draft)}`;

        celebrate();
        await logInteraction('email');

        setTimeout(() => {
            setEngineOpen(false);
            setDraft('');
        }, 500);
    };

    const handleSetReminder = async () => {
        if (!activeContact) return;

        // Request notification permission
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                // Calculate time until reminder
                const [hours, minutes] = reminderTime.split(':').map(Number);
                const now = new Date();
                const reminderDate = new Date();
                reminderDate.setHours(hours, minutes, 0, 0);

                // If time has passed today, set for tomorrow
                if (reminderDate <= now) {
                    reminderDate.setDate(reminderDate.getDate() + 1);
                }

                const msUntilReminder = reminderDate.getTime() - now.getTime();

                // Schedule the notification
                setTimeout(() => {
                    new Notification(`Time to water ${activeContact.name}! 💕`, {
                        body: 'Send them a loving message',
                        icon: '/icon-192.png',
                        tag: `reminder-${activeContact.id}`,
                    });
                }, msUntilReminder);

                toast.success(`Reminder set for ${reminderTime}! 🔔`);
                setShowReminder(false);
            } else {
                toast.error("Please enable notifications in your browser");
            }
        } else {
            toast.error("Notifications not supported in this browser");
        }
    };

    if (!activeContact) return null;

    return (
        <Drawer open={isEngineOpen} onOpenChange={setEngineOpen}>
            <DrawerContent key={drawerKey} className="bg-white/95 backdrop-blur-2xl h-[95vh]">
                <div className="mx-auto w-full max-w-sm flex flex-col h-full overflow-hidden">
                    <DrawerHeader className="relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <DrawerTitle className="text-2xl font-bold text-left flex items-center gap-2">
                                    <Droplets className="w-5 h-5 text-blue-400" />
                                    Watering {activeContact.name}
                                </DrawerTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    {hasPhone && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">📱 SMS</span>}
                                    {hasEmail && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✉️ Email</span>}
                                    {!hasAnyContact && (
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⚠️ Add contact info</span>
                                    )}
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
                                        You'll get a notification to send a message at this time
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
                                Generate Echo
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
