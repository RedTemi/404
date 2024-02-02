import { isUserDealer } from "@/util/roadblocks"
import { useConnectedUser } from "./useConnectedUser"
import { useMemo } from "react"

export const useConnectedDealer = () => {
    const { users } = useConnectedUser()

    const dealers = useMemo(() => {
        return users.filter((u) => isUserDealer(u))
    }, [users])

    return {
        dealers,
    }
}
