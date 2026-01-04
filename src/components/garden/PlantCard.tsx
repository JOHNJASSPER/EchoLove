'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Contact } from '@/lib/db';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditContactDrawer } from '@/components/features/EditContactDrawer';
import { MoreVertical } from 'lucide-react';

interface PlantCardProps {
    contact: Contact;
    onClick: () => void;
}

export function PlantCard({ contact, onClick }: PlantCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Wilting Logic: If > 7 days, opacity drops
    const daysSince = contact.lastContacted
        ? differenceInDays(new Date(), contact.lastContacted)
        : 0;

    const health = Math.max(0, 100 - (daysSince * 10));
    const isWilting = health < 50;

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditOpen(true);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Only trigger if not clicking the edit button
        if ((e.target as HTMLElement).closest('[data-edit-button]')) return;
        onClick();
    };

    return (
        <>
            {/* Changed from motion.button to motion.div to fix hydration error */}
            <motion.div
                layoutId={`card-${contact.id}`}
                onClick={handleCardClick}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    y: isWilting ? 0 : [0, -4, 0]
                }}
                transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className={cn(
                    "relative w-full aspect-[4/5] rounded-3xl overflow-hidden border-2 transition-all duration-500 cursor-pointer",
                    isWilting
                        ? "opacity-60 border-gray-300 grayscale bg-gray-100 shadow-md"
                        : contact.vibe === 'sweet' ? "border-rose-200 shadow-2xl shadow-rose-200/60 bg-gradient-to-br from-rose-50 to-orange-50"
                            : contact.vibe === 'chill' ? "border-teal-200 shadow-2xl shadow-teal-200/60 bg-gradient-to-br from-blue-50 to-emerald-50"
                                : contact.vibe === 'deep' ? "border-violet-200 shadow-2xl shadow-violet-200/60 bg-gradient-to-br from-indigo-50 to-purple-50"
                                    : "border-amber-200 shadow-2xl shadow-amber-200/60 bg-gradient-to-br from-yellow-50 to-pink-50"
                )}
            >
                {/* Background Gradient Overlay based on Vibe */}
                <div className={cn(
                    "absolute inset-0 opacity-60 bg-gradient-to-br",
                    contact.vibe === 'sweet' ? "from-rose-200/80 to-orange-100/60" :
                        contact.vibe === 'chill' ? "from-cyan-200/80 to-emerald-100/60" :
                            contact.vibe === 'deep' ? "from-indigo-200/80 to-purple-100/60" :
                                "from-amber-200/80 to-pink-100/60"
                )} />

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between items-start text-left">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg",
                        contact.vibe === 'sweet' ? "bg-white/70 text-rose-600" :
                            contact.vibe === 'chill' ? "bg-white/70 text-teal-600" :
                                contact.vibe === 'deep' ? "bg-white/70 text-violet-600" :
                                    "bg-white/70 text-amber-600"
                    )}>
                        <span className="text-xl font-bold">{contact.name.charAt(0)}</span>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-800 leading-tight">
                            {contact.name}
                        </h3>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mt-1">
                            {contact.relationship}
                        </p>
                        {/* Always show watering status */}
                        <p className="text-[10px] text-gray-400 mt-1">
                            {daysSince === 0
                                ? '💧 Freshly watered'
                                : daysSince === 1
                                    ? '💧 Watered yesterday'
                                    : `💧 ${daysSince} days ago`}
                        </p>
                    </div>

                    {/* Health Indicator & Edit Button */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button
                            data-edit-button
                            onClick={handleEditClick}
                            className="p-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                            aria-label="Edit contact"
                        >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                        {isWilting ? (
                            <span className="flex h-3 w-3 rounded-full bg-gray-300" />
                        ) : (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            <EditContactDrawer
                contact={contact}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    );
}
