import { create } from "zustand";

interface DealerUIState {
    isClockingIn: boolean;
    setClockingIn: (passed: boolean) => void;
}

const useDealerUIStore = create<DealerUIState>((set) => ({
    isClockingIn: false,
    setClockingIn: (isClockingIn: boolean) => set({ isClockingIn })
}))

export { useDealerUIStore };
