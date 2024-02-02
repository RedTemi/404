"use client"
import { useRoomStateStore } from "@/stores/room"
import { redirect } from "next/navigation"
import React, { createContext, useContext } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { WS_URL } from "@/util/constants"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "@chakra-ui/react"

type WebSocketContextType = {
    sendMessage: (messageType: string, data?: object) => void
    messageEvent: MessageEvent<any> | null
    lastMessage: any | null
    readyState: ReadyState | null
}

const WebSocketContext = createContext<WebSocketContextType>({
    sendMessage: () => {},
    messageEvent: null,
    lastMessage: null,
    readyState: null,
})

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const toast = useToast()

    const [authToken, logout] = useAuthStore((state) => [state._authToken, state.logout])
    const [roomId, setRoomId, resetRoomState] = useRoomStateStore((s) => [s.roomId, s.setRoomId, s.reset])
    const resetGameRoomStore = useRoomStateStore((s) => s.reset)

    const { sendJsonMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(authToken ? WS_URL : null, {
        onOpen: () => {
            console.log("WS CONN: OPEN")

            if (!lastMessage && authToken) {
                sendJsonMessage({ type: "auth", token: authToken })
                toast({ title: "Connected to the server", status: "success" })
            }
        },

        onMessage: (m) => {
            const jsonMessage = JSON.parse(m.data)

            if (jsonMessage) {
                if ("error" in jsonMessage) {
                    console.error(`WS Message Error: ${jsonMessage.error}`, jsonMessage)

                    if (jsonMessage.error === "token has invalid claims: token is expired" || jsonMessage.error === "token signature is invalid: signature is invalid") {
                        setRoomId(undefined)
                        logout()
                        redirect("/auth/login")
                    }
                }

                console.info("WS RECV:", jsonMessage)
            }
        },

        onError: (e) => {
            console.error(e)
        },

        onClose: () => {
            resetGameRoomStore()
            resetRoomState()

            if (roomId) {
                sendMessage("leave", {
                    roomId: roomId,
                })
            }

            console.log("WS CONN: CLOSE")
            toast({ title: "Disconnected from server", status: "error" })

            redirect("/")
        },
    })

    function sendMessage(messageType: string, data?: object) {
        const send = {
            type: messageType,
        }

        console.info("WS SEND:", { ...send, ...data })
        sendJsonMessage({ ...send, ...data })
    }

    const contextValue: WebSocketContextType = {
        sendMessage,
        messageEvent: lastMessage,
        lastMessage: lastJsonMessage,
        readyState,
    }

    return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}

export const useWebSocketContext = () => useContext(WebSocketContext)
