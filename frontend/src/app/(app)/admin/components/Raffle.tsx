"use client";
import { REST_URL } from "@/util/constants";
import { normalizeError } from "@/util/errors";
import { RaffleEditSchema, RaffleCreateSchema } from "@/util/schemas/raffle";
import { useAuthStore } from "@/stores/auth";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  useToast,
} from "@chakra-ui/react";
import { joiResolver } from "@hookform/resolvers/joi";
import { Form, useForm, SubmitHandler, FormState } from "react-hook-form";
import { FaArrowRight } from "react-icons/fa6";

type FormValues = {
  name: string,
  start_date: string,
  end_date: string,
  ticket_price: number,
  minimum_tickets: number,
  raffle_description: string
}

function RaffleL() {
  const user = useAuthStore((state) => state.user);

  return (
    <Flex flexDir="column" alignItems="center" minW="d40vw" gap={6}>
      <Heading textAlign="center" py={6}>
        Create a raffle
      </Heading>

      <>
        <Raffle />
      </>
    </Flex>
  );
}

 function Raffle() {
  const token = useAuthStore((state) => state._authToken);
  const {
    register,
    handleSubmit,
  } = useForm<FormValues>();
  const onsubmit: SubmitHandler<FormValues> = async(data)=>{
      console.log(data);
        try {
          const response = await fetch(`${REST_URL}/api/raffle/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });
  
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
  
          const responseData = await response.json();
  
          toast({
            title: "Raffle created.",
            description: "We've created your raffle for you.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
  
          console.log(responseData); // Log response data if needed
        } catch (error:any) {
          toast({
            title: "An error occurred.",
            description: `Unable to create a raffle: ${error.message}`,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
      
  }
  const toast = useToast();
  return (
    <form
        onSubmit={handleSubmit(onsubmit)}
       >
      <FormControl isRequired>
        <FormLabel>Raffle Name</FormLabel>
        <InputGroup>
          <Input
            autoComplete="off"
            {...register("name", { required: true })}
          />
        </InputGroup>
    
      </FormControl>
      <Flex py={4} flexDir="row" gap={5} minW="40vw">
        <FormControl isRequired>
          <FormLabel>Start Date</FormLabel>
          <Input
            type={"date"}
            autoComplete="off"
            {...register("start_date", { required: true })}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>End Date</FormLabel>
          <Input
            type={"date"}
            autoComplete="off"
          
            {...register("end_date", { required: true })}
          />
        
        </FormControl>
      </Flex>
      <Flex py={4} flexDir="row" gap={5} minW="40vw">
        <FormControl isRequired>
          <FormLabel>Ticket Price</FormLabel>
          <Input
            type={"number"}
            autoComplete="off"
      
            {...register("ticket_price", { required: true })}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Minimum Tickets</FormLabel>
          <Input
            type={"number"}
            autoComplete="off"
            {...register("minimum_tickets", { required: true })}
          />
        </FormControl>
      </Flex>
      <FormControl isRequired>
        <FormLabel>Raffle Description</FormLabel>
        <Input
          autoComplete="off"
          {...register("raffle_description", { required: true })}
        />
     
      </FormControl>
      <Button
        type="submit"
        minW="full"
        variant="outline"
        rightIcon={<FaArrowRight />}
      >
        Create Raffle
      </Button>
    </form>
  );
}

export default RaffleL;
