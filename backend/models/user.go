package models

import the404 "github.com/404casino/backend"

type User struct {
	ID         int64
	MemberID   string
	Username   string
	FirstName  string
	LastName   string
	Permission []the404.Role
	StateID    int64
	Balance    int64
}
