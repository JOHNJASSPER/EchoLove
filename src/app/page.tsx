'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { Heart, Sparkles, MessageSquare, Bell, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/garden');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl animate-pulse flex items-center justify-center">
          <Heart className="w-8 h-8 text-white" fill="white" />
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Decorative Aurora */}
      <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[40%] left-[-20%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[300px] h-[300px] bg-violet-100/30 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-lg mx-auto px-6 py-16 relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl shadow-xl shadow-rose-500/30 mb-4">
            <Heart className="w-10 h-10 text-white" fill="white" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Echo<span className="gradient-text">Love</span>
          </h1>

          <p className="text-xl text-gray-600 font-medium">
            Your Digital Garden for nurturing relationships
          </p>

          <p className="text-gray-500 max-w-sm mx-auto">
            AI-powered love notes, reminders to connect, and a beautiful way to stay close to the people who matter most.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-16"
        >
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-rose-500" />}
            title="AI-Powered Messages"
            description="Generate heartfelt messages in seconds with the perfect tone"
          />
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6 text-emerald-500" />}
            title="Multi-Channel Sending"
            description="Send via SMS, WhatsApp, or Email with one tap"
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6 text-violet-500" />}
            title="Smart Reminders"
            description="Never forget to reach out with gentle notifications"
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <Link
            href="/login"
            className="block w-full py-4 bg-rose-500 text-white text-center text-lg font-semibold rounded-2xl shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            Get Started
            <ArrowRight className="inline ml-2 w-5 h-5" />
          </Link>

          <p className="text-center text-sm text-gray-400">
            Free forever • No credit card required
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card p-5 flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
