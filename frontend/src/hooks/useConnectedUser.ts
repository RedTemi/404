import { useAppContext } from "@/context/AppContext"

export const useConnectedUser = () => {
    const { users } = useAppContext()

    return {
        users,
    }
}
