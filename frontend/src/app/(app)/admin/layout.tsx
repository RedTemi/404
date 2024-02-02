"use client"

import { AccountMenuButton } from "@/components/AccountMenuButton"
import { HStack, Heading, Spacer } from "@chakra-ui/react"

function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <HStack>
                <Heading>Admin panel</Heading>
                <Spacer />
                <AccountMenuButton />
            </HStack>

            {children}
        </>
    )
}

export default AdminLayout
