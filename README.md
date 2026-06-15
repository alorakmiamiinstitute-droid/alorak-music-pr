# Agencia de Talentos PR - Sistema de Gestión de Aplicaciones

## 📋 Descripción

Sistema backend completo para gestionar solicitudes de la Agencia de Talentos PR. Incluye validación de datos, autenticación, base de datos MongoDB, y notificaciones por email automatizadas.

## 🚀 Características

✅ **Gestión de Aplicaciones**
- Recepción y validación de formularios
- Detección de duplicados y spam
- Búsqueda y filtrado de aplicaciones
- Cambio de estado y notas administrativas

✅ **Notificaciones por Email**
- Confirmación automática al solicitante
- Notificación a administradores de nuevas aplicaciones
- Actualización de estado a solicitantes
- Plantillas HTML profesionales

✅ **Validación Mejorada**
- Validación de edad (mínimo 18 años)
- Verificación de residencia en Puerto Rico
- Validación de URLs de fotos
- Sanitización de entrada de datos

✅ **Base de Datos**
- MongoDB con esquemas robustos
- Índices para optimización
- Métodos virtuales y de instancia
- Control de duplicados

✅ **Estadísticas**
- Resumen general de aplicaciones
- Análisis por experiencia
- Tendencias diarias
- Especialización popular

## 📦 Requisitos

- Node.js v14 o superior
- MongoDB local o Atlas
- npm o yarn

## 🔧 Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/alorakmiamiinstitute-droid/alorak-music-pr.git
cd alorak-music-pr
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/alorak-music-pr

# Servidor
PORT=5000
NODE_ENV=development

# Email (Gmail)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=noreply@alorakmusicpr.com

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Administradores
ADMIN_EMAILS=admin@alorakmusicpr.com
```

### 4. Iniciar MongoDB

```bash
# Local
mongod

# O usar MongoDB Atlas en la variable MONGODB_URI
```

### 5. Ejecutar servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 API Endpoints

### Aplicaciones

#### Crear aplicación
```
POST /api/applications
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "fecha_nacimiento": "1995-05-15",
  "residencia": "SI",
  "fotos_url": "https://drive.google.com/...",
  "telefono": "+1-787-555-0123",
  "experiencia": "Intermedio",
  "especializacion": ["Actuación", "Música"],
  "acepta_terminos": true,
  "acepta_privacidad": true
}
```

#### Obtener todas las aplicaciones
```
GET /api/applications?estado=pendiente&limit=20&skip=0
```

#### Obtener una aplicación
```
GET /api/applications/:id
```

#### Actualizar estado
```
PUT /api/applications/:id/status
Content-Type: application/json

{
  "estado": "aceptado",
  "notas_admin": "Excelente perfil, contactar para entrevista"
}
```

#### Eliminar aplicación
```
DELETE /api/applications/:id
```

### Estadísticas

#### Resumen general
```
GET /api/stats/summary
```

#### Por experiencia
```
GET /api/stats/experience
```

#### Tendencias diarias
```
GET /api/stats/daily?days=30
```

### Email

#### Verificar servicio
```
GET /api/emails/health
```

#### Reenviar confirmación
```
POST /api/emails/resend/:applicationId
```

## 📁 Estructura del Proyecto

```
.
├── controllers/
│   └── applicationController.js    # Lógica de negocio
├── models/
│   └── Application.js             # Esquema MongoDB
├── routes/
│   ├── applications.js            # Rutas de aplicaciones
│   ├── emails.js                  # Rutas de email
│   └── stats.js                   # Rutas de estadísticas
├── utils/
│   ├── emailService.js            # Servicio de email
│   └── validators.js              # Validaciones
├── .env.example                   # Variables de ejemplo
├── .gitignore
├── server.js                      # Punto de entrada
└── package.json
```

## 🔐 Seguridad

- ✅ Rate limiting (100 solicitudes por 15 minutos)
- ✅ Helmet.js para headers HTTP seguros
- ✅ Validación y sanitización de entrada
- ✅ Detección de spam e IP duplicadas
- ✅ CORS configurado
- ✅ Hasheo de contraseñas con bcrypt

## 📧 Configurar Email (Gmail)

### 1. Habilitar 2FA en tu cuenta Google
2. Ir a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Seleccionar "Mail" y "Windows Computer"
4. Copiar la contraseña de aplicación generada
5. Usar esta contraseña en `.env` como `EMAIL_PASSWORD`

## 🧪 Testing

```bash
npm test
```

## 📊 Estadísticas de Base de Datos

MongoDB incluye:
- Índices en `email`, `estado`, `fecha_solicitud`
- Validación de esquema en el nivel de modelo
- Pre-hooks para verificar duplicados
- Métodos de instancia para operaciones comunes

## 🤝 Frontend Integration

El frontend ya tiene el formulario HTML. Para integrar con este backend:

```javascript
// Reemplazar el submit del formulario con:
const formData = new FormData(formularioTalento);
const datos = Object.fromEntries(formData);

fetch('http://localhost:5000/api/applications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos)
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    alert('¡Solicitud enviada! ' + data.message);
  } else {
    alert('Error: ' + JSON.stringify(data.errors));
  }
});
```

## 📝 Próximas Mejoras

- [ ] Autenticación de admin
- [ ] Panel de administración web
- [ ] Exportación a CSV/PDF
- [ ] Integración de pagos
- [ ] Notificaciones SMS
- [ ] Carga de archivos (fotos)
- [ ] Integración con redes sociales

## 📞 Soporte

Para preguntas o problemas:
- Email: info@alorakmusicpr.com
- GitHub Issues: [Crear un issue](https://github.com/alorakmiamiinstitute-droid/alorak-music-pr/issues)

## 📄 Licencia

MIT License - Ver LICENSE para más detalles

## 👥 Autores

Alorak Music PR - Casa Productora de Talentos

---

**Hecho con ❤️ para talentos en Puerto Rico**
