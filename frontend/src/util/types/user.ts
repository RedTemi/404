enum Role {
    ADMIN = "ADMIN",
    FOUNDER = "FOUNDER",
    DEALER = "DEALER",
    CASHIER = "CASHIER",
    VIP = "VIP",
    MEMBER = "MEMBER",
    PENDING = "PENDING",
    BANNED = "BANNED"
}

type User = {
    ID: number;
    MemberID: number;
    Username: string;
    FirstName: string;
    LastName: string;
    Permission: Role[];
    StateID?: number;
    Balance: number;
}

type RegisteringUser = {
    memberID: number;
    username: string;
    firstName: string;
    lastName: string;
}

export { Role };
export type { RegisteringUser, User };
