package models

type Raffle struct {
	ID          int64
	Price       int64
	Name        string
	StartDate   string
	EndDate     string
	MinTickets  int64
	Description string
}
