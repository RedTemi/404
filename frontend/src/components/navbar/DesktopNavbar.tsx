import { Divider, Box } from "@chakra-ui/react"
import { ConnectionStats } from "../ConnectionStats"
import { Logo } from "../Logo"
import { NavbarLinks } from "./NavbarLinks"
import { isUserAdmin, isUserDealer, isUserCashier } from "@/util/roadblocks"
import { useAuthStore } from "@/stores/auth"

export const DesktopNavbar = () => {
    const { user } = useAuthStore()

    return (
        <Box as="nav" w="xs" h="full" p={4}>
            <Logo />
            <ConnectionStats />
            <Divider my={4} />

            <NavbarLinks label="Lobby" href="/" />
            <NavbarLinks label="Rewards" href="/rewards" />
            <NavbarLinks label="Raffle" href="/raffle" />
            <NavbarLinks label="Upgrade" href="/upgrade" />

            <Divider my={4} />

            {isUserAdmin(user) && <NavbarLinks label="Admin Dashboard" href="/admin" />}
            {isUserDealer(user) && <NavbarLinks label="Dealer Dashboard" href="/dealer" />}
            {isUserCashier(user) && <NavbarLinks label="Cashier Dashboard" href="/cashier" />}
        </Box>
    )
}
