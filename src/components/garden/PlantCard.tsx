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
                    "relative w-full aspect-[4/5] rounded-3xl overflow-hidden border transition-all duration-500 cursor-pointer",
                    isWilting
                        ? "glass opacity-70 border-gray-200 grayscale-[0.5]"
                        : "glass-card border-white/60 shadow-lg shadow-rose-500/10"
                )}
            >
                {/* Background Gradient based on Vibe */}
                <div className={cn(
                    "absolute inset-0 opacity-20 bg-gradient-to-br",
                    contact.vibe === 'sweet' ? "from-rose-400 to-orange-300" :
                        contact.vibe === 'chill' ? "from-blue-300 to-green-200" :
                            contact.vibe === 'deep' ? "from-indigo-400 to-purple-300" :
                                "from-yellow-300 to-pink-300"
                )} />

                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between items-start text-left">
                    <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-gray-700 backdrop-blur-sm">
                        <span className="text-lg font-bold">{contact.name.charAt(0)}</span>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 leading-tight">
                            {contact.name}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">
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
