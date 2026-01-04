'use client';

import { useState } from 'react';
import { Contact, db } from '@/lib/db';
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Pencil, Trash2, X, Cake, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface EditContactDrawerProps {
    contact: Contact;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditContactDrawer({ contact, open, onOpenChange }: EditContactDrawerProps) {
    const [name, setName] = useState(contact.name);
    const [relationship, setRelationship] = useState(contact.relationship);
    const [vibe, setVibe] = useState<'sweet' | 'chill' | 'deep' | 'playful'>(contact.vibe);
    const [phoneNumber, setPhoneNumber] = useState(contact.phoneNumber || '');
    const [email, setEmail] = useState(contact.email || '');
    const [birthday, setBirthday] = useState(contact.birthday || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Name can't be empty");
            return;
        }

        try {
            if (!contact.id) throw new Error("Contact ID missing");
            await db.contacts.update(contact.id, {
                name: name.trim(),
                relationship,
                vibe,
                phoneNumber: phoneNumber || undefined,
                email: email || undefined,
                birthday: birthday || undefined,
            });
            toast.success("Contact updated!");
            onOpenChange(false);
        } catch {
            toast.error("Failed to update contact");
        }
    };

    const handleDelete = async () => {
        try {
            if (!contact.id) return;
            await db.contacts.delete(contact.id);
            toast.success(`${contact.name} removed from your garden`);
            onOpenChange(false);
        } catch {
            toast.error("Failed to delete contact");
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-white/95 backdrop-blur-2xl h-[90vh]">
                <div className="mx-auto w-full max-w-sm overflow-y-auto">
                    <DrawerHeader>
                        <div className="flex items-center justify-between">
                            <DrawerTitle className="text-xl font-bold">
                                Edit {contact.name}
                            </DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>

                    {showDeleteConfirm ? (
                        <div className="px-6 py-8 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Remove {contact.name}?
                            </h3>
                            <p className="text-gray-500 text-sm">
                                This will permanently remove them from your garden.
                            </p>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleDelete}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Their name"
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
                                        placeholder="+1234567890"
                                    />
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
                                        placeholder="love@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Relationship</Label>
                                    <Select value={relationship} onValueChange={setRelationship}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white z-[60]">
                                            <SelectItem value="partner">Partner 💕</SelectItem>
                                            <SelectItem value="family">Family 👨‍👩‍👧</SelectItem>
                                            <SelectItem value="friend">Friend 👯</SelectItem>
                                            <SelectItem value="colleague">Colleague 💼</SelectItem>
                                            <SelectItem value="mentor">Mentor 🎓</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Cake className="w-4 h-4 text-rose-400" />
                                        Birthday
                                    </Label>
                                    <Input
                                        type="date"
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Vibe</Label>
                                    <Select value={vibe} onValueChange={(v) => setVibe(v as typeof vibe)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white z-[60]">
                                            <SelectItem value="sweet">Sweet 🍬</SelectItem>
                                            <SelectItem value="chill">Chill 😎</SelectItem>
                                            <SelectItem value="playful">Playful 🎭</SelectItem>
                                            <SelectItem value="deep">Deep 🌊</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DrawerFooter className="px-6 pb-10 pt-6">
                                <Button
                                    onClick={handleSave}
                                    className="w-full bg-rose-500 h-12 rounded-xl"
                                >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove from Garden
                                </Button>
                            </DrawerFooter>
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
