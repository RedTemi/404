"use client"
import { useAuthStore } from "@/stores/auth"
import { useUIManager } from "@/stores/ui"
import { getConnectionStatus } from "@/util/ws"
import { Menu, MenuButton, Avatar, AvatarBadge, MenuList, MenuGroup, MenuItem, MenuDivider } from "@chakra-ui/react"
import { FaUser } from "react-icons/fa6"
import { useWebSocketContext } from "./provider/websocket"

export const AccountMenuButton = () => {
    const { readyState } = useWebSocketContext()
    const status = getConnectionStatus(readyState)

    const setViewingProfile = useUIManager((state) => state.setViewingProfile)
    const { user, logout } = useAuthStore()

    return (
        <Menu>
            <MenuButton>
                <Avatar name={user?.FirstName ?? undefined} bg="#111111" icon={<FaUser />}>
                    <AvatarBadge boxSize="1.25em" bg={status.color} />
                </Avatar>
            </MenuButton>
            <MenuList>
                <MenuGroup title={`Welcome back, ${user?.FirstName}`}>
                    <MenuItem onClick={() => setViewingProfile(true)}>View Profile</MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={() => logout()}>Logout</MenuItem>
                </MenuGroup>
            </MenuList>
        </Menu>
    )
}
