import { create } from 'zustand';
import { Contact } from './db';

interface AppState {
    activeContact: Contact | null;
    setActiveContact: (contact: Contact | null) => void;
    isEngineOpen: boolean;
    setEngineOpen: (open: boolean) => void;
    isSettingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    activeContact: null,
    setActiveContact: (contact) => set({ activeContact: contact }),
    isEngineOpen: false,
    setEngineOpen: (open) => set({ isEngineOpen: open }),
    isSettingsOpen: false,
    setSettingsOpen: (open) => set({ isSettingsOpen: open }),
}));
