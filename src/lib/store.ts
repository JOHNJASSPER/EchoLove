import { create } from 'zustand';
import { Contact } from './db';

export type EventContext = 'birthday' | 'holiday' | 'motivation' | null;

interface AppState {
    activeContact: Contact | null;
    setActiveContact: (contact: Contact | null) => void;
    isEngineOpen: boolean;
    setEngineOpen: (open: boolean) => void;
    isSettingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
    isCalendarOpen: boolean;
    setCalendarOpen: (open: boolean) => void;
    eventContext: EventContext;
    setEventContext: (context: EventContext) => void;
    holidayName: string | null;
    setHolidayName: (name: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
    activeContact: null,
    setActiveContact: (contact) => set({ activeContact: contact }),
    isEngineOpen: false,
    setEngineOpen: (open) => set({ isEngineOpen: open }),
    isSettingsOpen: false,
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    isCalendarOpen: false,
    setCalendarOpen: (open) => set({ isCalendarOpen: open }),
    eventContext: null,
    setEventContext: (context) => set({ eventContext: context }),
    holidayName: null,
    setHolidayName: (name) => set({ holidayName: name }),
}));
