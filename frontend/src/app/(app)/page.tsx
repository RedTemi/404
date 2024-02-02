"use client"

import { Box, Divider, Flex, HStack, Heading, IconButton, SimpleGrid, Spacer, Text, Tooltip } from "@chakra-ui/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { FaArrowsRotate } from "react-icons/fa6"
import { TableView } from "../../components/TableView"
import { useWebSocketContext } from "../../components/provider/websocket"
import { useAuthStore } from "../../stores/auth"
import { Table } from "../../util/types/table"
import { isUserDisgraced } from "../../util/roadblocks"
import { AccountMenuButton } from "@/components/AccountMenuButton"
import { ReadyState } from "react-use-websocket"

export default function Home() {
    const user = useAuthStore((state) => state.user)
    const { sendMessage, lastMessage, readyState } = useWebSocketContext()
    const [tables, setTables] = useState<Table[]>()

    const isConnected = readyState === ReadyState.OPEN

    if (!user || isUserDisgraced(user)) {
        redirect("/auth/login")
    }

    // Fetch tables on load
    // biome-ignore lint/correctness/useExhaustiveDependencies: We only want this to run once
    useEffect(() => {
        sendMessage("rooms")
    }, [])

    // Update tables when we get a new message
    useEffect(() => {
        if (lastMessage?.type === "rooms") {
            setTables(lastMessage.rooms)
        }
    }, [lastMessage])

    // Set rooms to none if not connected
    useEffect(() => {
        if (!isConnected) {
            setTables(undefined)
        }
    }, [isConnected])

    return (
        <>
            <HStack>
                <Box>
                    <HStack>
                        <Heading>The Lobby</Heading>
                        <Tooltip label="Refresh table list">
                            <IconButton
                                maxW="32px"
                                aria-label="Refresh"
                                icon={<FaArrowsRotate />}
                                disabled={!isConnected}
                                onClick={() => {
                                    sendMessage("rooms")
                                }}
                            />
                        </Tooltip>
                    </HStack>
                    <Text>Welcome to the lobby. Feel free to join any tables.</Text>
                </Box>
                <Spacer />
                <AccountMenuButton />
            </HStack>
            <Divider pt={2} mb={4} />

            {tables ? (
                <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(200px, 1fr)">
                    {tables.map((table) => {
                        return <TableView table={table} key={table.ID} />
                    })}
                </SimpleGrid>
            ) : (
                <Flex direction="column" h="full" justify="center" align="center" textAlign="center">
                    <Heading size="lg">There are no tables right now...</Heading>
                    <Text>Maybe try refreshing the lobby?</Text>
                </Flex>
            )}
        </>
    )
}
