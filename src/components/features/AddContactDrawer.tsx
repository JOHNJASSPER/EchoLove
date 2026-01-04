'use client';

import { useState, useEffect } from 'react';
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

const VIBES = ['Sweet', 'Chill', 'Playful', 'Deep'];

export function AddContactDrawer({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [showOptional, setShowOptional] = useState(false);

    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [vibe, setVibe] = useState('chill');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [birthday, setBirthday] = useState('');

    useEffect(() => {
        if (!open) {
            setStep(1);
            setName('');
            setRelationship('');
            setPhoneNumber('');
            setEmail('');
            setBirthday('');
            setVibe('chill');
            setShowOptional(false);
        }
    }, [open]);

    const handleSave = async () => {
        if (!name || !relationship) {
            toast.error("Please fill in name and relationship");
            return;
        }
        if (!phoneNumber && !email) {
            toast.error("Add a phone number or email");
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
        setOpen(false);
    };

    const goNext = () => {
        if (step === 1 && !name) { toast.error("What's their name?"); return; }
        if (step === 2 && !relationship) { toast.error("Pick a relationship"); return; }
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
            <DrawerContent className="bg-white backdrop-blur-xl">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="py-3">
                        <DrawerTitle className="text-lg font-bold text-center">
                            <Sparkles className="w-4 h-4 text-rose-500 inline mr-1" />
                            Plant a Seed
                        </DrawerTitle>
                        <div className="flex justify-center gap-1.5 mt-1">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'bg-rose-500 w-5' : s < step ? 'bg-rose-300 w-1.5' : 'bg-gray-200 w-1.5'}`} />
                            ))}
                        </div>
                    </DrawerHeader>

                    <div className="px-4 py-2">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                                    <Label className="text-sm text-gray-600 block text-center">Who do you want to stay connected with?</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white text-base py-4 text-center" placeholder="Mom, Sarah, Bestie..." autoFocus />
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                                    <Label className="text-sm text-gray-600 block text-center">How do you know {name}?</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {RELATIONSHIPS.map((rel) => (
                                            <button key={rel.value} onClick={() => setRelationship(rel.value)} className={`p-2 rounded-xl border-2 text-center transition-all ${relationship === rel.value ? 'border-rose-500 bg-rose-50' : 'border-gray-100 bg-white'}`}>
                                                <span className="text-lg">{rel.emoji}</span>
                                                <p className="text-[10px] font-medium mt-0.5">{rel.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                                    <Label className="text-sm text-gray-600 block text-center">How do you reach {name}?</Label>
                                    <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-white py-3" placeholder="📱 Phone number" />
                                    <div className="text-center text-gray-400 text-[10px]">or</div>
                                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white py-3" placeholder="✉️ Email address" />

                                    <button onClick={() => setShowOptional(!showOptional)} className="flex items-center gap-1 text-[11px] text-gray-400 mx-auto pt-1">
                                        More options {showOptional ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>

                                    {showOptional && (
                                        <div className="space-y-2 pt-1">
                                            <div>
                                                <Label className="text-[10px] text-gray-400">Birthday</Label>
                                                <Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="bg-white py-2 text-sm" />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-gray-400">Default Vibe</Label>
                                                <div className="flex gap-1">
                                                    {VIBES.map((v) => (
                                                        <button key={v} onClick={() => setVibe(v.toLowerCase())} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium ${vibe === v.toLowerCase() ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{v}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <DrawerFooter className="px-4 pt-2 pb-4">
                        <div className="flex gap-2">
                            {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl h-10">Back</Button>}
                            {step < 3 ? (
                                <Button onClick={goNext} className="flex-1 bg-rose-500 rounded-xl h-10">Next</Button>
                            ) : (
                                <Button onClick={handleSave} className="flex-1 bg-rose-500 rounded-xl h-10">
                                    <Sparkles className="w-3 h-3 mr-1" /> Plant Seed
                                </Button>
                            )}
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full text-gray-400 text-xs h-8">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
