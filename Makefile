.PHONY: serve clean

# Default Go version for serving static files
GO := go

serve:
	@echo "Starting local server..."
	@if command -v $(GO) >/dev/null 2>&1; then \
		$(GO) run server.go; \
	else \
		echo "Go not found. Please install Go to serve the site locally."; \
		exit 1; \
	fi

clean:
	@echo "Cleaning build artifacts..."
	@rm -f server
	@find . -type f -name ".DS_Store" -delete
	@find . -type d -name "*.test" -exec rm -rf {} +

help:
	@echo "Available commands:"
	@echo "  make serve    - Start a local server to view the site"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make help     - Show this help message" 