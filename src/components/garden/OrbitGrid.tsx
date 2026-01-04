'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { PlantCard } from './PlantCard';
import { SkeletonGrid } from './SkeletonCard';
import { Plus, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export function OrbitGrid() {
    const contacts = useLiveQuery(() => db.contacts.toArray());
    const setActiveContact = useAppStore((state) => state.setActiveContact);
    const setEngineOpen = useAppStore((state) => state.setEngineOpen);
    const setEventContext = useAppStore((state) => state.setEventContext);

    if (contacts === undefined) {
        return <SkeletonGrid />;
    }

    if (contacts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6"
            >
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-rose-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Your Garden is Empty</h2>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                        Tap the <span className="text-rose-500 font-semibold">+</span> button to plant your first seed.
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4 pb-32"
        >
            <AnimatePresence>
                {contacts.map((contact, index) => (
                    <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: { delay: index * 0.05 }
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <PlantCard
                            contact={contact}
                            onClick={() => {
                                setEventContext(null); // Clear any previous context
                                setActiveContact(contact);
                                setEngineOpen(true);
                            }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
