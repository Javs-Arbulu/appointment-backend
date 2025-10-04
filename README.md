# Appointment Backend Service

Sistema de gestión de citas médicas construido con Serverless Framework, AWS Lambda, DynamoDB y SQS.

## 🚀 Características

- **API REST** para crear y obtener citas
- **Notificaciones automáticas** mediante SQS y SNS
- **Desarrollo local** con serverless-offline
- **Deploy automático** a AWS
- **Configuración dual** para local y producción

## 📋 Prerrequisitos

- Node.js >= 18.x
- npm o yarn
- AWS CLI configurado (para deploy)
- Credenciales AWS válidas

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone <tu-repo>
cd appointment-backend

# Instalar dependencias
npm install
```

## ⚙️ Configuración

### Para Desarrollo Local

1. Crea/edita el archivo `.env.local`:

```bash
# URL de SQS real de AWS (opcional - si quieres usar SQS real en local)
NOTIFICATIONS_QUEUE_URL=https://sqs.us-east-2.amazonaws.com/TU_ACCOUNT_ID/tu-cola

# Deja vacío para simulación local
NOTIFICATIONS_TOPIC_ARN=

# Tabla local
APPOINTMENTS_TABLE=appointment-service-Appointments-dev
```

2. Si quieres usar servicios AWS reales en local, asegúrate de tener las credenciales AWS configuradas:
```bash
aws configure
# O exporta las variables:
export AWS_ACCESS_KEY_ID=tu_access_key
export AWS_SECRET_ACCESS_KEY=tu_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### Para Producción (AWS)

No necesitas configuración adicional. El deploy automáticamente creará:
- Tabla DynamoDB
- Cola SQS
- Tópico SNS
- Bus de eventos

## 🚀 Uso

### Desarrollo Local

```bash
# Iniciar servidor local
npm run dev
# o
npx serverless offline
```

El servidor estará disponible en: `http://localhost:3000`

### Endpoints Disponibles

#### Crear Cita
```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "insuredId": "123456",
    "scheduleId": "abc123",
    "countryISO": "PE"
  }'
```

**Respuesta exitosa:**
```json
{
  "message": "Appointment created successfully",
  "data": {
    "id": "uuid-generado",
    "insuredId": "123456",
    "scheduleId": "abc123",
    "countryISO": "PE",
    "status": "pending",
    "createdAt": "2025-10-03T02:00:00.000Z"
  }
}
```

#### Obtener Citas
```bash
curl -X GET http://localhost:3000/appointments
```

### Deploy a AWS

```bash
# Deploy a desarrollo
npx serverless deploy

# Deploy a producción
npx serverless deploy --stage prod
```

Después del deploy, obtendrás las URLs de producción:
```
endpoints:
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/appointments
  GET - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/appointments
```

## 🔍 Logs y Debug

### Ver logs en desarrollo local
Los logs aparecen directamente en la consola donde ejecutaste `serverless offline`.

### Ver logs en AWS
```bash
# Ver logs de una función específica
npx serverless logs -f createAppointment

# Ver logs en tiempo real
npx serverless logs -f createAppointment --tail

# Ver logs de notificaciones
npx serverless logs -f notifyAppointment
```

## 🧪 Testing

### Probar Creación de Cita (Local)
```bash
# Terminal 1: Ejecutar servidor
npx serverless offline

# Terminal 2: Hacer petición
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{"insuredId":"123456","scheduleId":"abc","countryISO":"PE"}'
```

### Probar en AWS
```bash
# Reemplaza con tu URL real después del deploy
curl -X POST https://tu-url-aws.amazonaws.com/dev/appointments \
  -H "Content-Type: application/json" \
  -d '{"insuredId":"123456","scheduleId":"abc","countryISO":"PE"}'
```

## 📁 Estructura del Proyecto

```
appointment-backend/
├── src/
│   ├── handlers/
│   │   ├── createAppointment.ts    # Crear citas
│   │   ├── getAppointments.ts      # Obtener citas
│   │   └── notifyAppointment.ts    # Procesar notificaciones
│   └── types/
│       ├── appointment.ts
│       ├── doctor.ts
│       ├── patient.ts
│       └── notification.ts
├── .env.local                      # Variables para desarrollo local
├── serverless.ts                   # Configuración de Serverless
├── package.json
└── README.md
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo local
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar tests
npm test

# Deploy a AWS
npx serverless deploy

# Remover recursos de AWS
npx serverless remove
```

## 🌟 Funcionamiento del Sistema

### Flujo de Creación de Cita

1. **Cliente hace POST** a `/appointments`
2. **Handler `createAppointment`**:
   - Valida los datos
   - Guarda la cita en DynamoDB
   - Envía mensaje a SQS (o simula en local)
3. **SQS trigger** ejecuta `notifyAppointment`
4. **Handler `notifyAppointment`**:
   - Procesa el mensaje
   - Envía notificación via SNS

### Modos de Operación

#### 🏠 **Modo Local**
- Usa `.env.local` para configuración
- Si `NOTIFICATIONS_QUEUE_URL` está configurada → envía a SQS real
- Si está vacía → simula notificación en logs

#### ☁️ **Modo AWS**
- Usa recursos creados por CloudFormation
- Variables de entorno automáticas
- Notificaciones reales via SQS/SNS

## 🐛 Solución de Problemas

### Error: "Invalid URL [object Object]"
✅ **Solucionado**: Este error ya está corregido en la versión actual. El sistema ahora maneja correctamente las URLs tanto en local como en AWS.

### Error: Node.js version not supported
```bash
# Instalar Node.js 18 o superior
nvm install 18
nvm use 18
```

### Error: AWS credentials not found
```bash
aws configure
# O exporta variables:
export AWS_ACCESS_KEY_ID=tu_key
export AWS_SECRET_ACCESS_KEY=tu_secret
```

### Error: Cannot resolve dependency
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📦 Dependencias Principales

- **@aws-sdk/client-dynamodb**: Cliente DynamoDB
- **@aws-sdk/client-sqs**: Cliente SQS  
- **@aws-sdk/client-sns**: Cliente SNS
- **serverless**: Framework principal
- **serverless-esbuild**: Compilación TypeScript
- **serverless-offline**: Desarrollo local
- **serverless-dotenv-plugin**: Variables de entorno

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.