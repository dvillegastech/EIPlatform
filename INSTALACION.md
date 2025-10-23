# 🚀 INSTALACIÓN EN 3 PASOS

## La instalación es SÚPER SIMPLE:

---

## ✅ Opción 1: Script Automático (MÁS FÁCIL)

```bash
# Solo ejecuta esto:
./install.sh
```

**¡ESO ES TODO!** El script hace todo automáticamente:
- ✅ Verifica que Docker esté instalado
- ✅ Verifica que los puertos estén disponibles
- ✅ Inicia todos los servicios
- ✅ Te muestra las URLs de acceso

---

## ✅ Opción 2: Con Make (TAMBIÉN MUY FÁCIL)

```bash
make install
```

Listo. Ya está funcionando.

---

## ✅ Opción 3: Con Docker Compose (3 COMANDOS)

```bash
# 1. Ir al directorio
cd EIPlatform

# 2. Iniciar
docker-compose up -d

# 3. Abrir navegador
# http://localhost:3000
```

**¡Ya está!** La aplicación está corriendo.

---

## 📋 REQUISITOS PREVIOS

**Solo necesitas 1 cosa:**
- ✅ Docker instalado

**¿No tienes Docker?**
- Windows/Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Linux: `sudo apt-get install docker docker-compose` (Ubuntu/Debian)

---

## ⏱️ TIEMPO DE INSTALACIÓN

- **Primera vez**: 5-10 minutos (descarga de imágenes)
- **Siguientes veces**: 30 segundos

---

## 🎯 PASO A PASO DETALLADO (Si quieres hacerlo manual)

### 1️⃣ Clonar o descargar el repositorio
```bash
git clone <tu-repo>
cd EIPlatform
```

### 2️⃣ Iniciar Docker
```bash
docker-compose up -d
```

### 3️⃣ Esperar 30 segundos
Docker descarga las imágenes (solo la primera vez)

### 4️⃣ Abrir el navegador
```
http://localhost:3000
```

**¡YA ESTÁ FUNCIONANDO!** 🎉

---

## ✅ VERIFICACIÓN (Opcional)

```bash
# Ver que todo esté corriendo
docker-compose ps

# Deberías ver:
# ei-postgres   ✔ running
# ei-backend    ✔ running
# ei-frontend   ✔ running
```

---

## 🆘 PROBLEMAS COMUNES

### "Puerto ya en uso"

```bash
# Ver qué está usando el puerto
lsof -i :3000

# Cambiar el puerto en docker-compose.yml
ports:
  - "8000:80"  # Usa 8000 en lugar de 3000
```

### "Docker no instalado"

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Verificar
docker --version
```

### "Permisos denegados"

```bash
# Linux - agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Logout y login de nuevo
```

---

## 🎨 PRIMER USO (También súper fácil)

Una vez que abras `http://localhost:3000`:

### 1️⃣ Ir a Paramètres (menú izquierdo)
- Poner el nombre de tu empresa
- Seleccionar tipo de actividad
- Los taux se rellenan solos
- Click en "Enregistrer"

### 2️⃣ ¡Ya puedes usar todo!
- Crear facturas
- Agregar gastos
- Subir justificativos
- Calcular URSSAF
- Generar reportes

---

## 🔧 COMANDOS BÁSICOS

```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Ver estado
docker-compose ps
```

**O usa el Makefile:**
```bash
make up      # Iniciar
make down    # Detener
make logs    # Ver logs
make help    # Ver todos los comandos
```

---

## 💾 REQUISITOS DEL SISTEMA

**Mínimo:**
- 2 GB RAM
- 1 GB espacio en disco
- Docker instalado

**Recomendado:**
- 4 GB RAM
- 5 GB espacio en disco
- Conexión a internet (primera instalación)

---

## 🌐 ACCESO

Una vez instalado:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación web |
| **Backend API** | http://localhost:3001 | API REST |
| **PostgreSQL** | localhost:5432 | Base de datos |

---

## 📱 COMPATIBILIDAD

✅ **Funciona en:**
- Windows 10/11 (con Docker Desktop)
- macOS (con Docker Desktop)
- Linux (Ubuntu, Debian, Fedora, etc.)
- Servidor VPS/Cloud

✅ **Navegadores:**
- Chrome, Firefox, Safari, Edge (versiones recientes)

---

## 🔄 ACTUALIZACIÓN (También fácil)

```bash
# Pull nuevos cambios
git pull

# Reconstruir
docker-compose down
docker-compose up -d --build

# O con make
make update
```

---

## 🎯 RESUMEN

### La instalación es TAN SIMPLE como:

```bash
docker-compose up -d
```

**Eso es todo.**

No hay configuración compleja, no hay dependencias manuales, no hay scripts complicados.

**Docker se encarga de todo:**
- ✅ Instala Node.js (no lo necesitas en tu PC)
- ✅ Instala PostgreSQL (no lo necesitas en tu PC)
- ✅ Instala todas las dependencias NPM
- ✅ Compila el frontend
- ✅ Compila el backend
- ✅ Crea la base de datos
- ✅ Inicia todos los servicios

**Tú solo abres el navegador y listo.**

---

## 🎉 VENTAJAS DE ESTA INSTALACIÓN

✅ **Un solo comando** - `docker-compose up -d`
✅ **Sin dependencias** - No necesitas Node, PostgreSQL, etc.
✅ **Portable** - Funciona igual en cualquier OS
✅ **Aislado** - No ensucia tu sistema
✅ **Fácil de desinstalar** - `docker-compose down -v`
✅ **Backup simple** - Solo copia la carpeta uploads/
✅ **Desarrollo y producción** - Misma configuración

---

## 📞 ¿NECESITAS AYUDA?

1. **Consulta QUICKSTART.md** - Inicio rápido
2. **Consulta README.md** - Guía completa
3. **Consulta COMANDOS.md** - Comandos útiles
4. **Ver logs**: `docker-compose logs -f`

---

# ✅ CONCLUSIÓN

## **¿Es simple la instalación?**

# **¡SÍ, SÚPER SIMPLE!**

Literalmente:
```bash
docker-compose up -d
```

**Y ya está funcionando en http://localhost:3000**

No puede ser más fácil. 🚀
