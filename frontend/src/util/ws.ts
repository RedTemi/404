import { ReadyState } from "react-use-websocket";

function getConnectionStatus(readyState: ReadyState | null) {

    if (!readyState) {
        return {
            color: "gray",
            name: "Not Started"
        }
    }

    return {
        [ReadyState.CONNECTING]: {
            color: "blue",
            name: "Connecting"
        },
        [ReadyState.OPEN]: {
            color: "green",
            name: "Connected"
        },
        [ReadyState.CLOSING]: {
            color: "yellow",
            name: "Disconnected"
        },
        [ReadyState.CLOSED]: {
            color: "red",
            name: "Disconnected"
        },
        [ReadyState.UNINSTANTIATED]: {
            color: "gray",
            name: "Not Started"
        },
    }[readyState];
}

export { getConnectionStatus };
