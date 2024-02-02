package models

import "github.com/404casino/backend/websocket"

type OtherBets string

const (
	DOZENS_ONE   OtherBets = "DOZENS_ONE"
	DOZENS_TWO   OtherBets = "DOZENS_TWO"
	DOZENS_THREE OtherBets = "DOZENS_THREE"
)

type Bet struct {
	User   int64
	Amount int64
	Color  string
	Number int64
	Class  OtherBets
}

type Room struct {
	ID             int64
	Players        []*ActiveUser
	Dealer         *ActiveUser
	Bets           []*Bet
	RemovedPlayers []*ActiveUser

	// Whether the bets are open or not
	IsBetsOpen bool

	// Whether the dealer has rolled the wheel or not
	IsRolled bool
}

type ActiveUser struct {
	User
	*websocket.Conn
}
