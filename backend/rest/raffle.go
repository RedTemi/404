package rest

import (
	"encoding/json"

	the404 "github.com/404casino/backend"
	"github.com/404casino/backend/models"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

// functions to handle raffle creation, winner selection and ticket purchase
func (s *Server) createRaffle(ctx fiber.Ctx) error {
	var raffle map[string]interface{}
	json.Unmarshal(ctx.Body(), &raffle)
	// if there are no unexpired raffles, create a new one
	_, err := s.db.Exec("DELETE FROM raffles WHERE end_date < NOW()")
	if err != nil {
		return err
	}

	_, err = s.db.Exec("INSERT INTO raffles (raffle_name, start_date, end_date, minimum_tickets, ticket_price, raffle_description) VALUES ($1, $2, $3, $4, $5, $6)", raffle["name"], raffle["start_date"], raffle["end_date"], raffle["minimum_tickets"], raffle["ticket_price"], raffle["raffle_description"])
	if err != nil {
		return err
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
	})
}

func (s *Server) selectRaffleWinner(ctx fiber.Ctx) error {
	raffleId := ctx.Params("id")
	_, err := s.db.Exec("SELECT select_winner($1)", raffleId)
	if err != nil {
		return err
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
	})
}

func (s *Server) purchaseTicket(ctx fiber.Ctx) error {
	userId := ctx.Locals(the404.JwtKey).(*jwt.Token).Claims.(jwt.MapClaims)["id"].(float64)
	raffleId := ctx.Params("id")
	ticketQuantity := ctx.Params("quantity")
	_, err := s.db.Exec("SELECT purchase_ticket($1, $2, $3)", userId, raffleId, ticketQuantity)
	if err != nil {
		return err
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
	})
}

func (s *Server) getRaffleTickets(ctx fiber.Ctx) error {
	raffleId := ctx.Params("id")
	// get tickets for the raffle from the participants table
	rows, err := s.db.Query("SELECT * FROM participants WHERE raffle_id = $1", raffleId)
	if err != nil {
		return err
	}
	var tickets map[int64]interface{}
	for rows.Next() {
		var ticket struct {
			ID             int
			RaffleID       int
			UserID         int
			TicketQuantity int
		}

		rows.Scan(&ticket.ID, &ticket.RaffleID, &ticket.UserID, &ticket.TicketQuantity)
		tickets[int64(ticket.ID)] = ticket
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"tickets": tickets,
	})
}

func (s *Server) getCurrentRaffle(ctx fiber.Ctx) error {
	var raffle models.Raffle
	err := s.db.QueryRow("SELECT raffle_id, raffle_name, start_date, end_date, minimum_tickets, ticket_price, ticket_count, raffle_description FROM raffles WHERE end_date > NOW() LIMIT 1").
		Scan(&raffle.ID, &raffle.Name, &raffle.StartDate, &raffle.EndDate, &raffle.MinTickets, &raffle.Price, &raffle.TicketCount, &raffle.Description)
	if err != nil {
		return err
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"raffle": raffle,
	})
}
