package models

type Config struct {
	JwtKey      string `json:"jwt_secret"`
	DatabaseURL string `json:"database_url"`
	Salt        string `json:"salt"`
	Port        string `json:"port"`
	UseSSL      bool   `json:"use_ssl"`
}
