import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import { FaCircle } from "react-icons/fa6"
import { getConnectionStatus } from "../util/ws"
import { useWebSocketContext } from "./provider/websocket"

function WebsocketStatus() {
    const { sendMessage, lastMessage, readyState } = useWebSocketContext()

    const status = getConnectionStatus(readyState)

    return (
        <Box position="absolute" right={0} bottom={0}>
            <Flex alignItems="center" p={8}>
                <Icon as={FaCircle} color={status.color} />
                <Text as="b" fontSize="xl" pl="1em">
                    {status.name}
                </Text>
            </Flex>
        </Box>
    )
}

export { WebsocketStatus }
