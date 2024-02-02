"use client"

import { Box, Button, ButtonGroup, HStack, IconButton, Input, InputGroup, InputLeftAddon, InputLeftElement, Text, Tooltip, VStack, useToast } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FaArrowsRotate, FaMagnifyingGlass } from "react-icons/fa6"
import { getUsers, updateOtherUser } from "../../../util/client"
import { useAuthStore } from "../../../stores/auth"
import { Role, User } from "../../../util/types/user"
import { isUserCashier, isUserDisgraced } from "../../../util/roadblocks"
import { redirect } from "next/navigation"
import { useDebounce } from "@uidotdev/usehooks"

function CashierPage() {
    const toast = useToast()
    const { _authToken, user } = useAuthStore()

    const [searchMemberId, setSearchMemberId] = useState("")
    const debouncedSearchMemberId = useDebounce(searchMemberId, 500)

    const [targetUser, setTargetUser] = useState<User | null>(null)
    const [newBalance, setNewBalance] = useState(0)

    const [isMutating, setIsMutating] = useState(false)

    // biome-ignore lint/correctness/useExhaustiveDependencies: Running only once on mount
    useEffect(() => {
        if (!user) {
            redirect("/auth/login")
        }

        if (!isUserCashier(user)) {
            redirect("/")
        }

        if (isUserDisgraced(user)) {
            redirect("/auth/login")
        }
    }, [])

    // Handle user searching
    useEffect(() => {
        if (!_authToken) {
            return
        }

        if (debouncedSearchMemberId) {
            getUsers(_authToken).then((users: User[]) => {
                const target = users.find((user: User) => debouncedSearchMemberId === user.MemberID.toString() && !user.Permission.includes(Role.PENDING))

                if (target != null) {
                    setTargetUser(target)
                    setNewBalance(target.Balance)
                }
            })
        }
    }, [_authToken, debouncedSearchMemberId])

    function handleBalanceChange(amount: number) {
        setNewBalance(newBalance + amount)
    }

    const resetBalanceChange = () => {
        if (targetUser) {
            setNewBalance(targetUser.Balance)
        }
    }

    async function handleSubmit() {
        if (!targetUser || !_authToken) {
            return
        }

        try {
            setIsMutating(true)
            await updateOtherUser(_authToken, targetUser?.ID, { balance: newBalance })
            toast({
                title: "Balance updated",
                description: `Balance for ${targetUser.FirstName} ${targetUser.LastName} updated to ${newBalance}`,
                colorScheme: "green",
            })

            setTargetUser(null) // Clear target user for new search
            setSearchMemberId("")
        } catch (error) {
            console.error(error)
        } finally {
            setIsMutating(false)
        }
    }

    return (
        <VStack spacing={4} alignItems="center">
            <Box textAlign="center" fontSize="xl" fontWeight="bold">
                Cashier
            </Box>

            <HStack mt={4}>
                <InputGroup>
                    <InputLeftElement>
                        <FaMagnifyingGlass />
                    </InputLeftElement>
                    <Input placeholder="Enter Member ID" value={searchMemberId} onChange={(e) => setSearchMemberId(e.target.value)} />
                </InputGroup>
            </HStack>

            {targetUser && (
                <>
                    <VStack spacing={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            {targetUser.FirstName} {targetUser.LastName} ({targetUser.MemberID})
                        </Text>
                        <Text>Current Balance: {targetUser.Balance}</Text>
                        <HStack spacing={4}>
                            <ButtonGroup variant="ghost">
                                <Button colorScheme="green" variant="solid" onClick={() => handleBalanceChange(1)}>
                                    +1
                                </Button>
                                <Button colorScheme="green" variant="solid" onClick={() => handleBalanceChange(50)}>
                                    +50
                                </Button>
                                <Button colorScheme="green" variant="solid" onClick={() => handleBalanceChange(100)}>
                                    +100
                                </Button>
                                <Button colorScheme="green" variant="solid" onClick={() => handleBalanceChange(500)}>
                                    +500
                                </Button>
                                <Button colorScheme="green" variant="solid" onClick={() => handleBalanceChange(1_000)}>
                                    +1000
                                </Button>
                                <Button colorScheme="green" variant="solid" onClick={() => handleBalanceChange(5_000)}>
                                    +5000
                                </Button>
                                <Button colorScheme="green" variant="solid" onClick={() => handleBalanceChange(10_000)}>
                                    +10000
                                </Button>
                            </ButtonGroup>
                        </HStack>
                        <HStack spacing={4}>
                            <ButtonGroup variant="ghost">
                                <Button colorScheme="red" variant="solid" onClick={() => handleBalanceChange(-1)}>
                                    -1
                                </Button>
                                <Button colorScheme="red" variant="solid" onClick={() => handleBalanceChange(-50)}>
                                    -50
                                </Button>
                                <Button colorScheme="red" variant="solid" onClick={() => handleBalanceChange(-100)}>
                                    -100
                                </Button>
                                <Button colorScheme="red" variant="solid" onClick={() => handleBalanceChange(-500)}>
                                    -500
                                </Button>
                                <Button colorScheme="red" variant="solid" onClick={() => handleBalanceChange(-1_000)}>
                                    -1000
                                </Button>
                                <Button colorScheme="red" variant="solid" onClick={() => handleBalanceChange(-5_000)}>
                                    -5000
                                </Button>
                                <Button colorScheme="red" variant="solid" onClick={() => handleBalanceChange(-10_000)}>
                                    -10000
                                </Button>
                            </ButtonGroup>
                        </HStack>
                        <HStack>
                            <Text>New Balance: {newBalance}</Text>
                            <Tooltip label="Reset balance change">
                                <IconButton aria-label="Reset" icon={<FaArrowsRotate />} onClick={resetBalanceChange} />
                            </Tooltip>
                        </HStack>
                        <Button colorScheme="blue" onClick={handleSubmit} isDisabled={isMutating}>
                            Submit
                        </Button>
                    </VStack>
                </>
            )}
        </VStack>
    )
}

export default CashierPage
