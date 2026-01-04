'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { OrbitGrid } from '@/components/garden/OrbitGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { AddContactDrawer } from '@/components/features/AddContactDrawer';
import { EchoEngineDrawer } from '@/components/features/EchoEngineDrawer';
import { PulseTimeline } from '@/components/features/PulseTimeline';
import { SettingsDrawer } from '@/components/features/SettingsDrawer';
import { Plus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GardenPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl animate-pulse flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-white" fill="white" />
                    </div>
                    <p className="text-gray-500">Loading your garden...</p>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 pb-32 relative overflow-hidden">
            {/* Decorative Aurora */}
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute top-[10%] left-[-20%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-10%] w-[300px] h-[300px] bg-violet-100/30 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-md mx-auto px-6 pt-12 relative z-10">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Echo<span className="gradient-text">Love</span>
                        </h1>
                        <p className="text-sm text-gray-500 font-medium tracking-wide">
                            {user.isAnonymous ? 'Guest Garden' : 'Your Digital Garden'}
                        </p>
                    </div>
                    <SettingsDrawer />
                </header>

                {/* The Pulse - Upcoming Events */}
                <PulseTimeline />

                {/* The Garden */}
                <OrbitGrid />

                {/* Floating Action Button (FAB) */}
                <div className="fixed bottom-24 right-6 z-40">
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

                {/* Navigation */}
                <BottomNav />
            </div>
        </main>
    );
}
