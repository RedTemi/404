import { Link } from "@chakra-ui/next-js"
import { Box } from "@chakra-ui/react"
import { usePathname } from "next/navigation"

export interface NavbarLinksProps {
    label: string
    href: string
}

export const NavbarLinks = (props: NavbarLinksProps) => {
    const pathname = usePathname()
    const isActive = pathname === props.href

    return (
        <Link href={props.href}>
            <Box _hover={{ bg: "gray.400" }} fontSize="lg" fontWeight={isActive ? 700 : 500} py={2} px={4} rounded="lg" bg={isActive ? "gray.500" : ""} my={1}>
                {props.label}
            </Box>
        </Link>
    )
}
