'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGoogle, signInAsGuest, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            toast.success("Welcome to EchoLove! 🌱");
            router.push('/garden');
        } catch (error) {
            toast.error("Sign in failed. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestSignIn = async () => {
        setIsLoading(true);
        try {
            await signInAsGuest();
            toast.success("Welcome, Guest! 🌱");
            router.push('/garden');
        } catch (error) {
            toast.error("Guest sign in failed. Please try again.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="w-16 h-16 bg-rose-500 rounded-2xl animate-pulse flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" fill="white" />
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 relative overflow-hidden">
            {/* Decorative Aurora */}
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-sm mx-auto px-6 py-20 relative z-10 flex flex-col items-center justify-center min-h-screen">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl shadow-xl shadow-rose-500/30 mb-6">
                        <Heart className="w-10 h-10 text-white" fill="white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                        Echo<span className="gradient-text">Love</span>
                    </h1>
                    <p className="text-gray-500 mt-2">Nurture your relationships</p>
                </motion.div>

                {/* Auth Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full space-y-4"
                >
                    {/* Google Sign In */}
                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full h-14 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-base font-medium"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-sm text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Guest Sign In */}
                    <Button
                        onClick={handleGuestSignIn}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-base"
                    >
                        <User className="w-5 h-5" />
                        Continue as Guest
                    </Button>

                    <p className="text-center text-xs text-gray-400 pt-4">
                        Guest data stays on this device only.<br />
                        Sign in with Google to sync across devices.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
