"use client"

import { Box, Flex, SimpleGrid } from "@chakra-ui/react"
import { useAuthStore } from "../../../stores/auth"
import { useRoomStateStore } from "@/stores/room"
import { GameBoard } from "./components/GameBoard"
import { PlayerCard } from "./components/PlayerCard"
import { CurrentRoundInfo } from "./components/CurrentRoundInfo"
import { RoomControlPanel } from "./components/dealer/RoomControlPanel"
import { useRouletteGameStore } from "@/stores/roulette"

function GamePage() {
    const user = useAuthStore((state) => state.user)
    const roommates = useRoomStateStore((state) => state.roommates)
    const dealer = useRouletteGameStore((s) => s.dealer)

    const isCurrentUserDealer = user?.ID === dealer?.ID
    const roommatesCount = roommates.length
    const emptyPlayerCount = 6 - roommatesCount

    return (
        <Box>
            <SimpleGrid columns={6} w="full" gap={2} my={4} h={196}>
                {roommates.map((p) => (
                    <PlayerCard key={p.ID} player={p} />
                ))}
                {Array.from({ length: emptyPlayerCount }, (_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: This is fine, no way around it.
                    <PlayerCard key={i} />
                ))}
            </SimpleGrid>

            <Flex gap={4} w="full">
                <GameBoard flexShrink={0} h="full" w="full" />

                <Flex gap={4} flexDir="column" w="full">
                    {isCurrentUserDealer && <RoomControlPanel />}
                    <CurrentRoundInfo />
                </Flex>
            </Flex>
        </Box>
    )
}

export default GamePage
