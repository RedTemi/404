import { Link } from "@chakra-ui/next-js"
import { Flex, Heading } from "@chakra-ui/react"
import Image from "next/image"

export const Logo = () => {
    return (
        <Link href="/">
            <Flex gap={4} alignItems="center">
                <Image src="/logo.gif" width={64} height={64} alt="" />
                <Heading size="md">The 404</Heading>
            </Flex>
        </Link>
    )
}
