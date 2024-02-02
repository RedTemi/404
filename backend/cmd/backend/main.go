package main

import (
	"database/sql"
	"flag"
	"io"
	"os"
	"time"

	"encoding/json"

	"github.com/404casino/backend/gateway"
	"github.com/404casino/backend/models"
	"github.com/404casino/backend/rest"
	"github.com/gofiber/fiber/v3"
	_ "github.com/lib/pq"
	"github.com/phuslu/log"
)

func main() {
	log.DefaultLogger = log.Logger{
		TimeFormat: time.Stamp,
		Caller:     1,
		Writer: &log.ConsoleWriter{
			ColorOutput:    true,
			QuoteString:    true,
			EndWithMessage: true,
		},
	}

	standaloneFlag := flag.Bool("standalone", true, "")
	restFlag := flag.Bool("rest", false, "")
	gatewayFlag := flag.Bool("gateway", false, "")
	initFlag := flag.Bool("init", true, "")
	configFlag := flag.String("config", "config.json", "")

	flag.Parse()

	jsonFile, err := os.Open(*configFlag)
	if err != nil {
		log.Fatal().Err(err).Msg("Couldn't open config.json")
	}
	defer jsonFile.Close()

	bytes, _ := io.ReadAll(jsonFile)

	var config models.Config
	err = json.Unmarshal(bytes, &config)
	if err != nil {
		log.Fatal().Err(err).Msg("Couldn't parse config.json")
	}

	db, err := sql.Open("postgres", config.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Couldn't connect to psql")
	}
	defer db.Close()

	if *initFlag {
		log.Info().Msg("Initializing database")
		_, err = db.Exec(`DROP TABLE IF EXISTS users; 
		CREATE TABLE users (
			id         SERIAL         NOT NULL, 
			memberid   VARCHAR(255)   NOT NULL, 
			username   VARCHAR(255)   NOT NULL, 
			password   VARCHAR(255), 
			first_name VARCHAR(255), 
			last_name  VARCHAR(255), 
			permission VARCHAR(255)[] DEFAULT '{PENDING}', 
			stateid    integer        DEFAULT 0, 
			balance    integer        DEFAULT 0,
			constraint newusers_pk
				primary key (memberid, username, password)
		);`)
		if err != nil {
			log.Fatal().Err(err).Msg("Failed to initialize database")
		}
	}

	app := fiber.New()

	if *standaloneFlag || *restFlag {
		log.Info().Msg("Starting up rest api")
		server := rest.NewServer(app, db, &config)
		server.Start()
	}

	if *standaloneFlag || *gatewayFlag {
		log.Info().Msg("Starting up gateway server")
		server := gateway.NewGateway(app, db, &config)
		server.Start()
	}

	if config.UseSSL && *gatewayFlag {
		err = app.Listen(":8443", fiber.ListenConfig{
			CertFile:    "cert.crt",
			CertKeyFile: "key.key",
		})
	} else {
		err = app.Listen(config.Port)
	}

	if err != nil {
		log.Fatal().Err(err).Msg("Couldn't start Fiber")
	}
}
