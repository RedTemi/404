import { create } from "zustand";

interface TurnstileState {
    passed: boolean;
    setPassed: (passed: boolean) => void;
}

const useSecureStore = create<TurnstileState>((set) => ({
    passed: false,
    setPassed: (passed: boolean) => set({ passed })
}))

export { useSecureStore };
