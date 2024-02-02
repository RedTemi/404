import { useProposedBetStore } from "@/stores/proposedBet"
import { useRouletteGameStore } from "@/stores/roulette"
import { RouletteSpace, spaceToChakraColor, spaceToLabelLookup } from "@/util/roulette"
import { Grid, GridItem, GridItemProps, GridProps } from "@chakra-ui/react"
import { MouseEventHandler } from "react"

interface GameBoardTileProps extends GridItemProps {
    space: RouletteSpace
}

const GameBoardTile = ({ space, ...rest }: GameBoardTileProps) => {
    const setBetSpace = useProposedBetStore((s) => s.setBetSpace)
    const isBetsOpen = useRouletteGameStore((s) => s.isBetsOpen)

    const color = spaceToChakraColor(space)
    const isZero = space === RouletteSpace.ZERO || space === RouletteSpace.DOUBLE_ZERO

    const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
        if (!isBetsOpen) return
        setBetSpace(space)

        rest.onClick?.(e)
    }

    return (
        <GridItem
            as="button"
            bg={color}
            rowSpan={isZero ? 3 : 2}
            colSpan={1}
            display="flex"
            textAlign="center"
            alignItems="center"
            justifyContent="center"
            fontSize="2xl"
            fontWeight={600}
            border="black"
            borderWidth={2}
            cursor={isBetsOpen ? "pointer" : "not-allowed"}
            {...rest}
            onClick={handleClick}
        >
            {spaceToLabelLookup[space]}
        </GridItem>
    )
}

// Yes. This is actually pain.
export const GameBoard = (props: GridProps) => {
    return (
        <Grid templateColumns="repeat(13, 1fr)" templateRows="repeat(8, 1fr)" maxW="5xl" w="full" opacity="80%" {...props}>
            <GameBoardTile space={RouletteSpace.DOUBLE_ZERO} />

            <GameBoardTile space={RouletteSpace.THREE} />
            <GameBoardTile space={RouletteSpace.SIX} />
            <GameBoardTile space={RouletteSpace.NINE} />
            <GameBoardTile space={RouletteSpace.TWELVE} />
            <GameBoardTile space={RouletteSpace.FIFTEEN} />
            <GameBoardTile space={RouletteSpace.EIGHTEEN} />
            <GameBoardTile space={RouletteSpace.TWENTY_ONE} />
            <GameBoardTile space={RouletteSpace.TWENTY_FOUR} />
            <GameBoardTile space={RouletteSpace.TWENTY_SEVEN} />
            <GameBoardTile space={RouletteSpace.THIRTY} />
            <GameBoardTile space={RouletteSpace.THIRTY_THREE} />
            <GameBoardTile space={RouletteSpace.THIRTY_SIX} />

            <GameBoardTile space={RouletteSpace.TWO} />
            <GameBoardTile space={RouletteSpace.FIVE} />
            <GameBoardTile space={RouletteSpace.EIGHT} />
            <GameBoardTile space={RouletteSpace.ELEVEN} />
            <GameBoardTile space={RouletteSpace.FOURTEEN} />
            <GameBoardTile space={RouletteSpace.SEVENTEEN} />
            <GameBoardTile space={RouletteSpace.TWENTY} />
            <GameBoardTile space={RouletteSpace.TWENTY_THREE} />
            <GameBoardTile space={RouletteSpace.TWENTY_SIX} />
            <GameBoardTile space={RouletteSpace.TWENTY_NINE} />
            <GameBoardTile space={RouletteSpace.THIRTY_TWO} />
            <GameBoardTile space={RouletteSpace.THIRTY_FIVE} />

            <GameBoardTile space={RouletteSpace.ZERO} />

            <GameBoardTile space={RouletteSpace.ONE} />
            <GameBoardTile space={RouletteSpace.FOUR} />
            <GameBoardTile space={RouletteSpace.SEVEN} />
            <GameBoardTile space={RouletteSpace.TEN} />
            <GameBoardTile space={RouletteSpace.THIRTEEN} />
            <GameBoardTile space={RouletteSpace.SIXTEEN} />
            <GameBoardTile space={RouletteSpace.NINETEEN} />
            <GameBoardTile space={RouletteSpace.TWENTY_TWO} />
            <GameBoardTile space={RouletteSpace.TWENTY_FIVE} />
            <GameBoardTile space={RouletteSpace.TWENTY_EIGHT} />
            <GameBoardTile space={RouletteSpace.THIRTY_ONE} />
            <GameBoardTile space={RouletteSpace.THIRTY_FOUR} />

            <GridItem rowSpan={1} colSpan={1} />

            <GameBoardTile space={RouletteSpace.FIRST_TWELVE} rowSpan={1} colSpan={4} />
            <GameBoardTile space={RouletteSpace.SECOND_TWELVE} rowSpan={1} colSpan={4} />
            <GameBoardTile space={RouletteSpace.THIRD_TWELVE} rowSpan={1} colSpan={4} />

            <GridItem rowSpan={1} colSpan={1} />

            <GameBoardTile space={RouletteSpace.RED} rowSpan={1} colSpan={6} />
            <GameBoardTile space={RouletteSpace.BLACK} rowSpan={1} colSpan={6} />
        </Grid>
    )
}
