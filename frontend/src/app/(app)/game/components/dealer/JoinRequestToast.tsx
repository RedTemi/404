import { useRoomStateStore } from "@/stores/room"
import { Box, Button, HStack, Heading, IconButton, Spacer, Text, ToastProps } from "@chakra-ui/react"
import { useCallback } from "react"
import { FaXmark } from "react-icons/fa6"

export interface JoinRequestToastProps extends ToastProps {
    // This is required because Toast is spawned on a Portal
    sendMessage: (s: string, d: Record<string, any>) => void
    userName: string
    userId: string
}

export const JoinRequestToast = (props: JoinRequestToastProps) => {
    const { roomId } = useRoomStateStore()

    const acceptRequest = useCallback(() => {
        props.onClose?.()
        props.sendMessage("add_to_room", {
            target_id: props.userId,
            room_id: roomId,
        })
    }, [props.sendMessage, props.userId, props.onClose, roomId])

    return (
        <Box color="blue.900" p={3} bg="blue.100" rounded="lg" outlineColor="blue.900" fontWeight={500}>
            <HStack>
                <Heading size="md">Request to join</Heading>
                <Spacer />
                <IconButton aria-label="Close" icon={<FaXmark />} onClick={props.onClose} color="blue.900" />
            </HStack>
            <Text>{props.userName} has requested to join your table</Text>

            <Button color="blue.900" bg="blue.200" mt="2" onClick={acceptRequest}>
                Invite user
            </Button>
        </Box>
    )
}
