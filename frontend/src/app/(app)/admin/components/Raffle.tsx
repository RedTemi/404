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
    control,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(RaffleCreateSchema),
  });

  const toast = useToast();
  return (
    <Form
      control={control}
     
      onSubmitCapture={handleSubmit(
        async ({ data }) => {
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
      )}
    >
      <FormControl isRequired>
        <FormLabel>Raffle Name</FormLabel>
        <InputGroup>
          <Input
            autoComplete="off"
            isInvalid={errors.name ? true : false}
            {...register("name", { required: true })}
          />
        </InputGroup>
        <FormHelperText>
          {errors.name?.message ? "Invalid input." : ""}
        </FormHelperText>
      </FormControl>
      <Flex py={4} flexDir="row" gap={5} minW="40vw">
        <FormControl isRequired>
          <FormLabel>Start Date</FormLabel>
          <Input
            type={"date"}
            autoComplete="off"
            aria-invalid={errors.start_date ? true : false}
            {...register("start_date", { required: true })}
          />
          <FormHelperText>
            {errors.start_date?.message ? "Invalid input." : ""}
          </FormHelperText>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>End Date</FormLabel>
          <Input
            type={"date"}
            autoComplete="off"
            aria-invalid={errors.end_date ? true : false}
            {...register("end_date", { required: true })}
          />
          <FormHelperText>
            {errors.end_date?.message ? "Invalid input." : ""}
          </FormHelperText>
        </FormControl>
      </Flex>
      <Flex py={4} flexDir="row" gap={5} minW="40vw">
        <FormControl isRequired>
          <FormLabel>Ticket Price</FormLabel>
          <Input
            type={"number"}
            autoComplete="off"
            aria-invalid={errors.price ? true : false}
            {...register("ticket_price", { required: true })}
          />
          <FormHelperText>
            {errors.ticket_price?.message ? "Invalid input." : ""}
          </FormHelperText>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Minimum Tickets</FormLabel>
          <Input
            type={"number"}
            autoComplete="off"
            aria-invalid={errors.minimum_tickets ? true : false}
            {...register("minimum_tickets", { required: true })}
          />
        </FormControl>
      </Flex>
      <FormControl isRequired>
        <FormLabel>Raffle Description</FormLabel>
        <Input
          autoComplete="off"
          isInvalid={errors.raffle_description ? true : false}
          {...register("raffle_description", { required: true })}
        />
        <FormHelperText>
          {errors.raffle_description?.message ? "Invalid input." : ""}
        </FormHelperText>
      </FormControl>
      <Button
        type="submit"
        minW="full"
        variant="outline"
        rightIcon={<FaArrowRight />}
      >
        Create Raffle
      </Button>
    </Form>
  );
}

export default RaffleL;
