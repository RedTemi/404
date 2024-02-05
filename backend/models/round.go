package models

// a model to store details of a round of roulette, including the winning number, wagers won by each player and the dealer payout percentage and the amount of money won by each player, if any; and a model to store the details of a player's wager, including the amount of money wagered, the number(s) wagered on, and the player's userid;

// Round represents a round of roulette
type Wager struct {
	ID        int     `json:"id"`
	UserID    int     `json:"user_id"`
	Amount    int     `json:"amount"`
	Number    int     `json:"number"`
	WinAmount float64 `json:"win_amount"`
}

type Round struct {
	ID               int     `json:"id"`
	WinningNum       int     `json:"winning_num"`
	DealerPercentage float64 `json:"dealer_pct"`
	DealerUID        int     `json:"dealer_uid"`
	PlayersWon       []int   `json:"players_won"`
	PlayersLost      []int   `json:"players_lost"`
	Wagers           []Wager `json:"wagers"`
	TotalWagers      int     `json:"total_wagers"`
	TotalPayout      float64 `json:"total_payout"`
}
