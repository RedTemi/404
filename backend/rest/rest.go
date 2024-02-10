package rest

import (
	"database/sql"
	"encoding/json"
	"io"
	"os"
	"time"

	the404 "github.com/404casino/backend"
	"github.com/404casino/backend/models"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/gofiber/fiber/v3/middleware/logger"
	postgresStore "github.com/gofiber/storage/postgres/v3"
	_ "github.com/lib/pq"
	"github.com/phuslu/log"
)

type Server struct {
	App       *fiber.App
	cfg       *models.Config
	db        *sql.DB
	appConfig map[string]interface{}
}

func NewServer(app *fiber.App, connector *sql.DB, config *models.Config) *Server {
	var appConfig map[string]interface{}

	jsonFile, err := os.Open("appconfig.json")
	if err != nil {
		log.Error().Err(err).Msg("Couldn't open appconfig.json, if no changes have been made, this is normal.")
	} else {
		bytes, _ := io.ReadAll(jsonFile)

		err = json.Unmarshal(bytes, &appConfig)
		if err != nil {
			log.Fatal().Err(err).Msg("Couldn't parse config.json")
		}
	}
	defer jsonFile.Close()

	app.Use(cors.New(cors.Config{
		AllowHeaders:     "Origin,Content-Type,Accept,Content-Length,Accept-Language,Accept-Encoding,Connection,Access-Control-Allow-Origin,Authorization",
		AllowOrigins:     "*",
		AllowCredentials: true,
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
	}))

	return &Server{
		App:       app,
		db:        connector,
		cfg:       config,
		appConfig: appConfig,
	}
}

func (s *Server) Start() {
	store := postgresStore.New(postgresStore.Config{
		ConnectionURI: s.cfg.DatabaseURL,
	})

	api := s.App.Group("/api", logger.New())

	auth := api.Group("/auth")
	auth.Use(limiter.New(limiter.Config{
		Next: func(c fiber.Ctx) bool {
			return false // c.IP() == "127.0.0.1"
		},
		Max:        5,
		Expiration: 10 * time.Minute,
		KeyGenerator: func(c fiber.Ctx) string {
			if os.Getenv("ENV") == "PRODUCTION" {
				return c.Get("X-Forwarded-For")
			} else {
				return c.IP()
			}
		},
		Storage: store,
	}))

	auth.Post("/signup", s.postSignUpHandler)
	auth.Post("/login", s.postSignInHandler)

	users := api.Group("/users", s.requireAuthMiddleware)
	users.Get("/@me", s.getMeUser)
	users.Patch("/@me", s.patchMeUser)
	users.Get("/roles/:role", s.getUsersByRole, s.requireRoleMiddleware(the404.ADMIN))
	users.Get("/users/", s.getUsers, s.requireRoleMiddleware(the404.ADMIN))
	users.Get("/:id", s.getOtherUser)
	users.Patch("/:id", s.patchOtherUser, s.requireRoleMiddleware(the404.ADMIN))
	users.Delete("/deleteUser/:id", s.deleteUser, s.requireRoleMiddleware(the404.ADMIN))
	users.Patch("/banUser/:id", s.banUser, s.requireRoleMiddleware(the404.ADMIN))
	users.Patch("/unbanUser/:id", s.unBanUser, s.requireRoleMiddleware(the404.ADMIN))
	users.Patch("/approve/:id", s.approveUser, s.requireRoleMiddleware(the404.ADMIN))
	users.Patch("/settings/dealerPercentage/:percentage", s.setDealerPercentage, s.requireRoleMiddleware(the404.ADMIN))
	raffle := api.Group("/raffle", s.requireAuthMiddleware)
	raffle.Post("/create", s.createRaffle, s.requireRoleMiddleware(the404.ADMIN))
	raffle.Patch("/selectWinner/:id", s.selectRaffleWinner, s.requireRoleMiddleware(the404.ADMIN))
	raffle.Patch("/purchaseTicket/:id/:quantity", s.purchaseTicket, s.requireRoleMiddleware(the404.MEMBER))
	raffle.Get("/active", s.getCurrentRaffle)
	app := api.Group("/app")
	app.Get("/config", s.getAppConfig)
	app.Patch("/config", s.patchAppConfig, s.requireAuthMiddleware, s.requireRoleMiddleware(the404.ADMIN))
	settings := api.Group("/settings", s.requireAuthMiddleware, s.requireRoleMiddleware(the404.ADMIN))
	settings.Get("/", s.getSettings)
	settings.Patch("/", s.updateSettings)

}
