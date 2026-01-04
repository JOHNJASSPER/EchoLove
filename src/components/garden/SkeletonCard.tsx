'use client';

import { cn } from '@/lib/utils';

interface SkeletonCardProps {
    className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
    return (
        <div
            className={cn(
                "relative w-full aspect-[4/5] rounded-3xl overflow-hidden glass-card",
                className
            )}
        >
            {/* Avatar skeleton */}
            <div className="absolute top-5 left-5 w-10 h-10 rounded-full shimmer" />

            {/* Health indicator skeleton */}
            <div className="absolute top-5 right-5 w-3 h-3 rounded-full shimmer" />

            {/* Content skeleton */}
            <div className="absolute bottom-5 left-5 right-5 space-y-2">
                <div className="h-5 w-24 rounded shimmer" />
                <div className="h-3 w-16 rounded shimmer" />
                <div className="h-2 w-20 rounded shimmer mt-1" />
            </div>
        </div>
    );
}

export function SkeletonGrid() {
    return (
        <div className="grid grid-cols-2 gap-4 pb-32">
            {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
