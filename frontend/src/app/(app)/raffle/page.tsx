"use client";
import {
  Flex,
  Heading,
  Text,
  Popover,
  PopoverTrigger,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  Button,
  FormControl, FormLabel, Input
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useState } from "react";
import { REST_URL } from "@/util/constants";
import { useAuthStore } from "@/stores/auth";
import { useEffect } from "react";
import FlipCountdown from "@rumess/react-flip-countdown";

function BuyTickets(raffle:any, token: string) {
  const user = useAuthStore((state) => state.user);
  const [quantity, setQuantity] = useState(0);
  const balance = user?.Balance || 0;
  const [hasEnough, sethasEnough] = useState(false);
  const [uniquecode, setuniquecode] = useState('');
  const [loading, setLoading] = useState(false); 
  useEffect(() => {
    if (balance >= quantity * raffle.price) {
      sethasEnough(true);
    } else {
      sethasEnough(false);
    }
  },[quantity]);
  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  };
  const buyTickets = () => {
    setLoading(true); // Set loading state while making the request
    fetch(`${REST_URL}/raffle/purchaseTicket/${raffle.ID}/${quantity}`, {
      method: 'POST', // Assuming you're using POST method to purchase tickets
      headers: {
        'Authorization': `Bearer ${token}`, // Assuming you pass the token for authentication
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quantity: quantity }) // Sending quantity in JSON format
    })
    .then(response => {
      if (response.ok) {
        // Handle successful response, e.g., show a success message
        console.log('Tickets purchased successfully');
        // Optionally, you can reset the quantity after successful purchase
        setQuantity(0);
      } else {
        // Handle error response, e.g., show an error message
        console.error('Failed to purchase tickets');
      }
    })
    .catch(error => {
      // Handle network errors, e.g., show a generic error message
      console.error('Network error occurred:', error);
    })
    .finally(() => {
      setLoading(false); // Reset loading state after fetch is complete
    });
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button></Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Buy Tickets</PopoverHeader>
        <PopoverBody>
          <FormControl>
            <FormLabel>Quantity</FormLabel>
            <Input type="number" value={quantity} onChange={handleQuantityChange} />
          </FormControl>
         
          {!hasEnough?(<Popover>
            <PopoverTrigger>
                <Button>Start</Button>
            </PopoverTrigger>
            <PopoverContent>
                <PopoverArrow />
                <PopoverHeader>
                    Buy with transfer
                </PopoverHeader>
                <PopoverBody>
                    Include {uniquecode} in your transfer to the account details below.
                    An administrator will allocate your tickets upon confirmation
                </PopoverBody>
            </PopoverContent>
          </Popover>):( <Button onClick={buyTickets} disabled={!hasEnough || quantity <= 0}>Buy</Button>)}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
const RafflePage: NextPage = () => {
  const [raffle, setRaffle] = useState<any>();
  const token = useAuthStore((state) => state._authToken);
  useEffect(() => {
    function getActiveRaffle() {
      fetch(`${REST_URL}/api/raffle/active`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setRaffle(data.raffle);
        });
    }

    getActiveRaffle();
  }, []); // empty dependency array ensures the effect runs only once on mount

  return (
    <Flex
      flexDir="column"
      h="full"
      w="full"
      justifyContent="center"
      alignItems="center"
    >
      {raffle ? (
        <>
          <Flex
            flexDir="column"
            bg="gray.400"
            px={4}
            py={6}
            maxW={"50%"}
            w="full"
            rounded={8}
            pos="relative"
          >
            <Text textAlign={"center"} fontWeight={700} fontSize={"4xl"}>
              {raffle.Name}
            </Text>
            <Flex justifyContent="center">
              <FlipCountdown
                size="medium"
                hideYear
                hideMonth
                endAt={raffle.EndDate}
              />
            </Flex>

            <Text fontSize="xl" fontWeight={700} isTruncated textAlign="center">
              {raffle.TicketCount < raffle.MinTickets ? (
                <Text color={"orange"}>threshold unmet</Text>
              ) : (
                <Text color={"green"}>threshold met</Text>
              )}
            </Text>

            <Text
              fontSize="2xl"
              fontWeight={700}
              style={{ fontVariantNumeric: "proportional-nums" }}
              textAlign="center"
            >
              Tickets: ${raffle.Price}
            </Text>
            <Flex>
              <BuyTickets
                raffle={raffle}

                token={token}
              />
            </Flex>
          </Flex>
        </>
      ) : (
        <Text textAlign="center">There is no active raffle</Text>
      )}
    </Flex>
  );
};

export default RafflePage;
