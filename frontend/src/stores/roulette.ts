import { RouletteSpace } from "@/util/roulette"
import { User } from "@/util/types/user"
import { create } from "zustand"

export interface RouletteBet {
    space: RouletteSpace
    amount: number
}

export type RouletteGameState = {
    isBetsOpen: boolean
    isRolled: boolean

    dealer?: User

    bets: Record<User["ID"], RouletteBet[]>
}

export type RouletteGameActions = {
    setBetStatus: (isOpen: boolean) => void
    setIsRolled: (isRolled: boolean) => void

    setBets: (bets: RouletteGameState["bets"]) => void
    addBet: (user: User["ID"], bet: RouletteBet) => void
    removeBet: (user: User["ID"], space: RouletteSpace) => void

    setDealer: (dealer: User) => void

    computed: {
        currentTotalBets: number
    }

    reset: () => void
}

export const defaultRoundState: RouletteGameState = {
    isBetsOpen: true,
    isRolled: false,

    bets: {},
}

export const useRouletteGameStore = create<RouletteGameState & RouletteGameActions>()((set, get) => ({
    ...defaultRoundState,

    setBetStatus: (isOpen) => set({ isBetsOpen: isOpen }),
    setIsRolled: (isRolled) => set({ isRolled }),

    setBets: (bets) => set({ bets }),
    addBet: (user, bet) => {
        set((state) => {
            const bets = state.bets[user] ?? []
            return { bets: { ...state.bets, [user]: [...bets, bet] } }
        })
    },
    removeBet: (user, space) => {
        set((state) => {
            const bets = state.bets[user] ?? []
            return { bets: { ...state.bets, [user]: bets.filter((bet) => bet.space !== space) } }
        })
    },

    setDealer: (dealer) => set({ dealer }),

    computed: {
        get currentTotalBets() {
            const currentBets = Object.values(get().bets)
            return currentBets.reduce((acc, currentPlayerBets) => acc + currentPlayerBets.reduce((acc, bet) => acc + bet.amount, 0), 0)
        },
    },

    reset: () => set(defaultRoundState),
}))
