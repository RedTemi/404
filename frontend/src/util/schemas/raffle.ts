import Joi from "joi";

const requiredString = Joi.string().required();
const requiredDate = Joi.date().required();
const requiredNumber = Joi.number().required();

const RaffleCreateSchema = Joi.object({
    name: requiredString,
    start_date: requiredDate,
    end_date: requiredDate,
    ticket_price: requiredNumber,
    minimum_tickets: requiredNumber,
    raffle_description: requiredString
})


const RaffleEditSchema = Joi.object({
    name: requiredString,
    start_date: requiredDate,
    end_date: requiredDate,
    ticket_price: requiredNumber,
    minimum_tickets: requiredNumber,
    raffle_description: requiredString
})

export { RaffleEditSchema, RaffleCreateSchema };

