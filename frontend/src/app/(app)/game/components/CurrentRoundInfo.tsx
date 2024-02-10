import { useWebSocketContext } from "@/components/provider/websocket"
import { useRoomStateStore } from "@/stores/room"
import { Box, Button, ButtonProps, HStack, Heading, SimpleGrid, Spacer, Tag, Text } from "@chakra-ui/react"
import { BetEntry } from "./BetEntry"
import { Fragment, MouseEventHandler } from "react"
import { useAuthStore } from "@/stores/auth"
import { useRouletteGameStore } from "@/stores/roulette"

export const CurrentRoundInfo = () => {
    const [isBetsOpen, dealer] = useRouletteGameStore((s) => [s.isBetsOpen, s.dealer])
    const { user } = useAuthStore()

    const isCurrentUserDealer = user?.ID === dealer?.ID

    return (
        <Box bg="gray.400" w="full" h="full" p={4} rounded={2}>
            <HStack>
                <Box>
                    <Tag colorScheme={isBetsOpen ? "green" : "red"} mb={2}>
                        Bets {isBetsOpen ? "Open" : "Closed"}
                    </Tag>
                    <Heading size="md">Bet list</Heading>
                </Box>
                <Spacer />

                {isCurrentUserDealer && <ToggleBetsButton />}
            </HStack>

            <BetsList />
        </Box>
    )
}

export const DietRoundInfo = () => {
    const [isBetsOpen, dealer] = useRouletteGameStore((s) => [s.isBetsOpen, s.dealer])
    const { user } = useAuthStore()

    const isCurrentUserDealer = user?.ID === dealer?.ID

    return (
        <Box bg="gray.400" w="full" h="full" p={4} rounded={2}>
            <HStack>
                <Box>
                    <Tag colorScheme={isBetsOpen ? "green" : "red"} mb={2}>
                        Bets {isBetsOpen ? "Open" : "Closed"}
                    </Tag>
                    <Heading size="md">Bet list</Heading>
                </Box>
                <Spacer />

                {isCurrentUserDealer && <ToggleBetsButton />}
            </HStack>

            <BetsList />
        </Box>
    )
}

export const BetsList = () => {
    const roommates = useRoomStateStore((s) => s.roommates)
    const bets = useRouletteGameStore((s) => s.bets)

    const betEntries = Object.entries(bets)

    if (betEntries.length === 0) {
        return (
            <>
                <Heading size="md" textAlign="center" mt={4}>
                    No bets yet
                </Heading>
                <Text textAlign="center" fontSize="small">
                    Place a bet to get started
                </Text>
            </>
        )
    }

    return (
        <Box my={2} gap={4}>
            {betEntries.map(([userId, userBets]) => {
                const user = roommates.find((u) => u.ID === Number(userId))

                return (
                    <Fragment key={userId}>
                        <Heading size="md">
                            {user?.FirstName} {user?.LastName}
                        </Heading>
                        <SimpleGrid columns={2} my={2} gap={2}>
                            {userBets.map((bet) => (
                                <BetEntry amount={bet.amount} space={bet.space} key={bet.space} />
                            ))}
                        </SimpleGrid>
                    </Fragment>
                )
            })}
        </Box>
    )
}

export const ToggleBetsButton = (props: ButtonProps) => {
    const { sendMessage } = useWebSocketContext()
    const [isBetsOpen, isRolled, setBetStatus] = useRouletteGameStore((s) => [s.isBetsOpen, s.isRolled, s.setBetStatus])
    const { roomId } = useRoomStateStore()

    const handleToggleBets: MouseEventHandler<HTMLButtonElement> = (e) => {
        sendMessage("lock_bets", {
            room_id: roomId,
            open: !isBetsOpen,
        })

        setBetStatus(!isBetsOpen)
        props.onClick?.(e)
    }

    return (
        <Button mt={4} {...props} onClick={handleToggleBets} isDisabled={isRolled}>
            {isBetsOpen ? "Close" : "Open"} Bets
        </Button>
    )
}
