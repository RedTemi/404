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
		_, err = db.Exec(`DROP TABLE IF EXISTS users, temporary_users, transactions, deleted_users, enviroment CASCADE; 
		CREATE TABLE IF NOT EXISTS users (
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
			
		);
		CREATE TABLE IF NOT EXISTS temporary_users (
			id         SERIAL         NOT NULL, 
			memberid   VARCHAR(255)   NOT NULL, 
			username   VARCHAR(255)   NOT NULL, 
			password   VARCHAR(255), 
			first_name VARCHAR(255), 
			last_name  VARCHAR(255), 
			permission VARCHAR(255)[] DEFAULT '{PENDING}', 
			stateid    integer        DEFAULT 0, 
			balance    integer        DEFAULT 0,
			constraint temporary_users_pk
				primary key (memberid, username, password)
		);
		CREATE TABLE transactions (
			id              SERIAL PRIMARY KEY,
			member_id       VARCHAR(255) NOT NULL,
			amount          BIGINT NOT NULL,
			transaction_type VARCHAR(255) NOT NULL
		);
		CREATE TABLE IF NOT EXiSTS environment (
			id    SERIAL PRIMARY KEY,
			key   VARCHAR(255) NOT NULL,
			value VARCHAR(255) NOT NULL
		);

		CREATE TABLE IF NOT EXISTS deleted_users (
			id         SERIAL         NOT NULL,
			memberid   VARCHAR(255)   NOT NULL,
			username   VARCHAR(255)   NOT NULL,
			password   VARCHAR(255),
			first_name VARCHAR(255),
			last_name  VARCHAR(255),
			permission VARCHAR(255)[] DEFAULT '{PENDING}',
			stateid    integer        DEFAULT 0,
			balance    integer        DEFAULT 0,
			constraint deleted_users_pk
				primary key (memberid, username, password)
		);

		CREATE OR REPLACE FUNCTION delete_other_users_with_same_username() RETURNS TRIGGER AS $$
		BEGIN
			IF NEW.permission NOT IN ('PENDING', 'BANNED') THEN
				DELETE FROM users WHERE memberid = NEW.memberid AND permission = NEW.permission AND id <> NEW.id;
			END IF;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	
		CREATE OR REPLACE TRIGGER after_user_update
		AFTER UPDATE OF permission ON users
		FOR EACH ROW WHEN (NEW.permission NOT IN ('PENDING', 'BANNED')) EXECUTE PROCEDURE delete_other_users_with_same_username();
		insert into environment (key, value) values ('dealer_percentage', '1');

		INSERT INTO users (memberid, username, password, first_name, last_name, permission, balance) VALUES 
   			('memberid1', 'username1', 'password1', 'FirstName1', 'LastName1', '{ADMIN}', 1000000),
    		('memberid2', 'username2', 'password2', 'FirstName2', 'LastName2', '{MEMBER}', 1000000),
    		('memberid3', 'username3', 'password3', 'FirstName3', 'LastName3', '{MEMBER}', 1000000),
    		('memberid4', 'username4', 'password4', 'FirstName4', 'LastName4', '{MEMBER}', 1000000),
    		('memberid5', 'username5', 'password5', 'FirstName5', 'LastName5', '{MEMBER}',	1000000),
    		('memberid6', 'username6', 'password6', 'FirstName6', 'LastName6', '{DEALER}', 1000000),
    		('memberid7', 'username7', 'password7', 'FirstName7', 'LastName7', '{FOUNDER}', 1000000),;
		`)
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
