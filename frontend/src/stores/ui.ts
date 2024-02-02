import { create } from "zustand";

interface UIManager {
    errorMessage?: string;
    setErrorMessage: (message?: string) => void;

    viewingProfile: boolean;
    setViewingProfile: (passed: boolean) => void;
}

interface LoginUIManager {
    errored: boolean;
    error: string;
    setError: (error: string) => void;
}

const useUIManager = create<UIManager>((set) => ({
    errorMessage: undefined,
    setErrorMessage: (errorMessage: string | undefined) => set({ errorMessage }),

    viewingProfile: false,
    setViewingProfile: (viewingProfile: boolean) => set({ viewingProfile })
}))

export { useUIManager };
