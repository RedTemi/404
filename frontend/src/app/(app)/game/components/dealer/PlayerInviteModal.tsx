import { useWebSocketContext } from "@/components/provider/websocket"
import { useAppContext } from "@/context/AppContext"
import { useRoomStateStore } from "@/stores/room"
import { useRouletteGameStore } from "@/stores/roulette"
import { User } from "@/util/types/user"
import { Modal, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button, Text, ModalOverlay, VStack, Spacer, HStack, Box, IconButton, Heading } from "@chakra-ui/react"
import { useMemo } from "react"
import { FaArrowsRotate, FaPlus } from "react-icons/fa6"

export const PlayerInviteModal = () => {
    const [roommates, isModalOpen, setInviteModalOpen] = useRoomStateStore((s) => [s.roommates, s.isInviteModalOpen, s.setInviteModalOpen])

    const { users, refetchUsers } = useAppContext()
    const dealer = useRouletteGameStore((s) => s.dealer)

    const roommatesUserId = useMemo(() => {
        return roommates.map((u) => u.ID)
    }, [roommates])

    const inviteList = useMemo(() => {
        return users
            .filter((u) => u.ID !== dealer?.ID) // Not the current user (dealer)
            .filter((u) => !roommatesUserId.includes(u.ID)) // Not already in room
    }, [users, roommatesUserId, dealer])

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => {
                setInviteModalOpen(false)
            }}
        >
            <ModalOverlay bg="blackAlpha.500" backdropFilter="auto" backdropBlur="4px" />

            <ModalContent>
                <ModalHeader fontSize="lg" fontWeight="bold">
                    <HStack>
                        <Heading>Invite user</Heading>
                        <IconButton aria-label="Refresh users list" onClick={refetchUsers} size="sm" icon={<FaArrowsRotate />} />
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack gap={5} h="xl" overflowY="scroll" px={2}>
                        {inviteList.map((user) => (
                            <PlayerInviteEntry user={user} key={user.ID} />
                        ))}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

interface PlayerInviteEntryProps {
    user: User
}
const PlayerInviteEntry = ({ user }: PlayerInviteEntryProps) => {
    const { sendMessage } = useWebSocketContext()
    const roomId = useRoomStateStore((s) => s.roomId)

    const sendInvite = () => {
        if (roomId == null) {
            return console.error("Trying to invite user, but Room ID is null")
        }

        sendMessage("add_to_room", {
            target_id: user.ID,
            room_id: roomId,
        })
    }

    return (
        <HStack w="full">
            <Text>
                {user.FirstName} {user.LastName}
            </Text>
            <Spacer />
            <Button leftIcon={<FaPlus />} onClick={sendInvite}>
                Add player
            </Button>
        </HStack>
    )
}
