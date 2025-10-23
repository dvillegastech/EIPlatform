.PHONY: help up down restart logs build clean backup restore dev-backend dev-frontend db-shell test

help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Iniciar toda la plataforma
	docker-compose up -d
	@echo "✅ Plataforma iniciada en http://localhost:3000"

down: ## Detener la plataforma
	docker-compose down

restart: ## Reiniciar la plataforma
	docker-compose restart

logs: ## Ver logs de todos los servicios
	docker-compose logs -f

logs-backend: ## Ver logs del backend
	docker-compose logs -f backend

logs-frontend: ## Ver logs del frontend
	docker-compose logs -f frontend

logs-db: ## Ver logs de la base de datos
	docker-compose logs -f postgres

build: ## Reconstruir las imágenes Docker
	docker-compose build

clean: ## Limpiar todo (incluyendo volúmenes)
	docker-compose down -v
	@echo "⚠️  Todos los datos han sido eliminados"

backup: ## Hacer backup de la base de datos
	@mkdir -p backups
	docker exec ei-postgres pg_dump -U ei_user ei_platform > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup creado en backups/"

restore: ## Restaurar backup (usar: make restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Error: Especifica el archivo con FILE=backup.sql"; \
		exit 1; \
	fi
	cat $(FILE) | docker exec -i ei-postgres psql -U ei_user -d ei_platform
	@echo "✅ Backup restaurado"

dev-backend: ## Desarrollo local del backend
	cd backend && npm install && npm run dev

dev-frontend: ## Desarrollo local del frontend
	cd frontend && npm install && npm run dev

db-shell: ## Acceder a la shell de PostgreSQL
	docker exec -it ei-postgres psql -U ei_user -d ei_platform

db-reset: ## Resetear la base de datos
	docker-compose down postgres
	docker volume rm eiplatform_postgres_data
	docker-compose up -d postgres
	@echo "✅ Base de datos reseteada"

status: ## Ver estado de los servicios
	docker-compose ps

install: ## Instalación inicial completa
	@echo "🚀 Instalando plataforma Enterprise Individuelle..."
	docker-compose up -d
	@echo "⏳ Esperando que los servicios estén listos..."
	@sleep 10
	@echo "✅ Instalación completa!"
	@echo ""
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔧 Backend API: http://localhost:3001"
	@echo "💾 PostgreSQL: localhost:5432"
	@echo ""
	@echo "Para ver los logs: make logs"

update: ## Actualizar imágenes y reconstruir
	git pull
	docker-compose down
	docker-compose build
	docker-compose up -d
	@echo "✅ Plataforma actualizada"
