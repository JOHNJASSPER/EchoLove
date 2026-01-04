import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocalAuthState {
    username: string | null;
    hashedPin: string | null;
    isAuthenticated: boolean;
    signup: (username: string, pin: string) => void;
    login: (pin: string) => boolean;
    logout: () => void;
}

export const useLocalAuth = create<LocalAuthState>()(
    persist(
        (set, get) => ({
            username: null,
            hashedPin: null,
            isAuthenticated: false,

            signup: (username, pin) => {
                // In a real app, we'd hash this properly (e.g. bcrypt). 
                // For a personal PWA, simple storage is acceptable but we treat it as "sensitive".
                set({ username, hashedPin: pin, isAuthenticated: true });
            },

            login: (pin) => {
                const { hashedPin } = get();
                if (pin === hashedPin) {
                    set({ isAuthenticated: true });
                    return true;
                }
                return false;
            },

            logout: () => set({ isAuthenticated: false }),
        }),
        {
            name: 'echolove-auth',
            partialize: (state) => ({ username: state.username, hashedPin: state.hashedPin }), // Don't persist 'isAuthenticated'
        }
    )
);
