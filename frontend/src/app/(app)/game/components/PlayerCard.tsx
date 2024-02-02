import { PublicRoleBadge } from "@/components/RoleBadges"
import { useAuthStore } from "@/stores/auth"
import { useRoomStateStore } from "@/stores/room"
import { User } from "@/util/types/user"
import { IconButton, VStack, Text, Button, Heading, Menu, MenuButton, MenuList, MenuItem, Flex, Box } from "@chakra-ui/react"
import { FaEllipsisV, FaPlus } from "react-icons/fa"
import { useWebSocketContext } from "@/components/provider/websocket"
import { moneyFormatter } from "@/util/formatter"
import { useProposedBetStore } from "@/stores/proposedBet"
import { useRouletteGameStore } from "@/stores/roulette"
import { useMemo } from "react"

export type PlayerCardProps = {
    player?: User
}

export const PlayerCard = (props: PlayerCardProps) => {
    const loggedInUser = useAuthStore((p) => p.user)
    const [isBetsOpen, currentDealer, bets] = useRouletteGameStore((s) => [s.isBetsOpen, s.dealer, s.bets])

    const isCurrentUserDealer = loggedInUser?.ID === currentDealer?.ID

    // biome-ignore lint/correctness/useExhaustiveDependencies: Only listening for bets changes
    const userBetTotal = useMemo(() => {
        if (!props.player) return 0

        const userBets = bets[props.player.ID]
        if (userBets == null) return 0

        return userBets.reduce((acc, bet) => acc + bet.amount, 0)
    }, [bets])

    if (props.player == null) {
        return <EmptyPlayerCard {...props} />
    }

    const playerName = props.player.LastName ? `${props.player.FirstName} ${props.player.LastName}` : props.player.FirstName
    const formattedBalance = moneyFormatter.format(props.player.Balance - userBetTotal)

    return (
        <Flex flexDir="column" bg="gray.400" px={4} py={6} maxW={256} w="full" rounded={8} h="full" pos="relative">
            {isCurrentUserDealer && <DealerActionButton player={props.player} />}

            <Flex justifyContent="center">
                <PublicRoleBadge roles={props.player.Permission} />
            </Flex>

            <Text fontSize="xl" fontWeight={700} isTruncated maxW={224} textAlign="center">
                {playerName}
            </Text>

            <Text fontSize="5xl" fontWeight={700} style={{ fontVariantNumeric: "proportional-nums" }} textAlign="center">
                {formattedBalance}
            </Text>

            {isCurrentUserDealer && isBetsOpen && <DealerSelectBetUserButton player={props.player} />}
        </Flex>
    )
}

const EmptyPlayerCard = (props: PlayerCardProps) => {
    const user = useAuthStore((state) => state.user)
    const setInviteModalOpen = useRoomStateStore((s) => s.setInviteModalOpen)
    const dealer = useRouletteGameStore((s) => s.dealer)
    const isCurrentUserDealer = user?.ID === dealer?.ID

    return (
        <>
            <VStack bg="gray.400" px={4} py={6} maxW={256} w="full" rounded={8} h="full" maxH={196} pos="relative" justifyContent="center">
                <Heading size="lg" textAlign="center">
                    Seat Empty
                </Heading>
                {isCurrentUserDealer && (
                    <Button
                        leftIcon={<FaPlus />}
                        onClick={() => {
                            setInviteModalOpen(true)
                        }}
                    >
                        Invite user
                    </Button>
                )}
            </VStack>
        </>
    )
}

const DealerActionButton = ({ player }: { player: User }) => {
    const { sendMessage } = useWebSocketContext()
    const addKickedUser = useRoomStateStore((s) => s.addKickedUser)

    const handleKickUser = () => {
        sendMessage("kick", {
            // TODO: Make room_id server sided
            room_id: 1,
            target_id: player.ID,
        })

        addKickedUser(player.ID)
    }

    return (
        <Menu isLazy placement="bottom-end">
            <MenuButton as={IconButton} aria-label="User menu" icon={<FaEllipsisV />} right={4} top={4} pos="absolute" size="sm" />
            <MenuList>
                <MenuItem onClick={handleKickUser} color="red">
                    Kick user
                </MenuItem>
            </MenuList>
        </Menu>
    )
}

const DealerSelectBetUserButton = ({ player }: { player: User }) => {
    const setBetTargetUser = useProposedBetStore((s) => s.setTargetUser)
    const roomID = useRoomStateStore((s) => s.roomId)

    const handleOnClick = () => {
        if (!roomID) {
            console.error("Trying to set bet target user, but room ID is null")
        }

        setBetTargetUser(player)
    }

    return (
        <Box position="absolute" bottom={4} right={4}>
            <Button size="xs" onClick={handleOnClick}>
                Select user
            </Button>
        </Box>
    )
}
