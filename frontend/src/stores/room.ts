import { create } from "zustand"
import { type User } from "../util/types/user"

// Zustand Reset pattern: https://docs.pmnd.rs/zustand/guides/how-to-reset-state

type RoomState = {
    roomId?: number

    /**
     * All user excluding current dealer in the room
     */
    roommates: User[]
    /**
     * All user who have been kicked from the room.
     * This is used to prevent them from rejoining.
     */
    kickedUsers: User["ID"][]

    isInviteModalOpen: boolean
}
type RoomActions = {
    setRoomId: (roomId: number | undefined) => void

    setRoommates: (members: User[]) => void
    removeRoommate: (userId: number) => void

    addKickedUser: (userId: number) => void

    setInviteModalOpen: (isInviteModalOpen: boolean) => void

    reset: () => void
}

const initialState: RoomState = {
    roomId: undefined,

    roommates: [],
    kickedUsers: [],

    isInviteModalOpen: false,
}

export const useRoomStateStore = create<RoomState & RoomActions>()((set, get) => ({
    ...initialState,

    setRoomId: (roomId) => {
        set({ roomId: roomId })
    },

    setRoommates: (members) => {
        set({ roommates: members })
    },
    removeRoommate: (userId) => {
        const roomates = get().roommates
        set({ roommates: roomates.filter((u) => u.ID !== userId) })
    },

    addKickedUser: (userId) => {
        const kickedUser = get().kickedUsers
        set({ kickedUsers: [...kickedUser, userId] })
    },

    setInviteModalOpen: (isInviteModalOpen) => set({ isInviteModalOpen }),

    reset: () => set(initialState),
}))
