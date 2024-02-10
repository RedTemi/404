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
		_, err = db.Exec(`
		DROP TABLE IF EXISTS temporary_users, transactions, deleted_users, enviroment, participants,winners, raffles,round_data CASCADE; 
		CREATE TABLE IF NOT EXISTS users (
			id         SERIAL         NOT NULL, 
			memberid   VARCHAR(255)   NOT NULL, 
			username   VARCHAR(255)   NOT NULL UNIQUE, 
			password   VARCHAR(255), 
			first_name VARCHAR(255), 
			last_name  VARCHAR(255), 
			permission VARCHAR(255)[] DEFAULT '{PENDING}', 
			stateid    integer        DEFAULT 0, 
			balance    integer        DEFAULT 0,
			Reputation_name VARCHAR(255) DEFAULT 'Newbie',
			Reputation integer        DEFAULT 0,
			date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			constraint newusers_pk
			primary key (memberid, username, password)
			
		);


		CREATE TABLE IF NOT EXISTS transactions (
			id               SERIAL PRIMARY KEY,
			member_id        VARCHAR(255) NOT NULL,
			amount           BIGINT NOT NULL,
			transaction_type VARCHAR(255) NOT NULL,
			credit		  	 BOOLEAN NOT NULL,
			transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		-- Create a table to store raffle information
		CREATE TABLE raffles (
			raffle_id SERIAL PRIMARY KEY,
			raffle_name VARCHAR(100) NOT NULL,
			start_date DATE NOT NULL,
			end_date DATE NOT NULL,
			winning_ticket_number INTEGER,
			minimum_tickets INTEGER NOT NULL,
			ticket_price INTEGER NOT NULL,
			ticket_count INTEGER DEFAULT 0,
			raffle_description TEXT NOT NULL
		);
		CREATE OR REPLACE FUNCTION approve_pending_tickets(p_tracking_code VARCHAR(255)) RETURNS VOID AS $$
		DECLARE
			p_raffle_id INTEGER;
			p_username VARCHAR(225);
			p_quantity INTEGER;
			i INTEGER := 1;
		BEGIN
			-- Retrieve pending ticket details
			SELECT raffle_id, username, quantity INTO p_raffle_id, p_username, p_quantity FROM pending_tickets WHERE tracking_code = p_tracking_code;

			-- Check if the raffle exists
			IF NOT EXISTS (SELECT 1 FROM raffles WHERE raffle_id = p_raffle_id) THEN
				RAISE EXCEPTION 'Raffle does not exist';
			END IF;

			-- Check if the raffle is still open
			IF (SELECT end_date FROM raffles WHERE raffle_id = p_raffle_id) < CURRENT_DATE THEN
				RAISE EXCEPTION 'Raffle is closed';
			END IF;

			-- Check if the user exists
			IF NOT EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
				RAISE EXCEPTION 'User does not exist';
			END IF;

	
			INSERT INTO participants (raffle_id, username, ticket_quantity) VALUES (p_raffle_id, p_username, p_quantity);
			

			-- Delete the pending ticket
			DELETE FROM pending_tickets WHERE tracking_code = p_tracking_code;

		END;
		$$ LANGUAGE plpgsql;

	
		-- Create a function to generate random ticket numbers
		CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS INTEGER AS $$
		DECLARE
			new_ticket_number INTEGER;
		BEGIN
			-- Generate a random number between 1 and 1000000 (adjust range as needed)
			new_ticket_number := floor(random() * 1000000) + 1;
			-- Check if the generated ticket number already exists
			WHILE EXISTS (SELECT 1 FROM participants WHERE ticket_number = new_ticket_number) LOOP
				-- Generate a new random ticket number if the generated one already exists
				new_ticket_number := floor(random() * 1000000) + 1;
			END LOOP;
			RETURN new_ticket_number;
		END;
		$$ LANGUAGE plpgsql;

		
		-- Create a table to store participant information
		CREATE TABLE participants (
			participant_id SERIAL PRIMARY KEY,
			raffle_id INTEGER REFERENCES raffles(raffle_id),
			username VARCHAR(225) NOT NULL references users(username),
			ticket_number INTEGER NOT NULL DEFAULT generate_ticket_number(),
			date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			ticket_quantity INTEGER DEFAULT 1,
			UNIQUE(raffle_id, ticket_number) -- Ensure uniqueness of ticket number within each raffle
			);
		
		-- when a new row is inserted into the participants table, the ticket count of the raflle should be updated
		CREATE OR REPLACE FUNCTION update_raffle_ticket_count() RETURNS TRIGGER AS $$
		BEGIN
			-- Update the ticket count of the raffle
			UPDATE raffles SET ticket_count = ticket_count + NEW.ticket_quantity WHERE raffle_id = NEW.raffle_id;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;

		CREATE TRIGGER update_raffle_ticket_count_trigger
		AFTER INSERT ON participants
		FOR EACH ROW
		EXECUTE PROCEDURE update_raffle_ticket_count();
		
			
		CREATE OR REPLACE FUNCTION purchase_ticket(p_raffle_id INTEGER, p_username VARCHAR(225), quantity INTEGER DEFAULT 1) RETURNS VOID AS $$
		DECLARE
			ticket_count INTEGER;
			ticket_number INTEGER;
		BEGIN
			-- Check if the raffle exists
			IF NOT EXISTS (SELECT 1 FROM raffles WHERE raffle_id = p_raffle_id) THEN
				RAISE EXCEPTION 'Raffle does not exist';
			END IF;
			-- Check if the raffle is still open
			IF (SELECT end_date FROM raffles WHERE raffle_id = p_raffle_id) < CURRENT_DATE THEN
				RAISE EXCEPTION 'Raffle is closed';
			END IF;
			-- Check if the user exists
			IF NOT EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
				RAISE EXCEPTION 'User does not exist';
			END IF;
			-- Check if the user has enough balance to purchase the ticket(s)
			IF (SELECT balance FROM users WHERE username = p_username) < (SELECT ticket_price * quantity FROM raffles WHERE raffle_id = p_raffle_id) THEN
				RAISE EXCEPTION 'Insufficient balance';
			END IF;
			INSERT INTO participants (raffle_id, username, ticket_quantity) VALUES (p_raffle_id, p_username,qunatity);
	
			-- Deduct the ticket price from the user's balance
			UPDATE users SET balance = balance - (SELECT ticket_price * quantity FROM raffles WHERE raffle_id = p_raffle_id) WHERE username = p_username;
		END;
		$$ LANGUAGE plpgsql;


		-- Create a table to store winners
		CREATE TABLE winners (
			winner_id SERIAL PRIMARY KEY,
			raffle_id INTEGER REFERENCES raffles(raffle_id),
			participant_id INTEGER REFERENCES participants(participant_id),
			prize VARCHAR(100) NOT NULL
		);

		
		CREATE TABLE IF NOT EXiSTS environment (
			id    SERIAL PRIMARY KEY,
			key   VARCHAR(255) NOT NULL UNIQUE,
			value VARCHAR(255) NOT NULL
		);
		CREATE TABLE IF NOT EXISTS allowed_memberids(
			id SERIAL PRIMARY KEY,
			memberid VARCHAR(255) NOT NULL unique
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

		
		
		CREATE TABLE IF NOT EXISTS reputation_ranks (
			id SERIAL PRIMARY KEY,
			rank_name VARCHAR(255) NOT NULL,
			min_reputation INTEGER NOT NULL,
			max_reputation INTEGER NOT NULL
		);
			
		INSERT INTO reputation_ranks (rank_name, min_reputation, max_reputation) VALUES ('Newbie', 0, 100);
		INSERT INTO reputation_ranks (rank_name, min_reputation, max_reputation) VALUES ('Regular', 101, 500);
		INSERT INTO reputation_ranks (rank_name, min_reputation, max_reputation) VALUES ('Veteran', 501, 1000);
		INSERT INTO reputation_ranks (rank_name, min_reputation, max_reputation) VALUES ('Expert', 1001, 5000);
		INSERT INTO reputation_ranks (rank_name, min_reputation, max_reputation) VALUES ('Master', 5001, 10000);
		INSERT INTO reputation_ranks (rank_name, min_reputation, max_reputation) VALUES ('Legend', 10001, 100000);
			
		CREATE OR REPLACE FUNCTION update_reputation_rank() RETURNS TRIGGER AS $$
		DECLARE
		new_rank_name VARCHAR(255);
		BEGIN
		-- set the Reputation_name on users to the rank_name from reputation_ranks where the Reputation is between min_reputation and max_reputation
		SELECT rank_name INTO new_rank_name FROM reputation_ranks WHERE NEW.Reputation BETWEEN min_reputation AND max_reputation;
		IF NEW.Reputation_name != new_rank_name THEN
		UPDATE users SET Reputation_name = new_rank_name WHERE id = NEW.id;
		END IF;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
			
		CREATE OR REPLACE TRIGGER update_reputation_rank_trigger
		AFTER UPDATE OF Reputation ON users
		FOR EACH ROW
		EXECUTE PROCEDURE update_reputation_rank();


		CREATE OR REPLACE FUNCTION delete_other_users_with_same_username() RETURNS TRIGGER AS $$
			BEGIN
				-- Check if the old permission array contains 'PENDING' or 'BANNED'
				IF 'PENDING' = ANY (OLD.permission) OR 'BANNED' = ANY (OLD.permission) THEN
					-- Check if the new permission array does not contain 'PENDING' or 'BANNED'
					IF NOT ('PENDING' = ANY (NEW.permission) OR 'BANNED' = ANY (NEW.permission)) THEN
						-- Delete other users with the same username and 'PENDING' permission
						DELETE FROM users WHERE username = NEW.username AND 'PENDING' = ANY(permission) AND memberid != NEW.memberid;
						DELETE FROM allowed_memberids WHERE memberid = NEW.memberid;
					END IF;
				END IF;
				RETURN NEW;
			END;
			$$ LANGUAGE plpgsql;
			
		CREATE OR REPLACE TRIGGER after_user_update
		AFTER UPDATE OF permission ON users
		FOR EACH ROW EXECUTE PROCEDURE delete_other_users_with_same_username();
		
		CREATE TABLE round_data (
			id SERIAL PRIMARY KEY,
			room_id INT NOT NULL,
			dealer_id INT NOT NULL,
			round_number INT NOT NULL,
			round_profit INT NOT NULL,
			round_payout INT NOT NULL,
			round_payouts JSONB NOT NULL,
			bets JSONB NOT NULL,
			users JSONB NOT NULL,
			round_end_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
		create table if not exists profit_data (
			id SERIAL PRIMARY KEY,
			date DATE NOT NULL,
			profit INT NOT NULL,
			payout INT NOT NULL
		);

		CREATE OR REPLACE FUNCTION update_profit_data() RETURNS TRIGGER AS $$
		DECLARE
			existing_row profit_data%ROWTYPE;
		BEGIN
			-- Check if a row already exists for the current day
			SELECT * INTO existing_row FROM profit_data WHERE date = CURRENT_DATE LIMIT 1;
		
			-- If a row exists for the current day, update its values
			IF FOUND THEN
				UPDATE profit_data
				SET profit = existing_row.profit + NEW.round_profit,
					payout = existing_row.payout + NEW.round_payout
				WHERE date = CURRENT_DATE;
			ELSE
				-- If no row exists for the current day, insert a new row
				INSERT INTO profit_data (date, profit, payout)
				VALUES (CURRENT_DATE, NEW.round_profit, NEW.round_payout);
			END IF;
		
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;

		create or replace trigger update_profit_data
		after insert on round_data
		for each row
		execute procedure update_profit_data();

		
		
		insert into environment (key, value) values ('dealer_percentage', '1');
		insert into environment (key, value) values ('points_per_dollar', '1');
		insert into environment (key, value) values ('max_rooms', '2');
			
			-- create a view to get the total number of tickets purchased for a raffle
			CREATE OR REPLACE VIEW raffle_ticket_count AS
			SELECT raffle_id, COUNT(*) AS ticket_count
			FROM participants
		GROUP BY raffle_id;

		-- create a view to get the total number of tickets purchased for a raffle by a user, this should only show for active raffles
		CREATE OR REPLACE VIEW user_raffle_ticket_count AS
		SELECT raffle_id, username, COUNT(*) AS ticket_count
		FROM participants
		WHERE raffle_id IN (SELECT raffle_id FROM raffles WHERE end_date >= CURRENT_DATE)
		GROUP BY raffle_id, username;

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
