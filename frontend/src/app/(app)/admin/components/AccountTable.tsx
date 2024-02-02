"use client"

import { getUsers, updateOtherUser } from "@/util/client"
import { useAuthStore } from "@/stores/auth"
import { Role, User } from "@/util/types/user"
import { Button, HStack, Input, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { AccountRolePicker } from "./AccountRolePicker"

function AccountViewerTable() {
    const token = useAuthStore((state) => state._authToken)

    const [users, setUsers] = useState<User[]>([])

    const [pending, setPending] = useState(false)
    const [userSearch, setUserSearchQuery] = useState<string>()

    const toast = useToast()

    useEffect(() => {
        if (!token) {
            toast({
                title: "Error",
                description: "Something went wrong! Try again later?",
                status: "error",
                isClosable: true,
            })
            return
        }

        if (users.length > 0) {
            return
        }

        getUsers(token).then((res) => {
            setUsers(res)
        })
    })

    return (
        <TableContainer>
            <HStack>
                <Button
                    onClick={() => {
                        setPending(!pending)
                    }}
                >
                    Showing: {pending ? "Pending" : "All Users"}
                </Button>
                <Input
                    onChange={(e) => {
                        setUserSearchQuery(e.target.value)
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
                    </Tr>
                </Thead>
                <Tbody>
                    {users
                        .filter((user) => {
                            if (pending) {
                                return user.Permission.includes(Role.PENDING)
                            }
                            return user
                        })
                        .filter((user) => {
                            if (userSearch) {
                                // TODO: Fuzzy Match
                                const uid = user.ID.toString()
                                return uid.startsWith(userSearch) || user.ID.toString() === userSearch
                            }
                            return user
                        })
                        .map((user) => (
                            <AccountViewerRow key={user.ID} user={user} />
                        ))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

function AccountViewerRow({ user }: { user: User }) {
    return (
        <Tr>
            <Td>{user.ID}</Td>
            <Td>{user.MemberID}</Td>
            <Td>{user.FirstName}</Td>
            <Td>{user.LastName}</Td>
            <Td>{user.Username}</Td>
            <Td>
                <AccountBalanceEditor target={user} />
            </Td>
            <Td>
                <AccountRolePicker target={user} />
            </Td>
        </Tr>
    )
}

function AccountBalanceEditor({ target }: { target: User }) {
    const toast = useToast()

    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    })

    const token = useAuthStore((state) => state._authToken)

    if (!token) {
        redirect("/auth/login")
    }

    return (
        <Input
            type="number"
            defaultValue={formatter.format(target.Balance)}
            onBlur={(e) => {
                toast.promise(updateOtherUser(token, target.ID, { balance: e.target.valueAsNumber }), {
                    loading: { title: "Updating Balance", description: "Please wait..." },
                    success: { title: "Update Successful", description: "Balance updated!" },
                    error: { title: "Update Failed", description: "Something went wrong! Try again later?" },
                })
            }}
        />
    )
}

export { AccountViewerTable }
