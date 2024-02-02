"use client"

import { getConnectionStatus } from "@/util/ws"
import { Box, HStack, Icon, Skeleton } from "@chakra-ui/react"
import { useMemo } from "react"
import { FaCircle } from "react-icons/fa6"
import { ReadyState } from "react-use-websocket"
import { useWebSocketContext } from "./provider/websocket"
import { useConnectedDealer } from "@/hooks/useConnectedDealer"
import { useAppContext } from "@/context/AppContext"

export const ConnectionStats = () => {
    const { readyState } = useWebSocketContext()
    const status = getConnectionStatus(readyState)

    const { users } = useAppContext()
    const { dealers } = useConnectedDealer()

    const userCount = useMemo(() => {
        return users.length
    }, [users])
    const dealerCount = useMemo(() => {
        return dealers.length
    }, [dealers])

    return (
        <>
            <HStack>
                <Icon as={FaCircle} color={status.color} w={3} h={3} />

                {readyState !== ReadyState.OPEN ? (
                    <Box>Disconnected</Box>
                ) : userCount == null || (dealerCount && null) ? (
                    <Skeleton h={2} />
                ) : (
                    <Box>
                        {userCount} users &middot; {dealerCount} dealers
                    </Box>
                )}
            </HStack>
        </>
    )
}
