package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	// Create a new ServeMux
	mux := http.NewServeMux()
	mux.Handle("/send-booking", http.HandlerFunc(sendBookingHandler))
	mux.Handle("/", http.FileServer(http.Dir(".")))

	// Create a server with a timeout for graceful shutdown
	srv := &http.Server{
		Addr:    ":8000",
		Handler: mux,
	}

	// Channel to listen for errors coming from the server
	serverErrors := make(chan error, 1)

	// Start the server
	go func() {
		fmt.Println("Starting server at http://localhost:8000")
		serverErrors <- srv.ListenAndServe()
	}()

	// Channel to listen for an interrupt or terminate signal from the OS
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	// Blocking select waiting for either a server error or a shutdown signal
	select {
	case err := <-serverErrors:
		log.Printf("Error starting server: %v", err)

	case sig := <-shutdown:
		log.Printf("Received signal %v, starting graceful shutdown...", sig)

		// Give outstanding requests a deadline for completion
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Attempt graceful shutdown
		if err := srv.Shutdown(ctx); err != nil {
			log.Printf("Could not stop server gracefully: %v", err)
			if err := srv.Close(); err != nil {
				log.Printf("Could not stop server: %v", err)
			}
		}
	}
}

// BookingRequest represents the expected JSON payload
type BookingRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Checkin  string `json:"checkin"`
	Checkout string `json:"checkout"`
	Guests   string `json:"guests"`
	Message  string `json:"message"`
	CostHtml string `json:"costHtml"`
}

func sendBookingHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	var req BookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("SMTP credentials not set"))
		return
	}

	to := "wohnungsmilla@gmail.com"
	subject := "Neue Buchungsanfrage von " + req.Name
	body := "<h2>Buchungsanfrage</h2>" +
		"<p><b>Name:</b> " + req.Name + "<br>" +
		"<b>Email:</b> " + req.Email + "<br>" +
		"<b>Telefon:</b> " + req.Phone + "<br>" +
		"<b>Anreise:</b> " + req.Checkin + "<br>" +
		"<b>Abreise:</b> " + req.Checkout + "<br>" +
		"<b>Gäste:</b> " + req.Guests + "<br>" +
		"<b>Nachricht:</b> " + req.Message + "</p>" +
		"<h3>Kostenübersicht</h3>" + req.CostHtml

	msg := "From: " + smtpUser + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n\r\n" +
		body
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, smtpUser, []string{to}, []byte(msg))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Fehler beim Senden der E-Mail."))
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
