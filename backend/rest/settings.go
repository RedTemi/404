package rest

import (
	"encoding/json"

	"github.com/gofiber/fiber/v3"
)

type environment struct {
	id    int64
	key   string
	value string
}

func (s *Server) getSettings(ctx fiber.Ctx) error {
	var settings environment
	// every setting is a key-value pair of the table environment, return all of them as a json object
	rows, err := s.db.Query("SELECT * FROM enviroment")
	if err != nil {
		return err
	}
	for rows.Next() {
		err = rows.Scan(&settings.id, &settings.key, &settings.value)
		if err != nil {
			return err
		}
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":   "success",
		"settings": settings,
	})
}

func (s *Server) updateSettings(ctx fiber.Ctx) error {
	var settings []environment
	json.Unmarshal(ctx.Body(), &settings)
	// update the value of a settings should be an array so a loop will be necessary
	for i := 0; i < len(settings); i++ {
		_, err := s.db.Exec("UPDATE environment SET value = $1 WHERE key = $2", settings[i].value, settings[i].key)
		if err != nil {
			return err
		}
	}
	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
	})
}
