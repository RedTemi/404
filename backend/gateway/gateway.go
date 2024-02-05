package gateway

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"slices"
	"time"

	the404 "github.com/404casino/backend"
	"github.com/404casino/backend/models"
	"github.com/404casino/backend/websocket"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lib/pq"
	"github.com/phuslu/log"
)

type Gateway struct {
	app *fiber.App
	db  *sql.DB
	cfg *models.Config

	rooms map[int64]models.Room
	users map[int64]*models.ActiveUser
}

func NewGateway(app *fiber.App, db *sql.DB, config *models.Config) *Gateway {
	return &Gateway{
		app:   app,
		cfg:   config,
		users: map[int64]*models.ActiveUser{},
		rooms: map[int64]models.Room{},
		db:    db,
	}
}

func (g *Gateway) Start() {
	g.app.Get("/ws", websocket.New(g.getWebSocket))
}

func (g *Gateway) getWebSocket(conn *websocket.Conn) {
	var userId int64
	var user models.User
	var activeSelf *models.ActiveUser
	var err error

	var (
		msg []byte
	)

	loggedIn := false
	go func(loggedIn *bool) {
		time.Sleep(time.Second * 5)
		if !*loggedIn {
			conn.WriteJSON(fiber.Map{
				"error": "You must login within 5 seconds",
			})
			conn.Close()
			return
		}
	}(&loggedIn)

	for {
		if _, msg, err = conn.ReadMessage(); err != nil {
			log.Error().Err(err).Msg("Error reading message")
			break
		}
		var message map[string]interface{}
		json.Unmarshal(msg, &message)
		sender := conn

	typeSelector:
		switch message["type"] {
		// Core messages
		case "auth":
			auth := message["token"].(string)
			claims := jwt.MapClaims{}
			token, err := jwt.ParseWithClaims(auth, claims, func(token *jwt.Token) (interface{}, error) {
				return []byte(g.cfg.JwtKey), nil
			})

			if err != nil {
				conn.WriteJSON(fiber.Map{
					"error": err.Error(),
				})
				conn.Close()
				return
			}

			claims = token.Claims.(jwt.MapClaims)
			if claims["exp"].(float64) <= float64(time.Now().Unix()) {
				conn.WriteJSON(fiber.Map{
					"error": "token expired",
				})
				conn.Close()
				return
			}
			userId = int64(claims["id"].(float64))

			err = g.db.QueryRow("SELECT id, memberid, username, first_name, last_name, permission, stateid, balance from users WHERE id = $1", userId).
				Scan(&user.ID, &user.MemberID, &user.Username, &user.FirstName, &user.LastName, pq.Array(&user.Permission), &user.StateID, &user.Balance)

			if err != nil {
				conn.WriteJSON(fiber.Map{
					"error": err.Error(),
				})
				conn.Close()
			}

			activeSelf = &models.ActiveUser{
				User: user,
				Conn: conn,
			}
			g.users[userId] = activeSelf
			loggedIn = true
		case "users":
			var users []*models.User
		outer2:
			for _, user := range g.users {
				for _, room := range g.rooms {
					for _, player := range room.Players {
						if player.ID == user.ID {
							continue outer2
						}
					}
				}
				users = append(users, &user.User)
			}
			sender.WriteJSON(fiber.Map{
				"type":  "users",
				"users": users,
			})
		case "rooms":
			var rooms []struct {
				ID           int64
				DealerName   string
				PlayersCount int
			}
		outer:
			for _, room := range g.rooms {
				for _, player := range room.RemovedPlayers {
					if player.ID == userId {
						continue outer
					}
				}
				rooms = append(rooms, struct {
					ID           int64
					DealerName   string
					PlayersCount int
				}{ID: room.ID, DealerName: fmt.Sprintf("%s %s", room.Dealer.FirstName, room.Dealer.LastName), PlayersCount: len(room.Players)})
			}
			sender.WriteJSON(fiber.Map{
				"type":  "rooms",
				"rooms": rooms,
			})

		// Room management
		case "create_room":
			id := g.rooms[int64(len(g.rooms)-1)].ID + 1 // lol
			g.rooms[id] = models.Room{
				ID:             id,
				Players:        []*models.ActiveUser{},
				RemovedPlayers: []*models.ActiveUser{},
				Bets:           []*models.Bet{},
				Dealer:         activeSelf,
				IsRolled:       false,
				IsBetsOpen:     true,
			}
			sender.WriteJSON(fiber.Map{
				"type": "room_created",
				"id":   id,
			})
		case "delete_room":
			roomId := int64(message["room_id"].(float64))
			room := g.rooms[int64(message["room_id"].(float64))]
			if !the404.ContainsAny(user.Permission, the404.ADMIN, the404.DEALER) {
				sender.WriteJSON(fiber.Map{
					"error": "User not authorized",
				})
				break typeSelector
			}
			for _, player := range room.Players {
				g.users[player.ID].WriteJSON(fiber.Map{
					"type":   "room_deleted",
					"reason": "DEALER_LEAVE",
					"id":     room.ID,
				})
			}
			delete(g.rooms, roomId)

		// Room user management
		case "knock":
			roomId := int64(message["room_id"].(float64))
			room, ok := g.rooms[roomId]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}

			room.Dealer.WriteJSON(fiber.Map{
				"type": "incoming_knock",
				"user": activeSelf,
			})
		case "add_to_room":
			target_id := int64(message["target_id"].(float64))
			target, ok := g.users[target_id]
			if !ok {
				// grab the user from the db and override target
				userFromDb := models.User{}
				err = g.db.QueryRow("SELECT id, memberid, username, first_name, last_name, permission, stateid, balance from users WHERE id = $1", target_id).
					Scan(&userFromDb.ID, &userFromDb.MemberID, &userFromDb.Username, &userFromDb.FirstName, &userFromDb.LastName, pq.Array(&userFromDb.Permission), &userFromDb.StateID, &userFromDb.Balance)
				if err != nil {
					sender.WriteJSON(fiber.Map{
						"error": err.Error(),
					})
				}
				break typeSelector
			}
			for _, room := range g.rooms {
				for _, player := range room.Players {
					if player.ID == target.ID {
						sender.WriteJSON(fiber.Map{
							"error": "User already in a room",
						})
						break typeSelector
					}
				}
			}

			targetRoom, ok := g.rooms[int64(message["room_id"].(float64))]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}

			if slices.Contains(targetRoom.RemovedPlayers, target) {
				// Remove ban
				newRemovedPlayers := []*models.ActiveUser{}
				for _, player := range targetRoom.RemovedPlayers {
					if player.ID != target.ID {
						newRemovedPlayers = append(newRemovedPlayers, player)
					}
				}

				targetRoom.RemovedPlayers = newRemovedPlayers
				g.rooms[targetRoom.ID] = targetRoom
			}

			for _, player := range targetRoom.Players {
				player.WriteJSON(fiber.Map{
					"type": "room_update",
					"room": targetRoom,
				})
			}

			targetRoom.Players = append(targetRoom.Players, g.users[target.ID])

			target.WriteJSON(fiber.Map{
				"type":    "room_invite",
				"room_id": targetRoom.ID,
				"room":    targetRoom,
			})
		case "join":
			roomId := int64(message["room_id"].(float64))
			room, ok := g.rooms[roomId]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}

			isUserInRoom := slices.Contains(room.Players, activeSelf)
			if isUserInRoom {
				// Don't do anything if the user is already in the room
				break typeSelector
			}

			appendedRoom := append(room.Players, activeSelf)
			joinMessage := fiber.Map{
				"type":    "join",
				"players": appendedRoom,
			}

			// Send the join message to the dealer and all players
			room.Dealer.WriteJSON(joinMessage)
			for _, player := range room.Players {
				player.WriteJSON(joinMessage)
			}

			// Set players w/ room state & re-assign the room
			room.Players = appendedRoom
			g.rooms[roomId] = room

			// Send the updated room to the user
			sender.WriteJSON(fiber.Map{
				"type": "room_update",
				"room": room,
			})
		case "leave":
			roomId := int64(message["room_id"].(float64))
			room, ok := g.rooms[roomId]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}

			// If dealer is the one who left, delete room instead
			if room.Dealer.ID == userId {
				roomDeletedMessage := fiber.Map{
					"type":   "room_deleted",
					"reason": "DEALER_LEAVE",
					"id":     room.ID,
				}

				// Announce to all players that the room has been deleted
				for _, player := range room.Players {
					player.WriteJSON(roomDeletedMessage)
				}
				delete(g.rooms, roomId)

				break typeSelector
			}

			for i, player := range room.Players {
				if player.ID == userId {
					room.Players = append(room.Players[:i], room.Players[i+1:]...)
				}
			}

			// Mutate global room
			g.rooms[roomId] = room

			for _, player := range room.Players {
				player.WriteJSON(fiber.Map{
					"type": "leave",
					"id":   userId,
				})
			}
			room.Dealer.WriteJSON(fiber.Map{
				"type": "leave",
				"id":   userId,
			})
		case "kick":
			room, ok := g.rooms[int64(message["room_id"].(float64))]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}
			if !the404.ContainsAny(user.Permission, the404.ADMIN, the404.DEALER) {
				sender.WriteJSON(fiber.Map{
					"error": "User not authorized",
				})
				break typeSelector
			}
			target, ok := g.users[int64(message["target_id"].(float64))]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "User not found",
				})
				break typeSelector
			}

			// Remove the player from the room
			// There is no way to remove a player from a slice, so we have to create a new one. Thanks Go.
			newPlayersList := []*models.ActiveUser{}
			for _, player := range room.Players {
				if player.ID != target.ID {
					newPlayersList = append(newPlayersList, player)
				}
			}

			// Assign new players list, add target to removed players & mutate global room
			room.Players = newPlayersList
			room.RemovedPlayers = append(room.RemovedPlayers, target)
			g.rooms[room.ID] = room

			roomUpdateMessage := fiber.Map{
				"type": "room_update",
				"room": room,
			}

			// Send kick message to target user
			target.WriteJSON(fiber.Map{
				"type":   "room_deleted",
				"reason": "KICKED",
				"id":     room.ID,
			})

			// Send updated room to dealer & the user
			room.Dealer.WriteJSON(roomUpdateMessage)
			for _, player := range room.Players {
				player.WriteJSON(roomUpdateMessage)
			}

		// Game - Roulette
		case "place_bet":
			roomId := int64(message["room_id"].(float64))
			room, ok := g.rooms[roomId]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}
			if !room.IsBetsOpen {
				sender.WriteJSON(fiber.Map{
					"error": "Bets are locked!",
				})
				break typeSelector
			}

			// If the user is a dealer, they can place bets for other users
			targetUserId := userId
			if the404.ContainsAny(user.Permission, the404.ADMIN, the404.DEALER) {
				messageTargetId := int64(message["target_id"].(float64))
				otherUser, ok := g.users[messageTargetId]

				if ok {
					targetUserId = otherUser.ID
				} else {
					sender.WriteJSON(fiber.Map{
						"error": "User not found",
					})

					break typeSelector
				}
			}

			targetUser := g.users[targetUserId]
			requestedBetAmount := int64(message["amount"].(float64))

			// Check if user's current balance is less than the bet amount
			userPlacedBetTotal := int64(0)
			for _, bets := range room.Bets {
				if bets.User == targetUserId {
					userPlacedBetTotal += bets.Amount
				}
			}
			if targetUser.Balance < requestedBetAmount+userPlacedBetTotal {
				sender.WriteJSON(fiber.Map{
					"error": "Insufficient funds",
				})
				break typeSelector
			}

			bet := models.Bet{
				User:   targetUserId,
				Amount: requestedBetAmount,

				Color:  message["color"].(string),
				Number: int64(message["number"].(float64)),
			}

			// Add the bet & mutate the global room
			room.Bets = append(room.Bets, &bet)
			g.rooms[roomId] = room

			g.users[room.Dealer.ID].WriteJSON(fiber.Map{
				"type": "bet_placed",
				"bet":  bet,
			})

			for _, players := range room.Players {
				players.WriteJSON(fiber.Map{
					"type": "bet_placed",
					"bet":  bet,
				})
			}
		case "lock_bets":
			roomID := int64(message["room_id"].(float64))
			room, ok := g.rooms[roomID]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}

			if !the404.ContainsAny(user.Permission, the404.ADMIN, the404.DEALER) {
				sender.WriteJSON(fiber.Map{
					"error": "User not authorized",
				})
				break typeSelector
			}

			if room.IsRolled {
				sender.WriteJSON(fiber.Map{
					"error": "Already rolled. Please reset the room.",
				})
				break typeSelector
			}

			// Mutate the room & save
			room.IsBetsOpen = message["open"].(bool)
			g.rooms[roomID] = room

			updateMessage := fiber.Map{
				"type":    "bets_status",
				"is_open": room.IsBetsOpen,
			}

			// Send bet status to all players & dealers
			room.Dealer.WriteJSON(updateMessage)
			for _, player := range room.Players {
				player.WriteJSON(updateMessage)
			}
		case "spin":
			roomId := int64(message["room_id"].(float64))
			room, ok := g.rooms[roomId]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}
			if !the404.ContainsAny(user.Permission, the404.ADMIN, the404.DEALER) {
				sender.WriteJSON(fiber.Map{
					"error": "User not authorized",
				})
				break typeSelector
			}
			if room.IsBetsOpen {
				sender.WriteJSON(fiber.Map{
					"error": "Bets are still open. Close it before spinning.",
				})
				break typeSelector
			}
			if room.IsRolled {
				sender.WriteJSON(fiber.Map{
					"error": "Already rolled. Please reset the room.",
				})
				break typeSelector
			}

			// Winner number
			number := int64(message["number"].(float64))
			number_color := getColor(int(number))

			winnings := make(map[int64]int64)

			EXACT_PAYOUT := int64(32)
			COLOR_PAYOUT := int64(2)
			DOZENS_PAYOUT := int64(12)

			for _, bet := range room.Bets {
				switch {
				case bet.Number == number: // knew the number
					payout := bet.Amount * EXACT_PAYOUT
					winnings[bet.User] += payout
					_, err := g.db.Exec("UPDATE users SET balance = balance + $1 WHERE id = $2", payout, bet.User)
					if err != nil {
						log.Error().Err(err).Msgf("Error awarding %d to winner %d", payout, bet.User)
					}
				case bet.Color == number_color: // picked the right color
					payout := bet.Amount * COLOR_PAYOUT
					winnings[bet.User] += payout
					_, err := g.db.Exec("UPDATE users SET balance = balance + $1 WHERE id = $2", payout, bet.User)
					if err != nil {
						log.Error().Err(err).Msgf("Error awarding %d to winner %d", payout, bet.User)
					}
				case bet.Class == models.DOZENS_ONE: // First dozen
					payout := bet.Amount * DOZENS_PAYOUT
					winnings[bet.User] += payout
					_, err := g.db.Exec("UPDATE users SET balance = balance + $1 WHERE id = $2", payout, bet.User)
					if err != nil {
						log.Error().Err(err).Msgf("Error awarding %d to winner %d", payout, bet.User)
					}
				case bet.Class == models.DOZENS_TWO: // Second dozen
					payout := bet.Amount * DOZENS_PAYOUT
					winnings[bet.User] += payout
					_, err := g.db.Exec("UPDATE users SET balance = balance + $1 WHERE id = $2", payout, bet.User)
					if err != nil {
						log.Error().Err(err).Msgf("Error awarding %d to winner %d", payout, bet.User)
					}
				case bet.Class == models.DOZENS_THREE: // Third dozen
					payout := bet.Amount * DOZENS_PAYOUT
					winnings[bet.User] += payout
					_, err := g.db.Exec("UPDATE users SET balance = balance + $1 WHERE id = $2", payout, bet.User)
					if err != nil {
						log.Error().Err(err).Msgf("Error awarding %d to winner %d", payout, bet.User)
					}
				}
			}

			// Mutate the room & save
			room.IsRolled = true
			g.rooms[roomId] = room

			// Send winnings to dealer & all players
			// get dealer percentage from database enviroment as key dealer_percentage
			dealerPercentage := 0.0
			err = g.db.QueryRow("SELECT value FROM enviroment WHERE key = 'dealer_percentage'").Scan(&dealerPercentage)
			// pay the dealer a percentage of the wagered sum
			dealerWinnings := int64(0)
			for _, bet := range room.Bets {
				dealerWinnings += int64(float64(bet.Amount) * dealerPercentage)
			}
			room.Dealer.WriteJSON(fiber.Map{
				"type": "winnings",
				"roll": number,
			})
			for _, player := range room.Players {
				player.WriteJSON(fiber.Map{
					"type":   "winnings",
					"roll":   number,
					"amount": winnings[player.ID],
				})
			}

		case "reset":
			roomId := int64(message["room_id"].(float64))
			room, ok := g.rooms[roomId]
			if !ok {
				sender.WriteJSON(fiber.Map{
					"error": "Room not found",
				})
				break typeSelector
			}
			if !the404.ContainsAny(user.Permission, the404.ADMIN, the404.DEALER) {
				sender.WriteJSON(fiber.Map{
					"error": "User not authorized",
				})
				break typeSelector
			}
			if !room.IsRolled {
				sender.WriteJSON(fiber.Map{
					"error": "Not rolled yet.",
				})
				break typeSelector
			}

			// Mutate the room & save
			room.IsRolled = false
			room.IsBetsOpen = true
			room.Bets = []*models.Bet{}
			g.rooms[roomId] = room

			// Announce the reset to dealers & all players
			resetData := fiber.Map{
				"type": "reset",
				"room": room,
			}

			room.Dealer.WriteJSON(resetData)
			for _, player := range room.Players {
				player.WriteJSON(resetData)
			}

		}
	}

	// Remove the user from the connected users list
	delete(g.users, userId)

	// Remove the user from their room, then notify others of the change
	for _, room := range g.rooms {
		for i, player := range room.Players {
			if player.ID == userId {
				room.Players = append(room.Players[:i], room.Players[i+1:]...)

				if player.ID == room.Dealer.ID {
					for _, remainingPlayer := range room.Players {
						remainingPlayer.WriteJSON(fiber.Map{
							"type":   "room_deleted",
							"reason": "DEALER_LEAVE",
							"room":   room,
						})
					}
				} else {
					for _, remainingPlayer := range room.Players {
						remainingPlayer.WriteJSON(fiber.Map{
							"type": "room_update",
							"room": room,
						})
					}

					room.Dealer.WriteJSON(fiber.Map{
						"type": "room_update",
						"room": room,
					})
				}
				break
			}
		}
	}

}

func getColor(number int) string {
	switch {
	case number == 0 || number == 37:
		return "green"
	case (number < 0 && number <= 10 || number >= 19 && number <= 28) && number%2 == 0:
		return "black"
	case (number < 0 && number <= 10 || number >= 19 && number <= 28) && number%2 != 0:
		return "red"
	case (number >= 11 && number <= 18 || number >= 29 && number <= 36) && number%2 == 0:
		return "red"
	case (number >= 11 && number <= 18 || number >= 29 && number <= 36) && number%2 != 0:
		return "black"
	}
	return "black"
}
