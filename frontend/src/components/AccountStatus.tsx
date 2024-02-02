"use client"

import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Button, HStack, Spacer } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { FaExternalLinkAlt } from "react-icons/fa"

function AccountExists() {

    const router = useRouter()

    return (
        <Alert status="info">
            <AlertIcon />
            <HStack w="full">
                <Box>
                    <AlertTitle>Your account already exists!</AlertTitle>
                    <AlertDescription>Please log in instead.</AlertDescription>
                </Box>
                <Spacer />
                <Button
                    w="40%"
                    variant="ghost"
                    onClick={() => {
                        router.push("/login")
                    }}
                    rightIcon={<FaExternalLinkAlt />}>
                    Continue to Login
                </Button>
            </HStack>
        </Alert>
    )
}

function AccountPending({ uniqueid }: { uniqueid: number }) {
    return (
        <Alert status="warning">
            <AlertIcon />
            <Box>
                <AlertTitle>Your account is still pending approval!</AlertTitle>
                <AlertDescription>Please text the 404 Casino: #{uniqueid}. Your account will be approved shortly after.</AlertDescription>
            </Box>
        </Alert>
    )
}

function AccountIssue({ type, error }: { type: 'login' | 'register', error: string }) {
    return (
        <Alert status="warning">
            <AlertIcon />
            <Box>
                <AlertTitle>Failed to {type}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Box>
        </Alert>
    )
}

function AccountBanned() {
    return (
        <Alert status="error">
            <AlertIcon />
            <Box>
                <AlertTitle>Your account has been banned.</AlertTitle>
                <AlertDescription>Thank you for visiting the 404.</AlertDescription>
            </Box>
        </Alert>
    )
}

function AccountRegistrationDisabled() {
    return (
        <Alert status="error">
            <AlertIcon />
            <Box>
                <AlertTitle>Creating new accounts is currently unavailable.</AlertTitle>
                <AlertDescription>We apologize for the inconvience.</AlertDescription>
            </Box>
        </Alert>
    )
}

export { AccountBanned, AccountExists, AccountIssue, AccountPending, AccountRegistrationDisabled }

