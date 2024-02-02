"use client"

import { Alert, AlertDescription, AlertTitle, Box, Flex, Text } from "@chakra-ui/react"
import { Turnstile as CFTurnstile } from "@marsidev/react-turnstile"
import { useSecureStore } from "../stores/turnstile"

function TurnstileAlert() {
    const passedTurnstile = useSecureStore((state) => state.passed)

    if (!passedTurnstile) {
        return (
            <Box display="flex" justifyContent="center">
                <Alert status="info" variant="top-accent" flexDirection="column" maxW="25%" textAlign="center">
                    <AlertTitle>We need to verify your humanity</AlertTitle>
                    <AlertDescription py="2em">
                        <Turnstile />
                    </AlertDescription>
                </Alert>
            </Box>
        )
    }
}

function Turnstile() {
    const secureStore = useSecureStore()

    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
        secureStore.setPassed(true)

        return (
            <Flex dir="column">
                <Text>This instance of The 404 Club isn&apos;t properly configured for Turnstile.</Text>
            </Flex>
        )
    }

    return (
        <CFTurnstile
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={() => {
                secureStore.setPassed(true)
            }}
            options={{
                theme: "dark",
                size: secureStore.passed ? "invisible" : "normal",
            }}
        />
    )
}

export { TurnstileAlert }
