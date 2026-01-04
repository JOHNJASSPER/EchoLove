'use client';

import { useLocalAuth } from '@/lib/local-auth';
import { useAppStore } from '@/lib/store';
import { OrbitGrid } from '@/components/garden/OrbitGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { AddContactDrawer } from '@/components/features/AddContactDrawer';
import { EchoEngineDrawer } from '@/components/features/EchoEngineDrawer';
import { PulseTimeline } from '@/components/features/PulseTimeline';
import { SettingsDrawer } from '@/components/features/SettingsDrawer';
import { EventBanner } from '@/components/features/EventBanner';
import { SeedFrame } from '@/components/features/SeedFrame';
import { CalendarDrawer } from '@/components/features/CalendarDrawer';
import { RemindersDrawer } from '@/components/features/RemindersDrawer';
import { Plus, Sparkles, Leaf, Calendar } from 'lucide-react';

export default function GardenPage() {
    const { username } = useLocalAuth();
    const { setCalendarOpen } = useAppStore();

    return (
        <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 pb-32 relative overflow-hidden">
            {/* Decorative Aurora */}
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-[10%] left-[-20%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[300px] h-[300px] bg-violet-100/30 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-md mx-auto px-6 pt-12 relative z-10">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Echo<span className="gradient-text">Love</span>
                        </h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">
                            {username ? `${username}'s Garden` : 'Your Digital Garden'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCalendarOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <Calendar className="w-5 h-5 text-gray-600" />
                        </button>
                        <RemindersDrawer />
                        <SettingsDrawer />
                    </div>
                </header>

                {/* Event Banner - Shows when there's a special day */}
                <EventBanner />

                {/* The Pulse - Upcoming Events */}
                <SeedFrame title="The Pulse" icon={<Sparkles className="w-4 h-4" />}>
                    <PulseTimeline />
                </SeedFrame>

                {/* The Garden */}
                <SeedFrame title="Your Garden" icon={<Leaf className="w-4 h-4" />} subtitle="Tap a seed to water it">
                    <div id="garden-grid">
                        <OrbitGrid />
                    </div>
                </SeedFrame>

                {/* Floating Action Button (FAB) */}
                <div className="fixed bottom-28 right-6 z-40">
                    <AddContactDrawer>
                        <button
                            aria-label="Add new contact"
                            title="Add new contact"
                            className="h-14 w-14 rounded-full bg-rose-500 shadow-xl shadow-rose-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="h-7 w-7 text-white" />
                        </button>
                    </AddContactDrawer>
                </div>

                {/* The Engine (Hidden until triggered) */}
                <EchoEngineDrawer />

                {/* Calendar Drawer */}
                <CalendarDrawer />

                {/* Navigation */}
                <BottomNav />
            </div>
        </main>
    );
}
