'use client';

import { useAppStore } from '@/lib/store';
import { getUpcomingHolidays } from '@/lib/holidays';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export function CalendarDrawer() {
    const { isCalendarOpen, setCalendarOpen } = useAppStore();

    // Get holidays for the full year (365 days)
    const holidays = getUpcomingHolidays(365);

    return (
        <Drawer open={isCalendarOpen} onOpenChange={setCalendarOpen}>
            <DrawerContent className="bg-white/95 backdrop-blur-2xl h-[85vh]">
                <div className="mx-auto w-full max-w-sm flex flex-col h-full overflow-hidden">
                    <DrawerHeader>
                        <div className="flex items-center justify-between">
                            <DrawerTitle className="text-2xl font-bold flex items-center gap-2">
                                <CalendarIcon className="w-6 h-6 text-rose-500" />
                                Upcoming Magic
                            </DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 px-6 overflow-y-auto pb-8 space-y-4">
                        {holidays.map((holiday) => (
                            <div
                                key={holiday.id}
                                className="glass-card p-4 flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">
                                        {holiday.name.toLowerCase().includes('valentine') ? '💘' :
                                            holiday.name.toLowerCase().includes('christmas') ? '🎄' :
                                                holiday.name.toLowerCase().includes('halloween') ? '🎃' :
                                                    holiday.name.toLowerCase().includes('mother') ? '👩' :
                                                        holiday.name.toLowerCase().includes('father') ? '👨' :
                                                            '✨'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">{holiday.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(holiday.date), 'EEEE, MMMM do')}
                                    </p>
                                </div>
                                <div className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-lg whitespace-nowrap">
                                    In {Math.ceil((new Date(holiday.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                </div>
                            </div>
                        ))}

                        {holidays.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                <Sparkles className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p>No holidays found upcoming.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
