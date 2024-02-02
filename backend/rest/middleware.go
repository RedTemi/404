package rest

import (
	"errors"
	"strings"
	"time"

	the404 "github.com/404casino/backend"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

func (s *Server) requireAuthMiddleware(ctx fiber.Ctx) error {
	authBearer := ctx.Get(fiber.HeaderAuthorization)
	auth := strings.ReplaceAll(authBearer, "Bearer ", "")

	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(auth, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JwtKey), nil
	})
	if err != nil {
		return err
	}
	if token.Claims.(jwt.MapClaims)["exp"].(float64) <= float64(time.Now().Unix()) {
		return errors.New("token expired")
	}
	ctx.Locals(the404.JwtKey, token)
	return ctx.Next()
}

func (s *Server) requireRoleMiddleware(role the404.Role) fiber.Handler {
	return func(ctx fiber.Ctx) error {
		token := ctx.Locals(the404.JwtKey).(*jwt.Token)
		claims := token.Claims.(jwt.MapClaims)
		permission := claims["permission"].([]interface{})
		for _, v := range permission {
			if the404.Role(v.(string)) == role {
				return ctx.Next()
			}
		}

		return fiber.ErrUnauthorized
	}
}
