import { create } from "zustand";
import { AuthUser } from "@/types";

interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    setUser: (user: AuthUser | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: false, // NextAuth handles loading state
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: () => {
        // NextAuth handles logout
        set({ user: null, isLoading: false });
    },
}));
