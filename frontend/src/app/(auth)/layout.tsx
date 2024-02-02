"use client"

import { Flex } from "@chakra-ui/react";

function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Flex px={6} flex={1} dir="col" justifyContent="center" alignItems="center">
            {children}
        </Flex>
    )
}

export default AuthLayout;
