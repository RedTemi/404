import { moneyFormatter } from "@/util/formatter"
import { HStack, Text } from "@chakra-ui/react"
import { BetSpaceTag } from "./BetSpaceTag"
import { RouletteSpace } from "@/util/roulette"

export type BetEntryProps = {
    amount: number
    space: RouletteSpace
}
export const BetEntry = (props: BetEntryProps) => {
    const formattedMoney = moneyFormatter.format(props.amount)

    return (
        <HStack>
            <BetSpaceTag space={props.space} />
            <Text style={{ fontVariantNumeric: "proportional-nums" }} fontWeight={500}>
                {formattedMoney}
            </Text>
        </HStack>
    )
}
