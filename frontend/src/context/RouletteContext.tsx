import { JoinRequestToast } from "@/app/(app)/game/components/dealer/JoinRequestToast"
import { useWebSocketContext } from "@/components/provider/websocket"
import { useAuthStore } from "@/stores/auth"
import { useRoomStateStore } from "@/stores/room"
import { RouletteGameState, useRouletteGameStore } from "@/stores/roulette"
import { moneyFormatter } from "@/util/formatter"
import { RouletteSpace } from "@/util/roulette"
import { useToast } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { ReactNode, createContext, useContext, useEffect } from "react"
import { ReadyState } from "react-use-websocket"

export type RouletteContextValue = {
    cleanup: () => void
}

export const RouletteContext = createContext<RouletteContextValue | null>(null)

export const RouletteProvider = ({ children }: { children: ReactNode }) => {
    const toast = useToast()
    const router = useRouter()

    const { sendMessage, lastMessage, readyState } = useWebSocketContext()

    const loggedInUser = useAuthStore((s) => s.user)
    const { setRoommates, removeRoommate, roomId, setRoomId, reset: resetRoomStateStore } = useRoomStateStore()
    const { addBet, setBetStatus, setIsRolled, setDealer, dealer, reset: resetRouletteGameStore, setBets } = useRouletteGameStore()

    const isLoggedInUserDealer = dealer?.ID === loggedInUser?.ID

    // Handle websocket `readyState` changes & reset state
    // biome-ignore lint/correctness/useExhaustiveDependencies:
    useEffect(() => {
        if (readyState === ReadyState.CLOSED || readyState === ReadyState.CLOSING) {
            resetRoomStateStore()
            resetRouletteGameStore()
        }
    }, [readyState])

    // Joining the room
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!roomId) return
        if (isLoggedInUserDealer) return

        sendMessage("join", {
            room_id: roomId,
        })
    }, [])

    // Handle new messages
    // biome-ignore lint/correctness/useExhaustiveDependencies:
    useEffect(() => {
        if (!lastMessage) return
        if ("error" in lastMessage) {
            toast({
                colorScheme: "red",
                title: "Error",
                description: JSON.stringify(lastMessage.error, null, 2),
            })
            return
        }

        switch (lastMessage?.type) {
            case "incoming_knock": {
                const toastId = `knock-${lastMessage.user.ID}`
                !toast.isActive(toastId) &&
                    toast({
                        id: `knock-${lastMessage.user.ID}`,
                        render: (p) => {
                            return <JoinRequestToast {...p} sendMessage={sendMessage} userName={lastMessage.user.FirstName} userId={lastMessage.user.ID} />
                        },
                    })

                break
            }

            // A user has joined the room
            case "join": {
                const roomates = lastMessage.players

                setRoommates(roomates)
                break
            }

            // A user has left the room
            case "leave": {
                const leavingUserId = lastMessage.id

                removeRoommate(leavingUserId)
                break
            }

            case "room_update": {
                const room = lastMessage.room

                setRoomId(room.ID)
                setRoommates(room.Players)
                setDealer(room.Dealer)
                setBetStatus(room.IsBetsOpen)
                setIsRolled(room.IsRolled)

                const roomBets = room.Bets
                const newBets: RouletteGameState["bets"] = {}
                for (const bet of roomBets) {
                    if (!newBets[bet.User]) newBets[bet.User] = []

                    if (bet.Number !== -1) {
                        if (bet.Number === 37) {
                            newBets[bet.User].push({ amount: bet.Amount, space: RouletteSpace.DOUBLE_ZERO })
                        } else {
                            // THIS IS HACKY AS FUCK
                            newBets[bet.User].push({ amount: bet.Amount, space: bet.Number + 2 })
                        }
                    } else if (bet.Color !== "") {
                        switch (bet.Color) {
                            case "red":
                                newBets[bet.User].push({ amount: bet.Amount, space: RouletteSpace.RED })
                                break
                            case "black":
                                newBets[bet.User].push({ amount: bet.Amount, space: RouletteSpace.BLACK })
                                break
                        }
                    } else if (bet.Class !== "") {
                        switch (bet.Class) {
                            case "DOZENS_ONE":
                                newBets[bet.User].push({ amount: bet.Amount, space: RouletteSpace.FIRST_TWELVE })
                                break
                            case "DOZENS_TWO":
                                newBets[bet.User].push({ amount: bet.Amount, space: RouletteSpace.SECOND_TWELVE })
                                break
                            case "DOZENS_THREE":
                                newBets[bet.User].push({ amount: bet.Amount, space: RouletteSpace.THIRD_TWELVE })
                                break
                        }
                    }
                }
                setBets(newBets)

                break
            }

            // Dealer left the room
            case "room_deleted": {
                resetRouletteGameStore()
                resetRoomStateStore()

                const reason = lastMessage.reason

                switch (reason) {
                    case "DEALER_LEFT": {
                        toast({
                            title: "Dealer left the room",
                            description: "You have been redirected to the homepage",
                            status: "info",
                        })
                        break
                    }
                    case "KICKED": {
                        toast({
                            title: "You have been kicked from the room",
                            status: "warning",
                        })
                        break
                    }
                    default: {
                        toast({
                            title: "The current room has been deleted",
                            status: "info",
                        })
                    }
                }

                router.replace("/")

                break
            }

            // New bet has been placed
            case "bet_placed": {
                const bet = lastMessage.bet

                if (bet.Number !== -1) {
                    if (bet.Number === 37) {
                        addBet(bet.User, { amount: bet.Amount, space: RouletteSpace.DOUBLE_ZERO })
                    } else {
                        // THIS IS HACKY AS FUCK
                        addBet(bet.User, { amount: bet.Amount, space: bet.Number + 2 })
                    }
                } else if (bet.Color !== "") {
                    switch (bet.Color) {
                        case "red":
                            addBet(bet.User, { amount: bet.Amount, space: RouletteSpace.RED })
                            break
                        case "black":
                            addBet(bet.User, { amount: bet.Amount, space: RouletteSpace.BLACK })
                            break
                    }
                } else if (bet.Class !== "") {
                    switch (bet.Class) {
                        case "DOZENS_ONE":
                            addBet(bet.User, { amount: bet.Amount, space: RouletteSpace.FIRST_TWELVE })
                            break
                        case "DOZENS_TWO":
                            addBet(bet.User, { amount: bet.Amount, space: RouletteSpace.SECOND_TWELVE })
                            break
                        case "DOZENS_THREE":
                            addBet(bet.User, { amount: bet.Amount, space: RouletteSpace.THIRD_TWELVE })
                            break
                    }
                } else {
                    console.error("Unrecognized bet has been placed", bet)
                }
                break
            }

            // Table is / isn't open for bets
            case "bets_status": {
                const isOpen = lastMessage.is_open

                setBetStatus(isOpen)
                toast({
                    title: isOpen ? "Bets are open" : "Bets are closed",
                    status: isOpen ? "success" : "warning",
                })
                break
            }

            // Random number has been picked
            case "winnings": {
                const { amount, roll } = lastMessage

                setIsRolled(true)
                toast({
                    title: "Number picked",
                    description: `The number ${roll} has been picked`,
                    status: "success",
                })
                if (amount > 0) {
                    const formattedAmount = moneyFormatter.format(amount)
                    toast({
                        title: "💶 Congratulations! 💶",
                        description: `You have won ${formattedAmount}!`,
                        status: "success",
                    })
                } else {
                    toast({
                        title: "Better luck next time!",
                        colorScheme: "blue",
                    })
                }
                break
            }

            case "reset": {
                const room = lastMessage.room
                setBetStatus(room.IsBetsOpen)
                setIsRolled(room.IsRolled)
                setBets({})

                toast({
                    title: "New round",
                    description: "A new round has started",
                    status: "info",
                })
                break
            }
        }
    }, [lastMessage])

    // Handles component unmount
    const cleanup = () => {
        console.log("Clean up function is called. Cleaning roulette room")
        if (isLoggedInUserDealer) {
            if (roomId == null) return
            sendMessage("delete_room", {
                room_id: roomId,
            })
        } else {
            sendMessage("leave", { room_id: roomId })
        }

        resetRoomStateStore()
        resetRouletteGameStore()
    }

    const value: RouletteContextValue = {
        cleanup,
    }

    return <RouletteContext.Provider value={value}>{children}</RouletteContext.Provider>
}

export const useRouletteContext = () => {
    const ctx = useContext(RouletteContext)
    if (ctx == null) throw new Error("useRouletteContext must be used within a RouletteProvider")

    return ctx
}
