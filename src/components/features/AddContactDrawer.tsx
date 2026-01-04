'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose
} from '@/components/ui/drawer';
import { Plus, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const RELATIONSHIPS = [
    { value: 'partner', label: 'Partner', emoji: '💕' },
    { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
    { value: 'friend', label: 'Friend', emoji: '👯' },
    { value: 'colleague', label: 'Colleague', emoji: '💼' },
    { value: 'mentor', label: 'Mentor', emoji: '🎓' },
];

const VIBES = [
    { value: 'sweet', label: 'Sweet', emoji: '🥰' },
    { value: 'chill', label: 'Chill', emoji: '😎' },
    { value: 'playful', label: 'Playful', emoji: '🎉' },
    { value: 'deep', label: 'Deep', emoji: '💭' },
];

export function AddContactDrawer({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [showOptional, setShowOptional] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [vibe, setVibe] = useState('chill');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [birthday, setBirthday] = useState('');

    const handleSave = async () => {
        if (!name || !relationship) {
            toast.error("Please fill in name and relationship");
            return;
        }

        if (!phoneNumber && !email) {
            toast.error("Add a phone number or email to send messages");
            return;
        }

        await db.contacts.add({
            name,
            relationship,
            vibe: vibe as 'sweet' | 'chill' | 'deep' | 'playful',
            phoneNumber: phoneNumber || undefined,
            email: email || undefined,
            birthday: birthday || undefined,
            lastContacted: new Date(),
            createdAt: new Date(),
            frequencyDays: 7
        });

        toast.success("Planted in your garden! 🌱");
        resetAndClose();
    };

    const resetAndClose = () => {
        setOpen(false);
        setStep(1);
        setName('');
        setRelationship('');
        setPhoneNumber('');
        setEmail('');
        setBirthday('');
        setVibe('chill');
        setShowOptional(false);
    };

    const goNext = () => {
        if (step === 1 && !name) {
            toast.error("What's their name?");
            return;
        }
        if (step === 2 && !relationship) {
            toast.error("Pick a relationship type");
            return;
        }
        setStep(step + 1);
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children || (
                    <Button size="icon" className="rounded-full h-14 w-14 bg-rose-500 shadow-xl">
                        <Plus className="text-white" />
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="bg-white/95 backdrop-blur-xl">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-bold text-center">
                            <Sparkles className="w-5 h-5 text-rose-500 inline mr-2" />
                            Plant a Seed
                        </DrawerTitle>
                        {/* Progress dots */}
                        <div className="flex justify-center gap-2 mt-3">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`w-2 h-2 rounded-full transition-all ${s === step ? 'bg-rose-500 w-6' : s < step ? 'bg-rose-300' : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </DrawerHeader>

                    <div className="p-6 min-h-[280px]">
                        <AnimatePresence mode="wait">
                            {/* STEP 1: Name */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <Label className="text-lg font-medium text-gray-700">
                                        Who do you want to stay connected with?
                                    </Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-white/50 text-xl py-6 text-center"
                                        placeholder="Mom, Sarah, Bestie..."
                                        autoFocus
                                    />
                                </motion.div>
                            )}

                            {/* STEP 2: Relationship */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <Label className="text-lg font-medium text-gray-700">
                                        How do you know {name}?
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {RELATIONSHIPS.map((rel) => (
                                            <button
                                                key={rel.value}
                                                onClick={() => setRelationship(rel.value)}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all ${relationship === rel.value
                                                        ? 'border-rose-500 bg-rose-50'
                                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className="text-2xl">{rel.emoji}</span>
                                                <p className="font-medium mt-1">{rel.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: Contact Info + Extras */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <Label className="text-lg font-medium text-gray-700">
                                        How do you reach {name}?
                                    </Label>

                                    <Input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="bg-white/50 py-5"
                                        placeholder="📱 Phone number"
                                    />

                                    <div className="text-center text-gray-400 text-sm">or</div>

                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white/50 py-5"
                                        placeholder="✉️ Email address"
                                    />

                                    {/* Optional Section */}
                                    <button
                                        onClick={() => setShowOptional(!showOptional)}
                                        className="flex items-center gap-2 text-sm text-gray-500 mx-auto mt-4"
                                    >
                                        More options
                                        {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>

                                    <AnimatePresence>
                                        {showOptional && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="space-y-4 overflow-hidden"
                                            >
                                                <div className="space-y-2">
                                                    <Label className="text-sm text-gray-500">Birthday</Label>
                                                    <Input
                                                        type="date"
                                                        value={birthday}
                                                        onChange={(e) => setBirthday(e.target.value)}
                                                        className="bg-white/50"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm text-gray-500">Default Vibe</Label>
                                                    <div className="flex gap-2">
                                                        {VIBES.map((v) => (
                                                            <button
                                                                key={v.value}
                                                                onClick={() => setVibe(v.value)}
                                                                className={`flex-1 py-2 rounded-xl text-sm transition-all ${vibe === v.value
                                                                        ? 'bg-rose-500 text-white'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                    }`}
                                                            >
                                                                {v.emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <DrawerFooter className="px-6 pb-8">
                        <div className="flex gap-3">
                            {step > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(step - 1)}
                                    className="flex-1 rounded-2xl"
                                >
                                    Back
                                </Button>
                            )}
                            {step < 3 ? (
                                <Button
                                    onClick={goNext}
                                    className="flex-1 bg-rose-500 rounded-2xl h-12"
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-rose-500 rounded-2xl h-12"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Plant Seed
                                </Button>
                            )}
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full text-gray-400">
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
