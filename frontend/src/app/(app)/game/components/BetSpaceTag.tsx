import { RouletteSpace, spaceToChakraColor, spaceToLabelLookup } from "@/util/roulette"
import { Tag, TagProps } from "@chakra-ui/react"

export interface BetSpaceTagProps extends TagProps {
    space: RouletteSpace
}

export const BetSpaceTag = ({ space, ...rest }: BetSpaceTagProps) => {
    const scheme = spaceToChakraColor(space)
    const label = spaceToLabelLookup[space]

    return (
        <Tag colorScheme={scheme} variant="solid" {...rest}>
            {label.toUpperCase()}
        </Tag>
    )
}
