'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocalAuth } from '@/lib/local-auth';

export default function LoginPage() {
    const router = useRouter();
    const { username, signup, login } = useLocalAuth();

    // If username exists, we are in "Login Mode", otherwise "Signup Mode"
    const isSignup = !username;

    const [formName, setFormName] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName || pin.length < 4) {
            toast.error("Please enter a name and at least 4 digit PIN");
            return;
        }
        setIsLoading(true);
        // Simulate delay for "security" feel
        setTimeout(() => {
            signup(formName, pin);
            toast.success(`Welcome to your Garden, ${formName}! 🌱`);
            router.push('/garden');
            setIsLoading(false);
        }, 800);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            const success = login(pin);
            if (success) {
                toast.success("Welcome back! 🌿");
                router.push('/garden');
            } else {
                toast.error("Incorrect PIN");
                setPin('');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 relative overflow-hidden flex items-center justify-center">
            {/* Decorative Aurora */}
            <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-sm w-full mx-auto px-6 relative z-10">
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
                    <p className="text-gray-500 mt-2">
                        {isSignup ? "Setup your secret garden" : `Welcome back, ${username}`}
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={isSignup ? handleSignup : handleLogin}
                    className="space-y-4"
                >
                    <AnimatePresence mode="popLayout">
                        {isSignup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                            >
                                <Input
                                    placeholder="Your Name"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    className="h-14 bg-white/50 text-lg px-4 rounded-2xl"
                                    required
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder={isSignup ? "Create a Secret PIN" : "Enter your PIN"}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            pattern="[0-9]*"
                            inputMode="numeric"
                            className="h-14 bg-white/50 text-lg px-4 rounded-2xl tracking-widest text-center"
                            maxLength={6}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg font-medium"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isSignup ? "Start Gardening" : "Unlock Garden"}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </Button>

                    <p className="text-center text-xs text-gray-400 pt-4 px-8 leading-relaxed">
                        Your garden data is stored securely on this device.
                        {isSignup && " Keep your PIN safe!"}
                    </p>
                </motion.form>
            </div>
        </main>
    );
}

