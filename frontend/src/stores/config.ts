import { create } from "zustand";

type ConfigStore = {
    registrationEnabled: boolean;
}

const useConfig = create<ConfigStore>((set) => ({
    registrationEnabled: true,
    setRegistrationEnabled: (enabled: boolean) => set({ registrationEnabled: enabled })
}))

export { useConfig };
