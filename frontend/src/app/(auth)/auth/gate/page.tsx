import { Flex, FormControl, Heading, Image, Input } from "@chakra-ui/react"

function GatePage() {
    return (
        <Flex flexDir="column" alignItems="center">
            <Image
                src="/logo.gif"
                height={256}
                width={256}
                alt=""
                pb={2} />
            <Heading textAlign="center" py={6}>
                Welcome, please enter the site key.
            </Heading>
            <FormControl>
                <Input
                    autoComplete="off"
                    placeholder="Please enter the site key."
                    type="password" />
            </FormControl>
        </Flex>
    )
}


export default GatePage