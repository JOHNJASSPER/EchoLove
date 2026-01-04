'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocalAuth } from '@/lib/local-auth';
import { Heart } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated } = useLocalAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Allow public access to login
        if (pathname === '/login') {
            setIsChecking(false);
            return;
        }

        // Check authentication
        // We use a small timeout to allow hydration to settle/persist to load
        const checkAuth = () => {
            if (!isAuthenticated) {
                router.replace('/login');
            } else {
                setIsChecking(false);
            }
        };

        checkAuth();

    }, [pathname, isAuthenticated, router]);

    // If on login page, render children immediately (Login page handles its own state)
    if (pathname === '/login') {
        return <>{children}</>;
    }

    if (isChecking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="w-16 h-16 bg-rose-500 rounded-2xl animate-pulse flex items-center justify-center">
                    <Heart className="w-8 h-8 text-white" fill="white" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
