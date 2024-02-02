import { User } from "@/util/types/user";
import { List, ListItem } from "@chakra-ui/react";

function DealerMemberList({ users }: { users: User[] }) {
    return (
        <List>
            {users.map((user) => (
                <ListItem key={user.ID}>{user.FirstName} {user.LastName}</ListItem>
            ))}
        </List>
    );
}

export { DealerMemberList };
