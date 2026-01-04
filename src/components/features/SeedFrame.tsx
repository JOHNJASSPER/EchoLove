'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SeedFrameProps {
    title: string;
    icon?: ReactNode;
    subtitle?: string;
    children: ReactNode;
    className?: string;
}

export function SeedFrame({ title, icon, subtitle, children, className }: SeedFrameProps) {
    return (
        <section className={cn("mb-6", className)}>
            <div className="flex items-center gap-2 mb-3 px-1">
                {icon && (
                    <div className="w-5 h-5 text-rose-500">
                        {icon}
                    </div>
                )}
                <div>
                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs text-gray-400">{subtitle}</p>
                    )}
                </div>
            </div>
            {children}
        </section>
    );
}
