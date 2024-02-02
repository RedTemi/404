"use client"

import { HStack, Heading, Spacer } from "@chakra-ui/react"
import { AccountMenuButton } from "@/components/AccountMenuButton"
import { useRoomStateStore } from "@/stores/room"
import { PlayerInviteModal } from "./components/dealer/PlayerInviteModal"
import useBeforeUnload from "@/hooks/useBeforeUnload"
import { RouletteProvider } from "@/context/RouletteContext"
import { useEffect } from "react"
import { redirect } from "next/navigation"

function GameLayout({ children }: { children: React.ReactNode }) {
    const roomId = useRoomStateStore((state) => state.roomId)

    useBeforeUnload(roomId != null, "Are you sure you want to leave this game?")

    // Room ID is null
    // biome-ignore lint/correctness/useExhaustiveDependencies: Only watching if roomId is undefined
    useEffect(() => {
        if (roomId === undefined) {
            redirect("/")
        }
    }, [roomId])

    return (
        <RouletteProvider>
            <HStack>
                <Heading>Room #{roomId} &middot; Roulette</Heading>
                <Spacer />
                <AccountMenuButton />
            </HStack>

            {children}

            <PlayerInviteModal />
        </RouletteProvider>
    )
}

export default GameLayout
