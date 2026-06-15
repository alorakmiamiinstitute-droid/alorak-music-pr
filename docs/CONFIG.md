# Configuración de Archivo .env

Copia el contenido de `.env.example` a `.env` y actualiza los valores según tu configuración:

```env
# Configuración de Base de Datos
MONGODB_URI=mongodb://localhost:27017/alorak-music-pr
DB_NAME=alorak-music-pr

# Configuración del Servidor
PORT=5000
NODE_ENV=development

# Configuración de Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=noreply@alorakmusicpr.com
EMAIL_FROM_NAME=Agencia de Talentos PR

# Configuración SMTP (Alternativa)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# URLs de la Aplicación
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Seguridad
JWT_SECRET=tu-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Carga de Archivos
MAX_FILE_SIZE=5242880
ALLOWED_PHOTO_FORMATS=jpg,jpeg,png,gif

# Reglas de Validación
MIN_AGE=18
ALLOWED_COUNTRIES=PR

# Emails de Administradores (separados por coma)
ADMIN_EMAILS=admin@alorakmusicpr.com,info@alorakmusicpr.com
```

## Pasos Importantes:

### 1. Configurar Email con Gmail

**Para usar Gmail con Node.js, sigue estos pasos:**

1. Ve a tu cuenta de Google: [myaccount.google.com](https://myaccount.google.com)
2. Selecciona **Security** (Seguridad)
3. Activa **2-Step Verification** (Verificación en dos pasos)
4. Después de activar, ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
5. Selecciona **Mail** y **Windows Computer** (o tu dispositivo)
6. Google generará una contraseña de 16 caracteres
7. Copia esa contraseña y úsala como `EMAIL_PASSWORD` en `.env`

### 2. Conectar MongoDB

**Opción A: MongoDB Local**
```env
MONGODB_URI=mongodb://localhost:27017/alorak-music-pr
```
Asegúrate de que MongoDB esté corriendo: `mongod`

**Opción B: MongoDB Atlas (Cloud)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alorak-music-pr?retryWrites=true&w=majority
```

### 3. URLs de la Aplicación

```env
# Desarrollo local
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Producción
CLIENT_URL=https://tudominio.com
SERVER_URL=https://api.tudominio.com
```

## ✅ Verificar Configuración

Después de configurar `.env`, ejecuta:

```bash
npm run dev
```

Deberías ver:
```
✅ Base de datos conectada exitosamente
🚀 Servidor ejecutándose en puerto 5000
```

Prueba el endpoint de salud:
```bash
curl http://localhost:5000/api/health
```

## 🔒 Seguridad

- **Nunca** commits `.env` a GitHub
- **Nunca** compartas tu `EMAIL_PASSWORD`
- Usa variables de entorno diferentes para producción
- Cambia `JWT_SECRET` en producción
- Usa `NODE_ENV=production` en producción

## 🆘 Troubleshooting

### Error: "ENOENT: no such file or directory, open '.env'"
- Copiar el archivo: `cp .env.example .env`
- Asegúrate de que `.env` esté en la raíz del proyecto

### Error: "MongoDB connection failed"
- Verifica que MongoDB está corriendo
- Verifica la URL de conexión
- Comprueba credenciales si usas Atlas

### Error: "Email service not configured"
- Verifica `EMAIL_USER` y `EMAIL_PASSWORD`
- Verifica que 2FA esté habilitado en Google
- Intenta regenerar la contraseña de aplicación
