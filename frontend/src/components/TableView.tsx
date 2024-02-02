import { Button, Card, CardBody, CardFooter, CardHeader, Heading, useToast } from "@chakra-ui/react"
import { Table } from "../util/types/table"
import { useWebSocketContext } from "./provider/websocket"

function TableView({ table }: { table: Table }) {
    const { sendMessage } = useWebSocketContext()
    const toast = useToast()

    const isTableFull = table.PlayersCount >= 5

    const handleKnock = () => {
        sendMessage("knock", {
            room_id: table.ID,
        })

        toast({
            title: "Request sent",
            description: "The dealer has been notified of your request. Please wait for them to accept.",
            status: "success",
        })
    }

    return (
        <Card w="30vw">
            <CardHeader>
                <Heading>Room #{table.ID}</Heading>
                <Heading size="md">Dealt by {table.DealerName}</Heading>
            </CardHeader>
            <CardBody>Currently, this room has {table.PlayersCount} players.</CardBody>
            <CardFooter>
                <Button isDisabled={isTableFull} onClick={handleKnock}>
                    {isTableFull ? "Table is full" : "Ask to Join"}
                </Button>
            </CardFooter>
        </Card>
    )
}

export { TableView }
