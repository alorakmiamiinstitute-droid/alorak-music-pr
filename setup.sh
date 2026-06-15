#!/bin/bash

# Script para instalar y configurar el proyecto

echo "🚀 Instalando Agencia de Talentos PR Backend"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js instalado: $(node -v)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ npm instalado: $(npm -v)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo ""

# Crear archivo .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  Por favor, edita .env con tus configuraciones:"
    echo "   - MONGODB_URI"
    echo "   - EMAIL_USER y EMAIL_PASSWORD"
    echo "   - URLs de cliente y servidor"
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "Próximos pasos:"
echo "1. Edita .env con tus configuraciones"
echo "2. Asegúrate de que MongoDB esté corriendo"
echo "3. Ejecuta: npm run dev"
echo ""
