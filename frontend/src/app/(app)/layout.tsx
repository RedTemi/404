"use client"
import { Box, HStack } from "@chakra-ui/react"
import { AccountInfo } from "@/components/AccountInfo"
import { DesktopNavbar } from "@/components/navbar/DesktopNavbar"
import { useEffect } from "react"
import { useRoomStateStore } from "@/stores/room"
import { redirect } from "next/navigation"
import { useWebSocketContext } from "@/components/provider/websocket"
import { AppProvider } from "@/context/AppContext"

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { lastMessage } = useWebSocketContext()
    const [roomId, setRoomId] = useRoomStateStore((s) => [s.roomId, s.setRoomId])

    // biome-ignore lint/correctness/useExhaustiveDependencies: Only listens for `lastMessage`
    useEffect(() => {
        if (!lastMessage) return // Don't do anything if we don't have a message
        if (roomId != null) return // Don't do anything if we're already in a room

        if (lastMessage.type === "room_invite") {
            setRoomId(lastMessage.room_id)
            // sendMessage({ type: "join_room", room_id: lastMessage.room_id })
            redirect("/game")
        }
    }, [lastMessage])

    return (
        <AppProvider>
            <HStack as="main" height="100dvh" width="100vw">
                <DesktopNavbar />

                <Box display="flex" flexDir="column" h="full" w="full" p={4}>
                    {children}
                </Box>
            </HStack>

            {/* Modals/Popups */}
            <AccountInfo />
        </AppProvider>
    )
}
