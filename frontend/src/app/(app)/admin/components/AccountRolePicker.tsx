import { updateOtherUser } from "@/util/client"
import { useAuthStore } from "@/stores/auth"
import { Role, User } from "@/util/types/user"
import { Select, useToast } from "@chakra-ui/react"
import { nanoid } from "nanoid"

function AccountRolePicker({ target }: { target: User }) {
    const toast = useToast()

    const token = useAuthStore((state) => state._authToken)

    return (
        <Select
            onChange={(e) => {
                if (!token) {
                    toast({
                        title: "Error",
                        description: "Something went wrong! Try again later?",
                        status: "error",
                        isClosable: true,
                    })
                    return
                }

                toast.promise(updateOtherUser(token, target.ID, { permission: e.target.value as Role }), {
                    loading: { title: "Updating Role", description: "Please wait..." },
                    success: { title: "Update Successful", description: "Role updated!" },
                    error: { title: "Update Failed", description: "Something went wrong! Try again later?" },
                })
            }}
        >
            {Object.values(Role).map((role) => {
                return (
                    <option key={nanoid()} value={role.toLowerCase()} selected={target.Permission[0] === role.toLowerCase()}>
                        {role.charAt(0).toUpperCase() + role.substring(1).toLowerCase()}
                    </option>
                )
            })}
        </Select>
    )
}

export { AccountRolePicker }
