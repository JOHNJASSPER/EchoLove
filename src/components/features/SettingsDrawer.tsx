'use client';

import { useState } from 'react';
import {
    Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose, DrawerTrigger
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, X, Key, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db';

export function SettingsDrawer() {
    const [open, setOpen] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleClearData = async () => {
        try {
            await db.contacts.clear();
            await db.interactions.clear();
            await db.drafts.clear();
            toast.success("All data cleared");
            setShowClearConfirm(false);
            setOpen(false);
        } catch {
            toast.error("Failed to clear data");
        }
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <button
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                    aria-label="Settings"
                >
                    <Settings className="w-5 h-5 text-gray-600" />
                </button>
            </DrawerTrigger>
            <DrawerContent className="bg-white/95 backdrop-blur-2xl">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <div className="flex items-center justify-between">
                            <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Settings
                            </DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>

                    {showClearConfirm ? (
                        <div className="px-6 py-8 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Clear All Data?</h3>
                            <p className="text-gray-500 text-sm">
                                This will permanently delete all your contacts and interaction history.
                            </p>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowClearConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleClearData}
                                >
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 space-y-6">
                                {/* About Section */}
                                <div className="glass-card p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-rose-500" />
                                        <h3 className="font-bold text-gray-800">EchoLove</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Your Digital Garden for nurturing relationships. All data stays on your device.
                                    </p>
                                    <p className="text-xs text-gray-400">Version 1.0.0</p>
                                </div>

                                {/* AI Configuration */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Key className="w-4 h-4" />
                                        AI Configuration
                                    </h4>
                                    <div className="glass-card p-4 space-y-3">
                                        <p className="text-sm text-gray-600">
                                            EchoLove uses Groq AI (free!) for message generation.
                                        </p>
                                        <a
                                            href="https://console.groq.com/keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
                                        >
                                            Get your free API key
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <p className="text-xs text-gray-400">
                                            API key is configured in .env.local file
                                        </p>
                                    </div>
                                </div>

                                {/* Data Management */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                                        <Trash2 className="w-4 h-4" />
                                        Data Management
                                    </h4>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowClearConfirm(true)}
                                        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear All Data
                                    </Button>
                                </div>
                            </div>

                            <DrawerFooter className="px-6 pb-10 pt-6">
                                <DrawerClose asChild>
                                    <Button variant="outline" className="w-full rounded-xl">
                                        Done
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
