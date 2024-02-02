import { RouletteSpace } from "@/util/roulette"
import { User } from "@/util/types/user"
import { create } from "zustand"

export type ProposedBetState = {
    // Dillema: Should we store UserID or whole user object?
    targetUser?: User
    betSpace?: RouletteSpace
    betAmount: number
}
export type ProposedBetAction = {
    setTargetUser: (user: User) => void
    setBetSpace: (space: RouletteSpace) => void
    setBetAmount: (amount: number) => void

    computed: {
        isSubmittable: boolean
    }
    reset: () => void
}

export const proposedBetInitialState: ProposedBetState = {
    targetUser: undefined,
    betSpace: undefined,
    betAmount: 0,
}

export const useProposedBetStore = create<ProposedBetState & ProposedBetAction>()((set, get) => ({
    ...proposedBetInitialState,

    setTargetUser: (user) => {
        set({ targetUser: user })
    },
    setBetSpace: (space) => {
        set({ betSpace: space })
    },
    setBetAmount: (amount) => {
        set({ betAmount: amount })
    },

    computed: {
        get isSubmittable() {
            return get().targetUser !== undefined && get().betSpace !== undefined && get().betAmount > 0
        },
    },

    reset: () => {
        useProposedBetStore.setState(proposedBetInitialState)
    },
}))
