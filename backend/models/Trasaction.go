package models

// import the404 "github.com/404casino/backend"
// create an enum for events that create transactions such as player bets, player wins,dealer payouts, deposits and withdrawals.

type TransactionType string

const (
	WIN      TransactionType = "WIN"
	PAYOUT   TransactionType = "PAYOUT"
	DEPOSIT  TransactionType = "DEPOSIT"
	WITHDRAW TransactionType = "WITHDRAW"
	BET      TransactionType = "BET"
)

type Transaction struct {
	ID              int64
	MemberID        string
	Amount          int64
	TransactionType TransactionType
}
