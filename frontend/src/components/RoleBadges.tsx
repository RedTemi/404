import { Role, User } from "@/util/types/user"
import { Badge } from "@chakra-ui/react"

export interface PublicRoleBadgeProps {
    roles: User["Permission"]
}

export const PublicRoleBadge = (props: PublicRoleBadgeProps) => {
    if (props.roles.includes(Role.FOUNDER)) return <FounderRoleBadge />
    if (props.roles.includes(Role.VIP)) return <VIPRoleBadge />
    if (props.roles.includes(Role.PENDING)) return <PendingRoleBadge />
    if (props.roles.includes(Role.BANNED)) return <BannedRoleBadge />

    // Default is always member
    return <MemberRoleBadge />
}

export const AdminRoleBadge = () => {
    return <Badge colorScheme="orange">Admin</Badge>
}

export const FounderRoleBadge = () => {
    return <Badge colorScheme="red">Founder</Badge>
}

export const DealerRoleBadge = () => {
    return <Badge colorScheme="lime">Dealer</Badge>
}

export const CashierRoleBadge = () => {
    return <Badge colorScheme="blue">Cashier</Badge>
}

export const VIPRoleBadge = () => {
    return <Badge colorScheme="green">VIP</Badge>
}

export const MemberRoleBadge = () => {
    return <Badge colorScheme="gray">Member</Badge>
}

export const PendingRoleBadge = () => {
    return <Badge colorScheme="yellow">Pending</Badge>
}

export const BannedRoleBadge = () => {
    return <Badge colorScheme="red">Banned</Badge>
}
