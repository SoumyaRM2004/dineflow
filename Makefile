# DineFlow Makefile — common development commands

.PHONY: help dev-up dev-down backend frontend migrate test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ===== Infrastructure =====

dev-up: ## Start PostgreSQL and Redis containers
	docker compose -f docker-compose.dev.yml up -d

dev-down: ## Stop infrastructure containers
	docker compose -f docker-compose.dev.yml down

dev-reset: ## Reset database (destroy volumes)
	docker compose -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.dev.yml up -d

# ===== Backend =====

backend-install: ## Install Python dependencies
	cd backend && pip install -r requirements.txt

backend: ## Run FastAPI dev server
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

migrate-create: ## Create new migration (usage: make migrate-create msg="description")
	cd backend && alembic revision --autogenerate -m "$(msg)"

migrate: ## Run database migrations
	cd backend && alembic upgrade head

migrate-down: ## Rollback last migration
	cd backend && alembic downgrade -1

# ===== Frontend =====

frontend-install: ## Install Node dependencies
	cd frontend && npm install

frontend: ## Run Next.js dev server
	cd frontend && npm run dev

frontend-build: ## Build frontend for production
	cd frontend && npm run build

# ===== Testing =====

test-backend: ## Run backend tests
	cd backend && pytest -v --tb=short

test-frontend: ## Run frontend tests
	cd frontend && npm test

# ===== Combined =====

install: backend-install frontend-install ## Install all dependencies

start: ## Start everything (requires docker running)
	@echo "Starting infrastructure..."
	$(MAKE) dev-up
	@echo "Waiting for postgres..."
	@sleep 3
	@echo "Running migrations..."
	$(MAKE) migrate
	@echo "Ready! Run 'make backend' and 'make frontend' in separate terminals."
