import { useWebSocketContext } from "@/components/provider/websocket"
import { User } from "@/util/types/user"
import { useInterval } from "@chakra-ui/react"
import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { ReadyState } from "react-use-websocket"

export interface AppContextValue {
    users: User[]

    refetchUsers: () => void
}
export const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { sendMessage, lastMessage, readyState } = useWebSocketContext()

    const [users, setUsers] = useState<User[]>([])

    const refetchUsers = useCallback(() => {
        if (readyState === ReadyState.OPEN) sendMessage("users")
    }, [readyState, sendMessage])

    // Handle initial connection & `readyState` changes (i.e, on reconnect)
    // biome-ignore lint/correctness/useExhaustiveDependencies:
    useEffect(() => {
        refetchUsers()
    }, [readyState])

    useInterval(() => {
        if (readyState !== ReadyState.OPEN) return
        sendMessage("users")
    }, 30_000)

    // `lastMessage` handler
    useEffect(() => {
        if (lastMessage?.type === "users") {
            setUsers(lastMessage.users)
        }
    }, [lastMessage])

    const value: AppContextValue = {
        users: users,

        refetchUsers,
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
    const ctx = useContext(AppContext)
    if (ctx == null) throw new Error("useAppContext must be used within a AppProvider")

    return ctx
}
