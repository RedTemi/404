"use client"

import { AccountBanned, AccountPending, AccountRegistrationDisabled } from "@/components/AccountStatus"
import { REST_URL } from "@/util/constants"
import { normalizeError } from "@/util/errors"
import { isUserDisgraced } from "@/util/roadblocks"
import { RegisterFormSchema } from "@/util/schemas/auth"
import { useAuthStore } from "@/stores/auth"
import { useConfig } from "@/stores/config"
import { useSecureStore } from "@/stores/turnstile"
import { Role } from "@/util/types/user"
import { Button, Flex, FormControl, FormHelperText, FormLabel, Heading, Input, InputGroup, InputLeftAddon, Link, Text, useToast } from "@chakra-ui/react"
import { joiResolver } from "@hookform/resolvers/joi"
import NextLink from "next/link"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { Form, useForm } from "react-hook-form"
import { FaExternalLinkAlt } from "react-icons/fa"
import { FaArrowRight } from "react-icons/fa6"

function RegisterPage() {
    const user = useAuthStore((state) => state.user)

    const { registrationEnabled } = useConfig()

    useEffect(() => {
        if (user && !isUserDisgraced(user)) {
            return redirect("/")
        }

        fetch(`${REST_URL}/api/app/config`).then(async (res) => {
            const { settings } = await res.json()
            useConfig.setState({ registrationEnabled: settings.registration })
        })
    }, [user])

    return (
        <Flex flexDir="column" alignItems="center" minW="40vw" gap={6}>
            <Heading textAlign="center" py={6}>
                Welcome, shall we get started?
            </Heading>
            {user?.Permission.includes(Role.PENDING) && <AccountPending uniqueid={user?.ID} />}
            {user?.Permission.includes(Role.BANNED) && <AccountBanned />}
            {!registrationEnabled && <AccountRegistrationDisabled />}
            {registrationEnabled && (
                <>
                    <RegisterForm />
                    <Flex mt={4} justifyContent="center">
                        <Link as={NextLink} href="/auth/login" variant="ghost">
                            <Button variant="ghost" size="sm" color="primary" rightIcon={<FaExternalLinkAlt />}>
                                Not your first time? You mean to sign-in instead.
                            </Button>
                        </Link>
                    </Flex>
                </>
            )}
        </Flex>
    )
}

function RegisterForm() {
    const passedTurnstile = useSecureStore((state) => state.passed)

    const setAuthToken = useAuthStore((state) => state.setAuthToken)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: joiResolver(RegisterFormSchema),
    })

    const toast = useToast()

    return (
        <Form
            action={`${REST_URL}/api/auth/signup`}
            control={control}
            onSubmit={() => {
                handleSubmit(
                    () => {},
                    (error) => console.error(error),
                )
            }}
            onSuccess={async (e) => {
                const { token } = await e.response.json()
                setAuthToken(token)
            }}
            onError={async (e) => {
                const res = await e.response?.text()
                toast({
                    title: "Error",
                    description: normalizeError(res),
                    status: "error",
                    isClosable: true,
                })
                console.error(res)
            }}
        >
            <FormControl isRequired>
                <FormLabel>Member ID</FormLabel>
                <InputGroup>
                    <InputLeftAddon>(420)</InputLeftAddon>
                    <Input autoComplete="off" isInvalid={errors.memberid ? true : false} {...register("memberid", { required: true })} />
                </InputGroup>
                <FormHelperText>{errors.memberid?.message ? "Invalid input." : ""}</FormHelperText>
            </FormControl>
            <Flex py={4} flexDir="row" gap={5} minW="40vw">
                <FormControl isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input placeholder="Marty" autoComplete="off" aria-invalid={errors.first_name ? true : false} {...register("first_name", { required: true })} />
                    <FormHelperText>{errors.first_name?.message ? "Invalid input." : ""}</FormHelperText>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Last Name(s)</FormLabel>
                    <Input placeholder="Banks" autoComplete="off" aria-invalid={errors.first_name ? true : false} {...register("last_name", { required: true })} />
                    <FormHelperText>{errors.first_name?.message ? "Invalid input." : ""}</FormHelperText>
                </FormControl>
            </Flex>
            <Flex py={4} flexDir="row" gap={5} minW="40vw">
                <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input placeholder="martybanks" autoComplete="off" aria-invalid={errors.username ? true : false} {...register("username", { required: true })} />
                    <FormHelperText>{errors.username?.message ? "Invalid input." : ""}</FormHelperText>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" autoComplete="off" aria-invalid={errors.password ? true : false} {...register("password", { required: true })} />
                </FormControl>
            </Flex>
            <Button type="submit" minW="full" variant="outline" rightIcon={<FaArrowRight />} cursor={passedTurnstile ? "pointer" : "not-allowed"} isDisabled={!passedTurnstile}>
                Request Account
            </Button>
            {!passedTurnstile && (
                <Text fontWeight="semibold" textAlign="center" mt={2}>
                    Please complete the below captcha.
                </Text>
            )}
        </Form>
    )
}

export default RegisterPage
