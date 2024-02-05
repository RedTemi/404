import { Box, Button, ButtonGroup, Flex, HStack, Heading, IconButton, Input, InputGroup, InputLeftElement, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Tag, Text } from "@chakra-ui/react"
import { useProposedBetStore } from "@/stores/proposedBet"
import { BetSpaceTag } from "../BetSpaceTag"
import { FaArrowRightFromBracket, FaCircleArrowLeft, FaDiceD20 } from "react-icons/fa6"
import { moneyFormatter } from "@/util/formatter"
import { FaEdit } from "react-icons/fa"
import { useWebSocketContext } from "@/components/provider/websocket"
import { useRoomStateStore } from "@/stores/room"
import { ChangeEventHandler, MouseEventHandler, useRef, useState } from "react"
import { useRouletteGameStore } from "@/stores/roulette"
import { generateBetData } from "@/util/roulette"
import ChipKeys from "../ChipKeys"

export const RoomControlPanel = () => {
    const isBetsOpen = useRouletteGameStore((s) => s.isBetsOpen)

    return (
        <Box bgColor="gray.400" rounded={4} p={4} position="relative">
            <Heading size="lg">Control Panel</Heading>
            <ChangeStateSection />

            {isBetsOpen && <PendingBetSection />}
        </Box>
    )
}

const ChangeStateSection = () => {
    const { sendMessage } = useWebSocketContext()
    const roomId = useRoomStateStore((s) => s.roomId)
    const [isBetsOpen, totalBets, isRolled] = useRouletteGameStore((s) => [s.isBetsOpen, s.computed.currentTotalBets, s.isRolled])

    const rollNumberRef = useRef<HTMLInputElement>(null)
    const [rollNumber, setRollNumber] = useState<number>(-1)

    const isRollDisabled = isBetsOpen || totalBets <= 0 || isRolled

    const handleRollInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        console.log(e.currentTarget.valueAsNumber)
        if (Number.isNaN(e.currentTarget.valueAsNumber)) {
            setRollNumber(-1)
        } else {
            setRollNumber(e.currentTarget.valueAsNumber)
        }
    }

    const handleRoll: MouseEventHandler<HTMLButtonElement> = (e) => {
        let num = rollNumber
        if (num == null) num = Math.floor(Math.random() * 37)

        sendMessage("spin", {
            room_id: roomId,
            number: num,
        })
    }

    const handleResetRoom: MouseEventHandler<HTMLButtonElement> = (e) => {
        sendMessage("reset", {
            room_id: roomId,
        })
    }

    return (
        <>
            {!isRolled ? (
                <HStack gap={4} mt={2}>
                    <Input placeholder="Roll number" type="number" min={0} max={34} onChange={handleRollInputChange} ref={rollNumberRef} />
                    <Button isDisabled={isRollDisabled} leftIcon={<FaDiceD20 />} onClick={handleRoll} flexShrink={0}>
                        Roll {rollNumber === -1 ? "Random" : ""}
                    </Button>
                </HStack>
            ) : (
                <ButtonGroup mt={2} size="sm">
                    <Button isDisabled={!isRolled} leftIcon={<FaCircleArrowLeft />} onClick={handleResetRoom}>
                        New Round
                    </Button>
                </ButtonGroup>
            )}
        </>
    )
}

const PendingBetSection = () => {
    const { sendMessage } = useWebSocketContext()
    const roomId = useRoomStateStore((s) => s.roomId)
    const { targetUser, betSpace, betAmount, reset, computed } = useProposedBetStore()

    const formattedMoney = moneyFormatter.format(betAmount)

    const handleSubmitBet = () => {
        if (!computed.isSubmittable) return

        sendMessage("place_bet", {
            room_id: roomId,
            // biome-ignore lint/style/noNonNullAssertion: Already check for `isSubmittable`
            target_id: targetUser!.ID,
            amount: betAmount,

            // biome-ignore lint/style/noNonNullAssertion: Already check for `isSubmittable`
            ...generateBetData(betSpace!),
        })
        reset()
    }
    const handleChipKeyClick = (amount: number) => {
        // this should automatically create a bet for that amount for the selected user in the active bet space, if one exists it should be added to the existing bet.
        console.log(amount)
        console.log(betSpace)
        console.log(targetUser)
        // simply increase the bet amount
        if (targetUser == null) return
        if (betSpace == null) return
        console.log("sending bet")
        sendMessage("place_bet", {
            room_id: roomId,
            target_id: targetUser.ID,
            amount: amount,
            ...generateBetData(betSpace),
        })
    }
    return (
        <Box>
            <Heading size="md" mt={4}>
                Pending Bet
            </Heading>
            <Box mt={2} fontWeight={600}>
                {targetUser == null ? "No user selected" : `${targetUser.FirstName} ${targetUser?.LastName}`}
            </Box>
            <HStack mt={2}>
                {betSpace ? <BetSpaceTag space={betSpace} /> : <Tag>??</Tag>}
                <Text>&middot;</Text>
                <EditBetButton />
                <ChipKeys chipBet={handleChipKeyClick} />
                <Box sx={{ fontVariantNumeric: "tabular-nums" }}>{formattedMoney}</Box>
            </HStack>

            <ButtonGroup mt={2}>
                <Button onClick={reset} size="sm">
                    Reset
                </Button>
                <Button leftIcon={<FaArrowRightFromBracket />} onClick={handleSubmitBet} colorScheme="green" size="sm" isDisabled={!computed.isSubmittable}>
                    Bet
                </Button>
            </ButtonGroup>
        </Box>
    )
}

const EditBetButton = () => {
    const [betAmount, setBetAmount] = useProposedBetStore((s) => [s.betAmount, s.setBetAmount])

    const inputRef = useRef<HTMLInputElement>(null)

    const handleInputFieldChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const num = e.target.value
        if (num == null || num === "") {
            return setBetAmount(0)
        }

        setBetAmount(parseInt(e.target.value ?? 0))
    }

    const handleBalanceChange = (increment: number) => {
        const newValue = betAmount + increment
        setBetAmount(newValue)

        if (inputRef.current) {
            inputRef.current.value = newValue.toString()
        }
    }

    return (
        <Popover isLazy size="xl">
            <PopoverTrigger>
                <IconButton size="xs" colorScheme="gray" aria-label="Edit bet amount" icon={<FaEdit />} />
            </PopoverTrigger>
            <PopoverContent>
                <PopoverHeader fontWeight={600}>Edit bet amount</PopoverHeader>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                            $
                        </InputLeftElement>
                        <Input type="number" placeholder="Enter bet amount" ref={inputRef} defaultValue={betAmount} onChange={handleInputFieldChange} />
                    </InputGroup>

                    <Flex mt={4} flexDir="column" alignItems="center" w="full" gap={2}>
                        <ButtonGroup size="xs" colorScheme="green" variant="solid" isAttached>
                            <Button onClick={() => handleBalanceChange(1)}>+1</Button>
                            <Button onClick={() => handleBalanceChange(50)}>+50</Button>
                            <Button onClick={() => handleBalanceChange(100)}>+100</Button>
                            <Button onClick={() => handleBalanceChange(500)}>+500</Button>
                            <Button onClick={() => handleBalanceChange(1_000)}>+1000</Button>
                        </ButtonGroup>
                        <ButtonGroup variant="solid" size="xs" colorScheme="red" isAttached>
                            <Button onClick={() => handleBalanceChange(-1)}>-1</Button>
                            <Button onClick={() => handleBalanceChange(-50)}>-50</Button>
                            <Button onClick={() => handleBalanceChange(-100)}>-100</Button>
                            <Button onClick={() => handleBalanceChange(-500)}>-500</Button>
                            <Button onClick={() => handleBalanceChange(-1_000)}>-1000</Button>
                        </ButtonGroup>
                    </Flex>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}
