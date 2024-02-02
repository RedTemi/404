export enum Color {
    RED = "red",
    BLACK = "black",
    GREEN = "green",
}

/**
 * Automatically generated from copilot
 */
export enum RouletteSpace {
    ZERO = 1,
    DOUBLE_ZERO = 2,

    ONE = 3,
    TWO = 4,
    THREE = 5,
    FOUR = 6,
    FIVE = 7,
    SIX = 8,
    SEVEN = 9,
    EIGHT = 10,
    NINE = 11,
    TEN = 12,
    ELEVEN = 13,
    TWELVE = 14,
    THIRTEEN = 15,
    FOURTEEN = 16,
    FIFTEEN = 17,
    SIXTEEN = 18,
    SEVENTEEN = 19,
    EIGHTEEN = 20,
    NINETEEN = 21,
    TWENTY = 22,
    TWENTY_ONE = 23,
    TWENTY_TWO = 24,
    TWENTY_THREE = 25,
    TWENTY_FOUR = 26,
    TWENTY_FIVE = 27,
    TWENTY_SIX = 28,
    TWENTY_SEVEN = 29,
    TWENTY_EIGHT = 30,
    TWENTY_NINE = 31,
    THIRTY = 32,
    THIRTY_ONE = 33,
    THIRTY_TWO = 34,
    THIRTY_THREE = 35,
    THIRTY_FOUR = 36,
    THIRTY_FIVE = 37,
    THIRTY_SIX = 38,

    FIRST_TWELVE = 39,
    SECOND_TWELVE = 40,
    THIRD_TWELVE = 41,

    FIRST_EIGHTEEN = 42,
    NINETEEN_THIRTY_SIX = 43,

    RED = 44,
    BLACK = 45,

    EVEN = 46,
    ODD = 47,
}

export const spaceToLabelLookup: Record<RouletteSpace, string> = {
    [RouletteSpace.ZERO]: "0",
    [RouletteSpace.DOUBLE_ZERO]: "00",

    [RouletteSpace.ONE]: "1",
    [RouletteSpace.TWO]: "2",
    [RouletteSpace.THREE]: "3",
    [RouletteSpace.FOUR]: "4",
    [RouletteSpace.FIVE]: "5",
    [RouletteSpace.SIX]: "6",
    [RouletteSpace.SEVEN]: "7",
    [RouletteSpace.EIGHT]: "8",
    [RouletteSpace.NINE]: "9",
    [RouletteSpace.TEN]: "10",
    [RouletteSpace.ELEVEN]: "11",
    [RouletteSpace.TWELVE]: "12",
    [RouletteSpace.THIRTEEN]: "13",
    [RouletteSpace.FOURTEEN]: "14",
    [RouletteSpace.FIFTEEN]: "15",
    [RouletteSpace.SIXTEEN]: "16",
    [RouletteSpace.SEVENTEEN]: "17",
    [RouletteSpace.EIGHTEEN]: "18",
    [RouletteSpace.NINETEEN]: "19",
    [RouletteSpace.TWENTY]: "20",
    [RouletteSpace.TWENTY_ONE]: "21",
    [RouletteSpace.TWENTY_TWO]: "22",
    [RouletteSpace.TWENTY_THREE]: "23",
    [RouletteSpace.TWENTY_FOUR]: "24",
    [RouletteSpace.TWENTY_FIVE]: "25",
    [RouletteSpace.TWENTY_SIX]: "26",
    [RouletteSpace.TWENTY_SEVEN]: "27",
    [RouletteSpace.TWENTY_EIGHT]: "28",
    [RouletteSpace.TWENTY_NINE]: "29",
    [RouletteSpace.THIRTY]: "30",
    [RouletteSpace.THIRTY_ONE]: "31",
    [RouletteSpace.THIRTY_TWO]: "32",
    [RouletteSpace.THIRTY_THREE]: "33",
    [RouletteSpace.THIRTY_FOUR]: "34",
    [RouletteSpace.THIRTY_FIVE]: "35",
    [RouletteSpace.THIRTY_SIX]: "36",

    [RouletteSpace.FIRST_TWELVE]: "1st 12",
    [RouletteSpace.SECOND_TWELVE]: "2nd 12",
    [RouletteSpace.THIRD_TWELVE]: "3rd 12",

    [RouletteSpace.FIRST_EIGHTEEN]: "1 to 18",
    [RouletteSpace.NINETEEN_THIRTY_SIX]: "19 to 36",

    [RouletteSpace.RED]: "red",
    [RouletteSpace.BLACK]: "black",

    [RouletteSpace.EVEN]: "even",
    [RouletteSpace.ODD]: "odd",
}

export const generateBetData = (space: RouletteSpace) => {
    switch (space) {
        case RouletteSpace.ZERO:
            return {
                color: "",
                number: 0,
                class: "",
            }
        case RouletteSpace.DOUBLE_ZERO:
            return {
                color: "",
                number: 37,
                class: "",
            }

        // Handle numbers
        case RouletteSpace.ONE:
        case RouletteSpace.TWO:
        case RouletteSpace.THREE:
        case RouletteSpace.FOUR:
        case RouletteSpace.FIVE:
        case RouletteSpace.SIX:
        case RouletteSpace.SEVEN:
        case RouletteSpace.EIGHT:
        case RouletteSpace.NINE:
        case RouletteSpace.TEN:
        case RouletteSpace.ELEVEN:
        case RouletteSpace.TWELVE:
        case RouletteSpace.THIRTEEN:
        case RouletteSpace.FOURTEEN:
        case RouletteSpace.FIFTEEN:
        case RouletteSpace.SIXTEEN:
        case RouletteSpace.SEVENTEEN:
        case RouletteSpace.EIGHTEEN:
        case RouletteSpace.NINETEEN:
        case RouletteSpace.TWENTY:
        case RouletteSpace.TWENTY_ONE:
        case RouletteSpace.TWENTY_TWO:
        case RouletteSpace.TWENTY_THREE:
        case RouletteSpace.TWENTY_FOUR:
        case RouletteSpace.TWENTY_FIVE:
        case RouletteSpace.TWENTY_SIX:
        case RouletteSpace.TWENTY_SEVEN:
        case RouletteSpace.TWENTY_EIGHT:
        case RouletteSpace.TWENTY_NINE:
        case RouletteSpace.THIRTY:
        case RouletteSpace.THIRTY_ONE:
        case RouletteSpace.THIRTY_TWO:
        case RouletteSpace.THIRTY_THREE:
        case RouletteSpace.THIRTY_FOUR:
        case RouletteSpace.THIRTY_FIVE:
        case RouletteSpace.THIRTY_SIX:
            return {
                color: "",
                number: parseInt(spaceToLabelLookup[space], 10),
                class: "",
            }

        // Handle dozens
        case RouletteSpace.FIRST_TWELVE:
            return {
                color: "",
                number: -1,
                class: "DOZENS_ONE",
            }
        case RouletteSpace.SECOND_TWELVE:
            return {
                color: "",
                number: -1,
                class: "DOZENS_TWO",
            }
        case RouletteSpace.THIRD_TWELVE:
            return {
                color: "",
                number: -1,
                class: "DOZENS_THREE",
            }

        // Handle colors
        case RouletteSpace.RED:
            return {
                color: "red",
                number: -1,
                class: "",
            }
        case RouletteSpace.BLACK:
            return {
                color: "black",
                number: -1,
                class: "",
            }

        // Below should be unused, but whatever
        // Handle even/odd
        case RouletteSpace.EVEN:
            return {
                evenOdd: "even",
            }
        case RouletteSpace.ODD:
            return {
                evenOdd: "odd",
            }

        // Handle 1-18/19-36
        case RouletteSpace.FIRST_EIGHTEEN:
            return {
                class: "1-18",
            }
        case RouletteSpace.NINETEEN_THIRTY_SIX:
            return {
                class: "19-36",
            }
    }
}

// TODO: Use code given by Dejay
// I give up figuring out how to do this
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export const numberToColor = (numberText: string): Color => {
    const num = parseInt(numberText)

    if (num === 0) {
        return Color.GREEN
    }

    if (redNumbers.includes(num)) {
        return Color.RED
    }

    return Color.BLACK
}

export const spaceToChakraColor = (space: RouletteSpace) => {
    switch (space) {
        case RouletteSpace.FIRST_TWELVE:
        case RouletteSpace.SECOND_TWELVE:
        case RouletteSpace.THIRD_TWELVE:
            return "teal"
        case RouletteSpace.RED:
            return "red"
        case RouletteSpace.BLACK:
            return "black"
        default: {
            const numberColor = numberToColor(spaceToLabelLookup[space])
            switch (numberColor) {
                case Color.RED:
                    return "red"
                case Color.BLACK:
                    return "black"
                case Color.GREEN:
                    return "green"
            }
        }
    }
}
