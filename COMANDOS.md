# Comandos Útiles - Enterprise Individuelle Platform

## 🚀 Inicio rápido

### Con Makefile (recomendado)
```bash
make install      # Instalación completa
make help         # Ver todos los comandos
```

### Con docker-compose
```bash
docker-compose up -d
```

---

## 📦 Gestión de servicios

### Iniciar/Detener
```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres

# Ver estado de los servicios
docker-compose ps
```

### Logs
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Ver últimas 100 líneas
docker-compose logs --tail=100 backend
```

---

## 🔧 Desarrollo

### Backend
```bash
# Desarrollo local (sin Docker)
cd backend
npm install
npm run dev

# Dentro de Docker
docker exec -it ei-backend sh
npm run dev

# Ver logs en tiempo real
docker-compose logs -f backend
```

### Frontend
```bash
# Desarrollo local (sin Docker)
cd frontend
npm install
npm run dev

# Reconstruir frontend
docker-compose up -d --build frontend
```

---

## 💾 Base de datos

### Acceder a PostgreSQL
```bash
# Shell interactivo
docker exec -it ei-postgres psql -U ei_user -d ei_platform

# Ejecutar query directo
docker exec -it ei-postgres psql -U ei_user -d ei_platform -c "SELECT * FROM invoices;"
```

### Queries útiles
```sql
-- Ver todas las tablas
\dt

-- Ver estructura de una tabla
\d invoices

-- Contar registros
SELECT COUNT(*) FROM invoices;
SELECT COUNT(*) FROM expenses;

-- Ver últimas factures
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 10;

-- Estadísticas rápidas
SELECT * FROM dashboard_stats;

-- Ver configuración
SELECT * FROM company_config;
```

### Backup y restauración
```bash
# Hacer backup
docker exec ei-postgres pg_dump -U ei_user ei_platform > backup_$(date +%Y%m%d).sql

# O con make
make backup

# Restaurar backup
cat backup.sql | docker exec -i ei-postgres psql -U ei_user -d ei_platform

# O con make
make restore FILE=backup.sql
```

### Resetear base de datos
```bash
# Detener, eliminar volumen y recrear
docker-compose down -v
docker-compose up -d

# O con make
make db-reset
```

---

## 🐛 Troubleshooting

### Puerto ocupado
```bash
# Ver qué proceso usa el puerto
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Cambiar puerto en docker-compose.yml
ports:
  - "8000:80"  # En lugar de 3000:80
```

### Reconstruir todo
```bash
# Detener y eliminar todo
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Iniciar de nuevo
docker-compose up -d
```

### Ver uso de recursos
```bash
# CPU y memoria por contenedor
docker stats

# Espacio en disco
docker system df

# Limpiar imágenes no usadas
docker system prune -a
```

### Frontend no carga
```bash
# Ver logs
docker-compose logs frontend

# Reconstruir frontend
docker-compose up -d --build frontend

# Verificar nginx
docker exec -it ei-frontend cat /etc/nginx/conf.d/default.conf
```

### Backend no conecta a DB
```bash
# Verificar que postgres esté running
docker-compose ps postgres

# Ver logs de postgres
docker-compose logs postgres

# Verificar conexión
docker exec -it ei-backend sh
nc -zv postgres 5432
```

---

## 📁 Gestión de archivos

### Uploads
```bash
# Ver archivos subidos
ls -lh uploads/

# Limpar uploads (CUIDADO!)
rm -rf uploads/*

# Backup de uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### Logs de aplicación
```bash
# Logs del contenedor
docker-compose logs backend > backend_logs.txt

# Ver en tiempo real
tail -f backend_logs.txt
```

---

## 🧪 Testing

### API Health check
```bash
# Verificar que API responde
curl http://localhost:3001/api/health

# Ver configuración
curl http://localhost:3001/api/config

# Ver categorías
curl http://localhost:3001/api/categories
```

### Crear datos de prueba
```sql
-- Conectar a la DB
docker exec -it ei-postgres psql -U ei_user -d ei_platform

-- Insertar factura de prueba
INSERT INTO invoices (
  invoice_number, client_name, invoice_date, due_date,
  amount_ht, amount_ttc, status
) VALUES (
  'TEST-001', 'Client Test', CURRENT_DATE, CURRENT_DATE + 30,
  1000, 1000, 'PAID'
);

-- Insertar dépense de prueba
INSERT INTO expenses (
  category_id, expense_date, amount, description,
  deduction_type, deduction_percentage
) VALUES (
  (SELECT id FROM expense_categories WHERE name = 'Internet'),
  CURRENT_DATE, 40, 'Abonnement Fibre',
  'PERSONNEL', 100
);
```

---

## 🔐 Seguridad

### Cambiar contraseñas
```bash
# Editar docker-compose.yml
POSTGRES_PASSWORD: nueva_contraseña_segura

# Recrear
docker-compose down -v
docker-compose up -d
```

### Variables de entorno
```bash
# Crear .env personalizado
cp .env.example .env
nano .env

# Docker Compose usará automáticamente .env
docker-compose up -d
```

---

## 📊 Monitoring

### Ver uso de recursos en tiempo real
```bash
docker stats ei-postgres ei-backend ei-frontend
```

### Espacio en disco
```bash
# Tamaño de volúmenes
docker system df -v

# Tamaño de uploads
du -sh uploads/

# Tamaño de base de datos
docker exec ei-postgres psql -U ei_user -d ei_platform -c "SELECT pg_size_pretty(pg_database_size('ei_platform'));"
```

---

## 🚢 Despliegue en producción

### Checklist antes de producción

1. **Cambiar contraseñas**
   - PostgreSQL password
   - Agregar JWT secret si implementas autenticación

2. **Variables de entorno**
   ```bash
   NODE_ENV=production
   ```

3. **HTTPS**
   - Configurar reverse proxy (Nginx, Traefik)
   - Certificado SSL (Let's Encrypt)

4. **Backups automáticos**
   ```bash
   # Cron job para backup diario
   0 2 * * * /path/to/backup.sh
   ```

5. **Monitoring**
   - Logs centralizados
   - Alertas de errores
   - Métricas de rendimiento

---

## 🔄 Actualización

### Actualizar código
```bash
# Pull últimos cambios
git pull

# Reconstruir y reiniciar
docker-compose down
docker-compose build
docker-compose up -d
```

### Migración de base de datos
```bash
# Si cambias el schema
# 1. Hacer backup
make backup

# 2. Aplicar cambios SQL
cat migration.sql | docker exec -i ei-postgres psql -U ei_user -d ei_platform
```

---

## 📚 Recursos adicionales

- README.md - Guía completa
- GUIDE_UTILISATION.md - Manual de usuario
- QUICKSTART.md - Inicio rápido
- Makefile - Comandos make disponibles
- docker-compose.yml - Configuración servicios
- database/init.sql - Schema de base de datos

---

## ⚡ Comandos rápidos con Make

```bash
make help           # Ver todos los comandos
make up             # Iniciar plataforma
make down           # Detener plataforma
make logs           # Ver logs
make backup         # Backup DB
make db-shell       # Acceder a PostgreSQL
make clean          # Limpiar todo
make install        # Instalación inicial
```

---

**¡Consulta estos comandos cuando necesites gestionar tu plataforma!**
