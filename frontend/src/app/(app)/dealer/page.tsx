"use client"

import { Box, Button, Heading, Text } from "@chakra-ui/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { useWebSocketContext } from "../../../components/provider/websocket"
import { isUserDealer } from "../../../util/roadblocks"
import { useAuthStore } from "../../../stores/auth"
import { useRoomStateStore } from "../../../stores/room"
import { User } from "../../../util/types/user"
import { DealerMemberList } from "./components/DealerMemberList"
import { useRouletteGameStore } from "@/stores/roulette"

function DealerPage() {
    const { sendMessage, lastMessage } = useWebSocketContext()
    const [members, setMembers] = useState<User[]>([])

    const [roomId, setRoomId, resetRoomStore] = useRoomStateStore((s) => [s.roomId, s.setRoomId, s.reset])
    const [setDealer, resetRouletteStore] = useRouletteGameStore((s) => [s.setDealer, s.reset])

    const user = useAuthStore((state) => state.user)

    // biome-ignore lint/correctness/useExhaustiveDependencies: Running once on mount
    useEffect(() => {
        // User not logged in
        if (!user) {
            redirect("/")
        }

        // User not a dealer
        if (!isUserDealer(user)) {
            redirect("/")
        }

        // Already have a room
        if (roomId) {
            redirect("/game")
        }

        // If nothing else, fetch users
        sendMessage("users")
    }, [])

    // Handle fetching users
    useEffect(() => {
        if (lastMessage?.type === "users") {
            // setMembers(lastMessage.users.filter((m: User) => {
            //  m.ID !== user.ID
            // }));
            setMembers(lastMessage.users)
        }
    }, [lastMessage])

    // Handle room created callback
    useEffect(() => {
        if (lastMessage.type === "room_created") {
            const roomId = lastMessage.id
            console.log("ROOM CREATED: ", roomId)

            setRoomId(roomId)
            redirect("/game")
        }
    }, [lastMessage])

    const handleStartRoom = () => {
        if (!user) return
        resetRoomStore()
        resetRouletteStore()

        console.log("REQUEST CREATE ROOM")

        sendMessage("create_room")
        setDealer(user)
    }

    return (
        <Box>
            <Heading>Dealer Page</Heading>
            <Text>Connected Members:</Text>

            <DealerMemberList users={members} />
            <Button onClick={handleStartRoom}>Start Room</Button>
        </Box>
    )
}

export default DealerPage
