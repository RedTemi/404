import { Role, User } from "./types/user";

function isUserDisgraced(user: User) {
    if (user?.Permission.includes(Role.PENDING) || user?.Permission.includes(Role.BANNED)) {
        return true
    }
    return false
}

function isUserCashier(user?: User) {
    return user?.Permission.includes(Role.CASHIER) || isUserAdmin(user)
}

function isUserDealer(user?: User, room?: any) {
    return user?.Permission.includes(Role.DEALER) || isUserAdmin(user)
}

function isUserAdmin(user?: User) {
    return user?.Permission.includes(Role.ADMIN)
}

function isRolePrivileged(role: Role) {
    return [Role.ADMIN, Role.DEALER, Role.CASHIER].includes(role)
}

export { isRolePrivileged, isUserAdmin, isUserCashier, isUserDealer, isUserDisgraced };

