COMPOSE := docker compose -f docker/compose.yml

.PHONY: build up down down-v ps logs backend-test frontend-test e2e backend-shell frontend-shell

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

down-v:
	$(COMPOSE) down -v

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f --tail=200

backend-test:
	$(COMPOSE) exec backend ./mvnw -pl appserver -am test

frontend-test:
	$(COMPOSE) exec frontend npm test

e2e:
	$(COMPOSE) run --rm e2e

backend-shell:
	$(COMPOSE) exec backend bash

frontend-shell:
	$(COMPOSE) exec frontend sh
