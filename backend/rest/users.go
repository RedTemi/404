package rest

import (
	"encoding/json"

	the404 "github.com/404casino/backend"
	"github.com/404casino/backend/models"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lib/pq"
	"github.com/phuslu/log"
)

func (s *Server) getMeUser(ctx fiber.Ctx) error {
	auth := ctx.Locals(the404.JwtKey).(*jwt.Token)
	claims := auth.Claims.(jwt.MapClaims)
	userId := claims["id"].(float64)

	var user models.User
	err := s.db.QueryRow("SELECT id, memberid, username, first_name, last_name, permission, stateid, balance from users WHERE id = $1", userId).
		Scan(&user.ID, &user.MemberID, &user.Username, &user.FirstName, &user.LastName, pq.Array(&user.Permission), &user.StateID, &user.Balance)

	if err != nil {
		return err
	}

	return ctx.JSON(user)
}

func (s *Server) patchMeUser(ctx fiber.Ctx) error {
	auth := ctx.Locals(the404.JwtKey).(*jwt.Token)
	claims := auth.Claims.(jwt.MapClaims)
	userId := claims["id"].(float64)

	var changes map[string]interface{}
	json.Unmarshal(ctx.Body(), &changes)

	if changes["password"] != nil {
		hashedPassword := s.hash(changes["password"].(string))

		_, err := s.db.Exec("UPDATE `users` SET password = $1 WHERE id = $2", hashedPassword, userId)
		if err != nil {
			return err
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
	})
}

func (s *Server) getOtherUser(ctx fiber.Ctx) error {
	userId := ctx.Params("id")

	var user models.User
	err := s.db.QueryRow("SELECT id, memberid, username, first_name, last_name, permission, stateid, balance from users WHERE id = $1", userId).
		Scan(&user.ID, &user.MemberID, &user.Username, &user.FirstName, &user.LastName, pq.Array(&user.Permission), &user.StateID, &user.Balance)

	if err != nil {
		return err
	}
	return ctx.JSON(user)
}

func (s *Server) patchOtherUser(ctx fiber.Ctx) error {
	userId := ctx.Params("id")
	var changes map[string]interface{}
	json.Unmarshal(ctx.Body(), &changes)

	if changes["permission"] != nil {
		defaultBalance, ok := s.appConfig["default_balance"].(map[string]interface{})[changes["permission"].(string)]
		if !ok {
			log.Error().Interface("permission", changes["permission"]).Msg("Couldn't find default balance for permission, setting to 0")
			defaultBalance = 0
		}
		perm := []string{changes["permission"].(string)}
		_, err := s.db.Exec("UPDATE users SET permission = $1, balance = balance + $3 + 1 WHERE id = $2", pq.Array(perm), userId, defaultBalance)
		if err != nil {
			return err
		}
	}

	if changes["stateid"] != nil {
		_, err := s.db.Exec("UPDATE users SET stateid = $1 WHERE id = $2", changes["stateid"], userId)
		if err != nil {
			return err
		}
	}

	if changes["balance"] != nil {
		_, err := s.db.Exec("UPDATE users SET balance = $1 WHERE id = $2", changes["balance"], userId)
		if err != nil {
			return err
		}
	}

	if changes["password"] != nil {
		hashedPassword := s.hash(changes["password"].(string))

		_, err := s.db.Exec("UPDATE `users` SET password = $1 WHERE id = $2", hashedPassword, userId)
		if err != nil {
			return err
		}
	}

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
	})
}

func (s *Server) getUsersByRole(ctx fiber.Ctx) error {
	role := ctx.Params("role")
	var users []models.User
	rows, err := s.db.Query("SELECT id, memberid, username, first_name, last_name, permission, stateid, balance FROM users WHERE permission = ANY($1) ORDER BY id ASC", role)
	if err != nil {
		return err
	}
	for rows.Next() {
		var user models.User
		err = rows.Scan(&user.ID, &user.MemberID, &user.Username, &user.FirstName, &user.LastName, pq.Array(&user.Permission), &user.StateID, &user.Balance)
		if err != nil {
			return err
		}
		users = append(users, user)
	}
	return ctx.JSON(users)
}

func (s *Server) getUsers(ctx fiber.Ctx) error {
	var users []models.User
	rows, err := s.db.Query(`
		SELECT id, memberid, username, first_name, last_name, permission, stateid, balance FROM users ORDER BY id ASC
	`)
	if err != nil {
		return err
	}
	for rows.Next() {
		var user models.User
		err = rows.Scan(&user.ID, &user.MemberID, &user.Username, &user.FirstName, &user.LastName, pq.Array(&user.Permission), &user.StateID, &user.Balance)
		if err != nil {
			return err
		}
		users = append(users, user)
	}
	return ctx.JSON(users)
}

// write the user to the deleted_users table
// new function to copy user to deleted_users table takes user id as parameter

func (s *Server) deleteUser(ctx fiber.Ctx) error {
	userId := ctx.Params("id")
	deletePermanently := ctx.Query("permanent") == "true"
	// except if permanent is true, write the user to the deleted_users table
	if !deletePermanently {
		_, err := s.db.Exec("INSERT INTO deleted_users (memberid, username, password, first_name, last_name, permission, stateid, balance) SELECT memberid, username, password, first_name, last_name, permission, stateid, balance FROM users WHERE id = $1; DELETE FROM users WHERE id = $1;", userId)
		if err != nil {
			return err
		}
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "success",
		})
	} else {
		_, err := s.db.Exec("DELETE FROM users WHERE id = $1", userId)
		if err != nil {
			return err
		}
		return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "success",
		})
	}
}
