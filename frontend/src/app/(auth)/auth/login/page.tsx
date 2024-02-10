"use client"

import { AccountBanned, AccountIssue, AccountPending } from "@/components/AccountStatus"
import { REST_URL, USERNAME_REGEX } from "@/util/constants"
import { normalizeError } from "@/util/errors"
import { isUserDisgraced } from "@/util/roadblocks"
import { LoginFormSchema } from "@/util/schemas/auth"
import { useAuthStore } from "@/stores/auth"
import { useSecureStore } from "@/stores/turnstile"
import { Role } from "@/util/types/user"
import { Button, Flex, FormControl, FormHelperText, FormLabel, Heading, Input, InputGroup, InputLeftAddon, Link } from "@chakra-ui/react"
import { joiResolver } from "@hookform/resolvers/joi"
import NextLink from "next/link"
import { redirect } from "next/navigation"
import { useState } from "react"
import { Form, useForm } from "react-hook-form"
import { FaExternalLinkAlt } from "react-icons/fa"
import { FaArrowRight } from "react-icons/fa6"

function LoginPage() {
    const user = useAuthStore((state) => state.user)

    if (user && !isUserDisgraced(user)) {
        redirect("/")
        return null
    }

    return (
        <Flex flexDir="column" alignItems="center" minW="40vw" gap={6}>
            <Heading textAlign="center" py={6}>
                Welcome back...
            </Heading>
            {user?.Permission.includes(Role.PENDING) && <AccountPending uniqueid={user?.ID} />}
            {user?.Permission.includes(Role.BANNED) && <AccountBanned />}
            <LoginForm />
            <Flex mt={4} justifyContent="center">
                <Link as={NextLink} href="/auth/register" variant="ghost">
                    <Button variant="ghost" size="sm" color="primary" rightIcon={<FaExternalLinkAlt />}>
                        First time? Signing up is easy.
                    </Button>
                </Link>
            </Flex>
        </Flex>
    )
}

function LoginForm() {
    const passedTurnstile = useSecureStore((state) => state.passed)

    const setAuthToken = useAuthStore((state) => state.setAuthToken)

    const [error, setError] = useState("")

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: joiResolver(LoginFormSchema),
    })

    return (
        <>
            {error && <AccountIssue type="login" error={error} />}
            <Form
                action={`${REST_URL}/api/auth/login`}
                control={control}
                onSubmit={() => {
                    handleSubmit(
                        () => {},
                        (error) => console.error(`!!!${error}`),
                    )
                }}
                onSuccess={async (e) => {
                    const { token } = await e.response.json()
                    await setAuthToken(token)
                }}
                onError={async (error) => {
                    const res = await error.response?.text()
                    const friendly = normalizeError(res)
                    if (friendly === "Search returned no results.") {
                        setError("Could not find user. Please verify your member id, username, and password.")
                    }
                    console.error(error)
                }}
            >
                <Flex py={4} flexDir="row" gap={5} minW="40vw">
                    <FormControl isRequired>
                        <FormLabel>Username</FormLabel>
                        <Input pattern={USERNAME_REGEX} placeholder="martybanks" autoComplete="off" aria-invalid={errors.username ? true : false} {...register("username", { required: true })} />
                        <FormHelperText>{errors.username?.message ? "Invalid input." : ""}</FormHelperText>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input type="password" autoComplete="off" aria-invalid={errors.password ? true : false} {...register("password", { required: true })} />
                        <FormHelperText>{errors.password?.message ? "Invalid input." : ""}</FormHelperText>
                    </FormControl>
                </Flex>
                <Button type="submit" minW="full" variant="outline" rightIcon={<FaArrowRight />} cursor={passedTurnstile ? "pointer" : "not-allowed"} isDisabled={!passedTurnstile}>
                    Login
                </Button>
            </Form>
        </>
    )
}

export default LoginPage
