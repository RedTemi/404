"use client";

import {
  getUsers,
  updateOtherUser,
  deleteUser,
  banUser,
  approveUser,
} from "@/util/client";
import { useAuthStore } from "@/stores/auth";
import { Role, User } from "@/util/types/user";
import {
  Button,
  HStack,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  IconButton,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { FaEdit, FaBan, FaTrash } from "react-icons/fa";
import { use, useEffect, useState } from "react";

function AccountViewerTable() {
  const token = useAuthStore((state) => state._authToken);

  const [users, setUsers] = useState<User[]>([]);

  const [pending, setPending] = useState(false);
  const [userSearch, setUserSearchQuery] = useState<string>();

  const toast = useToast();

  useEffect(() => {
    if (!token) {
      toast({
        title: "Error",
        description: "Something went wrong! Try again later?",
        status: "error",
        isClosable: true,
      });
      return;
    }

    if (users.length > 0) {
      return;
    }

    getUsers(token).then((res) => {
      setUsers(res);
    });
  });

  return (
    <TableContainer>
      <HStack>
        <Button
          onClick={() => {
            setPending(!pending);
          }}
        >
          Showing: {pending ? "Pending" : "All Users"}
        </Button>
        <Input
          onChange={(e) => {
            setUserSearchQuery(e.target.value);
          }}
        />
      </HStack>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th color="white">ID</Th>
            <Th color="white">Member ID</Th>
            <Th color="white">First Name</Th>
            <Th color="white">Last Name</Th>
            <Th color="white">Username</Th>
            <Th color="white">Balance</Th>
            <Th color="white">Role</Th>
            <Th color="white">Edit</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users
            .filter((user) => {
              if (pending) {
                return user.Permission.includes(Role.PENDING);
              }
              return user;
            })
            .filter((user) => {
              if (userSearch) {
                // TODO: Fuzzy Match
                return (
                  user.Username.includes(userSearch) ||
                  user.FirstName.includes(userSearch) ||
                  user.LastName.includes(userSearch)
                );
              }
              return user;
            })
            .map((user) => (
              <AccountViewerRow key={user.ID} user={user} />
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function AccountViewerRow({ user }: { user: User }) {
  const token = useAuthStore((state) => state._authToken);
  if (!token) {
    return null;
  }
  function approveUsr() {
    return () => {
      approveUser(token? token: '', user.ID).then((res) => {
        if (res) {
        }
      });
    };
  }
  return (
    <Tr>
      <Td>{user.ID}</Td>
      <Td>{user.MemberID}</Td>
      <Td>{user.FirstName}</Td>
      <Td>{user.LastName}</Td>
      <Td>{user.Username}</Td>
      <Td>{user.Balance}</Td>
      <Td>
        {user.Permission.includes(Role.PENDING) &&
        !user.Permission.includes(Role.BANNED) ? (
          <Button onClick={approveUsr()}>Approve</Button>
        ) : (
          user.Permission.toString()
        )}
      </Td>
      <Td>
        <EditUser user={user} token={token} />
      </Td>
    </Tr>
  );
}
function EditUser({ user, token }: { user: User; token: string }) {
  return (
    <>
      <Popover>
        <PopoverTrigger>
          <IconButton
            size="sm"
            colorScheme="gray"
            aria-label="Edit User"
            icon={<FaEdit />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Edit User</PopoverHeader>
          <PopoverBody>
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                defaultValue={user.FirstName}
                value={user.FirstName}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input type="text" defaultValue={user.LastName} />
            </FormControl>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Text fontWeight="normal">{user.Username}</Text>
              <Input type="text" defaultValue={user.Username} hidden={true} />
            </FormControl>
            <FormControl>
              <FormLabel>Balance</FormLabel>
              <Input type="text" />
            </FormControl>
            <FormControl>
              <Button onClick={() => {}}>Submit</Button>
            </FormControl>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger>
          <IconButton
            size="sm"
            colorScheme="red"
            aria-label="Delete User"
            icon={<FaTrash />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverCloseButton />
          <PopoverHeader>Confirm delete user {user.Username}.</PopoverHeader>
          <PopoverBody>
            <Button onClick={() => deleteUser(token, user.ID)}>Confirm</Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger>
          <IconButton
            size="sm"
            colorScheme="red"
            aria-label="Ban User"
            icon={<FaBan />}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Confirm ban user {user.Username}.</PopoverHeader>
          <PopoverBody>
            <Button onClick={() => banUser(token, user.ID)}>Confirm</Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
}

export { AccountViewerTable };
