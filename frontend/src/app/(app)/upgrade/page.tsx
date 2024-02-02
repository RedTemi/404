import { Flex, Heading, Text } from "@chakra-ui/react"
import { NextPage } from "next"

const UpgradePage: NextPage = () => {
    return (
        <Flex flexDir="column" h="full" w="full" justifyContent="center" alignItems="center">
            <Heading textAlign="center">Upgrade account</Heading>
            <Text textAlign="center">Please contact Marty Banks to get your account upgraded</Text>
        </Flex>
    )
}

export default UpgradePage
