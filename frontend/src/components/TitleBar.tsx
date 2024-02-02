"use client"

import { Avatar, AvatarBadge, Flex, Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList, Spacer } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { FaUser } from "react-icons/fa6"
import { isUserAdmin, isUserCashier, isUserDealer } from "../util/roadblocks"
import { useAuthStore } from "../stores/auth"
import { useUIManager } from "../stores/ui"
import { getConnectionStatus } from "../util/ws"
import { useWebSocketContext } from "./provider/websocket"
import { Logo } from "./Logo"

function TitleBar() {
    const { sendMessage, lastMessage, readyState } = useWebSocketContext()
    const status = getConnectionStatus(readyState)

    const setViewingProfile = useUIManager((state) => state.setViewingProfile)
    const { user, logout } = useAuthStore()

    return (
        <Flex width="100%">
            <Logo />
            <Spacer />
            <Flex alignItems="center">
                <Menu>
                    <MenuButton>
                        <Avatar name={user?.FirstName ?? undefined} bg="#111111" icon={<FaUser />}>
                            <AvatarBadge boxSize="1.25em" bg={status.color} />
                        </Avatar>
                    </MenuButton>
                    <MenuList>
                        <MenuGroup title={`Welcome back, ${user?.FirstName}`}>
                            <MenuItem onClick={() => setViewingProfile(true)}>View Profile</MenuItem>
                            {isUserAdmin(user) && <AdminMenuOptions />}
                            {isUserDealer(user) && <DealerMenuOptions />}
                            {isUserCashier(user) && <CashierMenuOptions />}
                            <MenuDivider />
                            <MenuItem onClick={() => logout()}>Logout</MenuItem>
                        </MenuGroup>
                    </MenuList>
                </Menu>
            </Flex>
        </Flex>
    )
}

function AdminMenuOptions() {
    const router = useRouter()

    return (
        <>
            <MenuDivider />
            <MenuItem onClick={() => router.push("/admin")}>View Admin Dashboard</MenuItem>
        </>
    )
}

function DealerMenuOptions() {
    const router = useRouter()

    return (
        <>
            <MenuDivider />
            <MenuItem onClick={() => router.push("/dealer")}>View Dealer Dashboard</MenuItem>
        </>
    )
}

function CashierMenuOptions() {
    const router = useRouter()

    return (
        <>
            <MenuDivider />
            <MenuItem onClick={() => router.push("/cashier")}>View Cashier Dashboard</MenuItem>
        </>
    )
}

export { TitleBar }
