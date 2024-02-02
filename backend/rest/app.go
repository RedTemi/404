package rest

import (
	"os"

	"encoding/json"

	"github.com/gofiber/fiber/v3"
)

func (s *Server) getAppConfig(ctx fiber.Ctx) error {
	ctx.JSON(s.appConfig)
	return nil
}

func (s *Server) patchAppConfig(ctx fiber.Ctx) error {
	var changes map[string]interface{}
	json.Unmarshal(ctx.Body(), &changes)
	for key, elem := range changes {
		s.appConfig[key] = elem
	}
	bytes, _ := json.Marshal(s.appConfig)
	err := os.WriteFile("appconfig.json", bytes, 0644)
	return err
}
