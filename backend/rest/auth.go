package rest

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	the404 "github.com/404casino/backend"
	"github.com/404casino/backend/models"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lib/pq"
	// "github.com/phuslu/log"
)

func (s *Server) postSignUpHandler(ctx fiber.Ctx) error {
	form, err := ctx.MultipartForm()
	if err != nil {
		return err
	}

	memberId, ok := form.Value["memberid"]
	// check that the memberid is present in thr allowed_memberids table
	// if not, return fiber.ErrBadRequest
	err = s.db.QueryRow("SELECT memberid FROM allowed_memberids WHERE memberid = $1", memberId[0]).Err()
	// log.Error().Err(err).Msg("Error reading message")

	if err != nil {
		return fiber.ErrBadRequest
	}
	if !ok {
		return fiber.ErrBadRequest
	}

	username, ok := form.Value["username"]
	if !ok {
		return fiber.ErrBadRequest
	}

	firstName, ok := form.Value["first_name"]
	if !ok {
		return fiber.ErrBadRequest
	}

	lastName, ok := form.Value["last_name"]
	if !ok {
		return fiber.ErrBadRequest
	}

	password, ok := form.Value["password"]
	if !ok {
		return fiber.ErrBadRequest
	}

	hashedPassword := s.hash(password[0])

	var userid int64
	err = s.db.QueryRow("INSERT INTO users (memberid, username, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id", memberId[0], username[0], hashedPassword, firstName[0], lastName[0]).Scan(&userid)
	if err != nil {
		return err
	}
	claims := jwt.MapClaims{
		"id":         userid,
		"permission": the404.PENDING,
		"exp":        time.Now().Add(time.Minute * 90).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(s.cfg.JwtKey))
	if err != nil {
		return err
	}

	return ctx.JSON(fiber.Map{
		"token": t,
	})
}

func (s *Server) postSignInHandler(ctx fiber.Ctx) error {
	form, err := ctx.MultipartForm()
	if err != nil {
		return err
	}

	username, ok := form.Value["username"]
	if !ok {
		return fiber.ErrBadRequest
	}

	password, ok := form.Value["password"]
	if !ok {
		return fiber.ErrBadRequest
	}

	hashedPassword := s.hash(password[0])

	var user models.User
	err = s.db.QueryRow("SELECT id, memberid, username, first_name, last_name, permission, stateid, balance FROM users WHERE username = $1 AND password = $2", username[0], hashedPassword).
		Scan(&user.ID, &user.MemberID, &user.Username, &user.FirstName, &user.LastName, pq.Array(&user.Permission), &user.StateID, &user.Balance)

	if err != nil {
		return err
	}

	claims := jwt.MapClaims{
		"id":         user.ID,
		"permission": user.Permission,
		"exp":        time.Now().Add(time.Minute * 90).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte(s.cfg.JwtKey))
	if err != nil {
		return err
	}

	return ctx.JSON(fiber.Map{
		"token": t,
	})
}

func (s *Server) hash(password string) string {
	hash := sha256.New()
	hash.Write([]byte(password + s.cfg.Salt))
	return hex.EncodeToString(hash.Sum(nil))
}
