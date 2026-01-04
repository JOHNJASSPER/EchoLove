'use client';

import { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose
} from '@/components/ui/drawer';
import { Plus, Cake, Sparkles, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function AddContactDrawer({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
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
        setOpen(false);
        setName('');
        setRelationship('');
        setPhoneNumber('');
        setEmail('');
        setBirthday('');
        setVibe('chill');
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
            <DrawerContent className="bg-white/95 backdrop-blur-xl h-[90vh]">
                <div className="mx-auto w-full max-w-sm overflow-y-auto">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-rose-500" />
                            Plant a new seed
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="p-4 space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/50 text-lg py-6"
                                placeholder="Mom, Partner, Bestie..."
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-green-500" />
                                Phone Number
                            </Label>
                            <Input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="bg-white/50"
                                placeholder="+1234567890"
                            />
                            <p className="text-xs text-gray-400">For SMS & WhatsApp</p>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500" />
                                Email
                            </Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/50"
                                placeholder="love@example.com"
                            />
                        </div>

                        {/* Relationship */}
                        <div className="space-y-2">
                            <Label>Relationship *</Label>
                            <Select onValueChange={setRelationship} value={relationship}>
                                <SelectTrigger className="bg-white/50">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="partner">Partner 💕</SelectItem>
                                    <SelectItem value="family">Family 👨‍👩‍👧</SelectItem>
                                    <SelectItem value="friend">Friend 👯</SelectItem>
                                    <SelectItem value="colleague">Colleague 💼</SelectItem>
                                    <SelectItem value="mentor">Mentor 🎓</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Birthday */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Cake className="w-4 h-4 text-rose-400" />
                                Birthday (Optional)
                            </Label>
                            <Input
                                type="date"
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className="bg-white/50"
                            />
                        </div>

                        {/* Vibe */}
                        <div className="space-y-2">
                            <Label>Default Vibe</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['sweet', 'chill', 'playful', 'deep'] as const).map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setVibe(v)}
                                        className={`py-2 rounded-xl border text-xs font-medium transition-all capitalize ${vibe === v
                                                ? 'bg-rose-500 text-white border-rose-500 shadow-lg'
                                                : 'bg-white border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DrawerFooter className="px-4 pb-10">
                        <Button
                            onClick={handleSave}
                            className="w-full bg-rose-500 h-12 text-lg rounded-2xl"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Plant Seed
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full rounded-2xl">
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
