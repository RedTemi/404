"use client"
import { Flex, Heading, Text } from "@chakra-ui/react"
import { NextPage } from "next"
import { useState } from "react"
import { REST_URL } from "@/util/constants"
import { useAuthStore } from "@/stores/auth"
const RafflePage: NextPage = () => {
    const token = useAuthStore((state) => state._authToken)
    function getActiveRaffle(){
        fetch(`${REST_URL}/api/raffle/active`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            return data;
        })
    }
    const raffle = useState(getActiveRaffle())
    return (
        <Flex flexDir="column" h="full" w="full" justifyContent="center" alignItems="center">
            <Heading textAlign="center">Under construction</Heading>
            <Text textAlign="center">This page is still under construction.</Text>
        </Flex>
    )
}

export default RafflePage
