#!/bin/bash

# ============================================
# Script de instalación automática
# Plateforme Enterprise Individuelle
# ============================================

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🚀 Instalación Enterprise Individuelle Platform        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar Docker
echo "📋 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "   Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker está instalado"
echo ""

# 2. Verificar puertos
echo "📋 Verificando puertos disponibles..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Puerto 3000 está ocupado"
    echo "   Detén el servicio que usa el puerto 3000"
    exit 1
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Puerto 3001 está ocupado"
    exit 1
fi

if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Puerto 5432 está ocupado (PostgreSQL)"
    echo "   Si tienes PostgreSQL local, cámbialo de puerto"
    exit 1
fi

echo "✅ Puertos disponibles"
echo ""

# 3. Iniciar servicios
echo "🐳 Iniciando servicios Docker..."
docker-compose up -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 5

# 4. Verificar servicios
echo ""
echo "📋 Verificando servicios..."
docker-compose ps

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ INSTALACIÓN COMPLETADA                              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Accede a la plataforma:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📚 Consulta la documentación:"
echo "   README.md          - Guía completa"
echo "   QUICKSTART.md      - Inicio rápido"
echo "   GUIDE_UTILISATION.md - Manual de usuario"
echo ""
echo "🔧 Comandos útiles:"
echo "   docker-compose logs -f     - Ver logs"
echo "   docker-compose down        - Detener"
echo "   docker-compose restart     - Reiniciar"
echo ""
echo "   O usa: make help"
echo ""
echo "🎉 ¡Disfruta tu plataforma Enterprise Individuelle!"
