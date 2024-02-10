"use client"

import { HStack, Heading, Spacer, Button } from "@chakra-ui/react"
import { AccountMenuButton } from "@/components/AccountMenuButton"
import { useRoomStateStore } from "@/stores/room"
import { PlayerInviteModal } from "./components/dealer/PlayerInviteModal"
import useBeforeUnload from "@/hooks/useBeforeUnload"
import { RouletteProvider } from "@/context/RouletteContext"
import { use, useEffect } from "react"
import { redirect } from "next/navigation"
import {useRouter } from "next/router"
import { useWebSocketContext } from "@/components/provider/websocket"
import { isUserDealer } from "@/util/roadblocks"
import { useAuthStore } from "@/stores/auth"

function GameLayout({ children }: { children: React.ReactNode }) {
    const roomId = useRoomStateStore((state) => state.roomId)
    const { sendMessage } = useWebSocketContext()
    // const router = useRouter()
    const user = useAuthStore((state) => state.user)
    
    useBeforeUnload(roomId != null, "Are you sure you want to leave this game?")
    
    // Room ID is null
    // biome-ignore lint/correctness/useExhaustiveDependencies: Only watching if roomId is undefined
    useEffect(() => {
        if (roomId === undefined) {
            redirect("/")
        }
    }, [roomId])
    
    function leaveRoom() {
        sendMessage("leave",{room_id: roomId })
        // set room id to null
        useRoomStateStore.setState({ roomId: undefined })
    }    
    function exitRoom() {
        sendMessage("delete_room",{room_id: roomId })
        // set room id to null
        useRoomStateStore.setState({ roomId: undefined })
    }
    return (
        <RouletteProvider>
            <HStack>
                <Heading>Room #{roomId} &middot; Roulette</Heading>
               {isUserDealer(user)? <Button onClick={()=>leaveRoom()}>Leave</Button>:<Button onClick={()=>exitRoom()}>Exit</Button>}
                <Spacer />
                <AccountMenuButton />
            </HStack>

            {children}

            <PlayerInviteModal />
        </RouletteProvider>
    )
}

export default GameLayout
