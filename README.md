# OEE Production Monitor

Aplicación full stack para monitorear una línea de producción industrial mediante eventos de máquina y un cálculo simplificado de OEE.

Este proyecto simula una primera versión de un monitor de línea de producción para un cliente embotellador. Permite consultar máquinas, ver su estado actual, revisar historial de eventos, registrar nuevos eventos y calcular un OEE simplificado por rango de tiempo.

---

## Tabla de contenido

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Requisitos previos](#requisitos-previos)
- [Clonar el proyecto](#clonar-el-proyecto)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Ejecución en desarrollo](#ejecución-en-desarrollo)
- [Pruebas](#pruebas)
- [Build del frontend](#build-del-frontend)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Endpoints](#endpoints)
- [Modelo de datos](#modelo-de-datos)
- [Cálculo de estado actual](#cálculo-de-estado-actual)
- [Cálculo de OEE](#cálculo-de-oee)
- [Supuestos](#supuestos)
- [Manejo de errores](#manejo-de-errores)
- [Decisiones técnicas relevantes](#decisiones-técnicas-relevantes)
- [Limitaciones conocidas](#limitaciones-conocidas)
- [Mejoras futuras](#mejoras-futuras)

---

## Funcionalidades

- Dashboard con listado de máquinas.
- Visualización del estado actual de cada máquina.
- Visualización de alarmas activas.
- OEE del día por máquina.
- Pantalla de detalle por máquina.
- Historial de eventos filtrable por:
  - rango de fechas,
  - tipo de evento.
- Paginación básica del historial de eventos.
- Registro manual de eventos:
  - cambio de estado,
  - alarma,
  - conteo de producción.
- Cálculo de OEE simplificado por máquina y rango de tiempo.
- Manejo explícito de estados de UI:
  - cargando,
  - error,
  - sin datos,
  - éxito.
- API REST con errores consistentes.
- Pruebas unitarias para la lógica de cálculo temporal.

---

## Stack

### Backend

- Node.js
- Express
- SQLite
- sqlite / sqlite3
- dotenv
- cors
- nodemon

### Frontend

- React
- Vite
- React Router
- Fetch API
- CSS

### Herramientas

- Git
- npm
- Postman opcional para probar la API

---

## Requisitos previos

Antes de ejecutar el proyecto se necesita tener instalado:

- Node.js 24 LTS o una versión compatible.
- npm.
- Git.
- Un navegador moderno.
- Opcionalmente Postman para probar endpoints.

Verificar instalación:

```bash
node --version
npm --version
git --version
```

---

## Clonar el proyecto

Clonar el repositorio:

```bash
git clone https://github.com/AlejandroGM-Dev/oee-production-monitor-complete.git
cd oee-production-monitor
```

---

## Instalación

Instalar dependencias de backend y frontend desde la raíz:

```bash
npm run install:all
```

Este comando ejecuta internamente:

```bash
npm install --prefix backend
npm install --prefix frontend
```

También se pueden instalar manualmente:

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## Variables de entorno

El proyecto usa archivos `.env` locales. Estos archivos no se suben al repositorio.

### Backend

Crear el archivo:

```text
backend/.env
```

Usando como referencia:

```text
backend/.env.example
```

Contenido esperado:

```dotenv
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/oee-monitor.sqlite
```

Descripción:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto donde corre el backend |
| `NODE_ENV` | Entorno de ejecución |
| `FRONTEND_URL` | URL permitida por CORS |
| `DATABASE_PATH` | Ruta local del archivo SQLite |

### Frontend

Crear el archivo:

```text
frontend/.env
```

Usando como referencia:

```text
frontend/.env.example
```

Contenido esperado:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```

Vite solo expone al navegador variables que comienzan con `VITE_`.

---

## Base de datos

La base de datos usa SQLite y se crea localmente en:

```text
backend/data/oee-monitor.sqlite
```

Ese archivo está ignorado por Git.

### Inicializar base de datos

Desde la raíz:

```bash
npm run db:init
```

Esto crea:

- tabla `machines`,
- tabla `machine_events`,
- índices,
- datos iniciales.

### Resetear base de datos

```bash
npm run db:reset
```

Esto elimina la base local y la vuelve a crear con los datos iniciales.

### Ver resumen de datos

```bash
npm run db:summary
```

Este comando imprime en consola las máquinas y eventos iniciales.

---

## Ejecución en desarrollo

Se recomienda usar dos terminales.

### Terminal 1: Backend

Desde la raíz:

```bash
npm run dev:backend
```

Backend disponible en:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

### Terminal 2: Frontend

Desde la raíz:

```bash
npm run dev:frontend
```

Frontend disponible en:

```text
http://localhost:5173
```

---

## Pruebas

Ejecutar pruebas del backend:

```bash
npm run test:backend
```

Actualmente se prueban casos clave del cálculo temporal:

- rango sin cambios de estado,
- cambios dentro del rango,
- estado iniciado antes del rango,
- eventos fuera del rango,
- evento exactamente en `from`,
- evento exactamente en `to`,
- tiempo en mantenimiento.

---

## Build del frontend

Generar build de producción del frontend:

```bash
npm run build:frontend
```

El build se genera en:

```text
frontend/dist
```

Esa carpeta está ignorada por Git.

---

## Scripts disponibles desde la raíz

| Comando | Descripción |
|---|---|
| `npm run install:all` | Instala dependencias de backend y frontend |
| `npm run dev:backend` | Levanta backend en modo desarrollo |
| `npm run dev:frontend` | Levanta frontend en modo desarrollo |
| `npm run start:backend` | Levanta backend con Node |
| `npm run build:frontend` | Genera build del frontend |
| `npm run test:backend` | Ejecuta pruebas del backend |
| `npm run db:init` | Inicializa base de datos |
| `npm run db:reset` | Resetea base de datos |
| `npm run db:summary` | Muestra resumen de datos |

---

## Estructura del proyecto

```text
oee-production-monitor/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## Arquitectura

El backend está separado por capas:

| Capa | Responsabilidad |
|---|---|
| `routes` | Define rutas HTTP |
| `controllers` | Traduce HTTP hacia servicios |
| `services` | Contiene reglas de negocio |
| `repositories` | Encapsula SQL y acceso a SQLite |
| `validators` | Valida params, query params y body |
| `middleware` | Maneja errores y rutas inexistentes |
| `database` | Conexión, migración, seed y scripts |
| `utils` | Constantes y helpers reutilizables |

El frontend está separado en:

| Carpeta | Responsabilidad |
|---|---|
| `api` | Cliente HTTP hacia el backend |
| `components` | Componentes reutilizables |
| `pages` | Pantallas principales |
| `utils` | Formateo y helpers visuales |

---

## Endpoints

La API base es:

```text
http://localhost:3000/api
```

### Health

```http
GET /api/health
```

Respuesta esperada:

```json
{
  "data": {
    "status": "ok",
    "service": "oee-production-monitor-api",
    "timestamp": "2026-07-26T18:00:00.000Z"
  }
}
```

---

### Listar máquinas

```http
GET /api/machines
```

Devuelve las máquinas con su estado actual, último cambio de estado y alarma activa si aplica.

---

### Obtener máquina por id

```http
GET /api/machines/:id
```

Ejemplo:

```http
GET /api/machines/1
```

Errores posibles:

- `400` si el id no es entero positivo.
- `404` si la máquina no existe.

---

### Historial de eventos

```http
GET /api/machines/:id/events?from=&to=&type=&limit=&offset=
```

Parámetros opcionales:

| Parámetro | Descripción |
|---|---|
| `from` | Fecha ISO inicial |
| `to` | Fecha ISO final |
| `type` | Tipo de evento |
| `limit` | Cantidad máxima de eventos |
| `offset` | Desplazamiento para paginación |

Tipos permitidos:

```text
STATE_CHANGE
ALARM
PRODUCTION_COUNT
```

Ejemplo:

```http
GET /api/machines/1/events?type=PRODUCTION_COUNT&limit=10&offset=0
```

---

### Crear evento

```http
POST /api/machines/:id/events
```

Header:

```http
Content-Type: application/json
```

#### Crear cambio de estado

```json
{
  "eventType": "STATE_CHANGE",
  "newState": "RUNNING",
  "timestamp": "2026-07-26T08:00:00.000Z"
}
```

Estados permitidos:

```text
RUNNING
STOPPED
ALARM
MAINTENANCE
```

#### Crear alarma

```json
{
  "eventType": "ALARM",
  "alarmCode": "E-204",
  "alarmMessage": "Presión insuficiente",
  "timestamp": "2026-07-26T10:15:00.000Z"
}
```

Cuando se registra una alarma, el backend crea dentro de una transacción:

1. un evento `STATE_CHANGE` hacia `ALARM`, si la máquina no estaba ya en `ALARM`;
2. un evento `ALARM` con el código o mensaje.

#### Crear conteo de producción

```json
{
  "eventType": "PRODUCTION_COUNT",
  "unitsProduced": 250,
  "timestamp": "2026-07-26T11:00:00.000Z"
}
```

---

### Consultar OEE

```http
GET /api/machines/:id/oee?from=&to=
```

Ejemplo:

```http
GET /api/machines/1/oee?from=2026-07-26T08:00:00.000Z&to=2026-07-26T16:00:00.000Z
```

Si no se envía rango, se calcula desde el inicio del día UTC hasta el momento actual.

---

## Modelo de datos

### `machines`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | integer | Identificador |
| `name` | text | Nombre de máquina |
| `type` | text | Tipo de máquina |
| `target_rate_per_hour` | integer | Producción objetivo por hora |
| `created_at` | text | Fecha de creación |

### `machine_events`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | integer | Identificador |
| `machine_id` | integer | Máquina asociada |
| `event_type` | text | Tipo de evento |
| `previous_state` | text nullable | Estado anterior |
| `new_state` | text nullable | Nuevo estado |
| `alarm_code` | text nullable | Código de alarma |
| `alarm_message` | text nullable | Mensaje de alarma |
| `units_produced` | integer nullable | Unidades producidas |
| `timestamp` | text | Momento real del evento |
| `created_at` | text | Momento de inserción |

---

## Estados de máquina

| Estado | Significado |
|---|---|
| `RUNNING` | Produciendo |
| `STOPPED` | Detenida sin falla |
| `ALARM` | Detenida por falla |
| `MAINTENANCE` | En mantenimiento |

---

## Tipos de evento

| Tipo | Descripción |
|---|---|
| `STATE_CHANGE` | Cambio de estado |
| `ALARM` | Alarma registrada |
| `PRODUCTION_COUNT` | Conteo incremental de producción |

---

## Cálculo de estado actual

El estado actual no se guarda como campo mutable en la tabla `machines`.

Se deriva del último evento:

```text
event_type = STATE_CHANGE
```

ordenado por:

```text
timestamp DESC, id DESC
```

El `id` se usa como desempate si existen dos eventos con el mismo timestamp.

Si no existe ningún cambio de estado previo, se asume:

```text
STOPPED
```

---

## Cálculo de duración por estado

Para calcular duraciones dentro de un rango `[from, to)`:

1. Se busca el último `STATE_CHANGE` anterior o igual a `from`.
2. Ese evento define el estado inicial.
3. Se consultan los cambios de estado dentro del rango.
4. Se recorren cronológicamente los cambios.
5. Cada estado acumula tiempo hasta el siguiente cambio.
6. El último estado se extiende hasta `to`.

Ejemplo conceptual:

```text
08:00 RUNNING
10:00 STOPPED
10:30 RUNNING
12:00 ALARM
12:20 RUNNING
```

Para el rango:

```text
09:00 - 13:00
```

el sistema calcula:

```text
09:00 - 10:00 RUNNING
10:00 - 10:30 STOPPED
10:30 - 12:00 RUNNING
12:00 - 12:20 ALARM
12:20 - 13:00 RUNNING
```

---

## Cálculo de OEE

El OEE simplificado se calcula así:

```text
OEE = disponibilidad × rendimiento × calidad
```

### Disponibilidad

```text
disponibilidad = tiempo RUNNING / tiempo planificado
```

En esta implementación:

```text
tiempo planificado = duración total del rango - tiempo MAINTENANCE
```

### Rendimiento

```text
rendimiento = unidades producidas / unidades teóricas
```

Donde:

```text
unidades teóricas = target_rate_per_hour × horas RUNNING
```

### Calidad

```text
calidad = 1
```

La calidad se asume al 100 % por simplificación del enunciado.

---

## Supuestos

- Las fechas se almacenan y comparan como strings ISO en UTC.
- Los rangos se interpretan como `[from, to)`.
- Los eventos `PRODUCTION_COUNT` representan unidades incrementales, no contadores acumulados.
- Si no hay estado previo, se asume `STOPPED`.
- El tiempo en `MAINTENANCE` se excluye del tiempo planificado.
- La calidad se asume en 100 %.
- Una alarma está activa si el estado actual de la máquina es `ALARM`; se muestra la última alarma registrada.
- El polling simple del frontend es suficiente para esta primera versión.
- SQLite es suficiente para ejecución local de la prueba.

---

## Manejo de errores

La API devuelve errores con formato consistente:

```json
{
  "error": {
    "code": "INVALID_QUERY_PARAM",
    "message": "from must be a valid ISO date.",
    "details": {
      "field": "from",
      "value": "bad-date"
    }
  }
}
```

Ejemplos:

| Código HTTP | Caso |
|---|---|
| `400` | Parámetro inválido, body inválido, rango inválido |
| `404` | Máquina inexistente o ruta inexistente |
| `409` | Cambio de estado redundante |
| `500` | Error inesperado |

---

## Decisiones técnicas relevantes

La solución usa una arquitectura por capas para mantener separadas las responsabilidades. Los controladores no contienen SQL ni lógica de OEE; los repositorios no conocen HTTP; los servicios concentran las reglas del dominio.

El sistema modela las máquinas y sus eventos por separado. `machines` representa entidades estables, mientras que `machine_events` conserva el historial. El estado actual se deriva del último cambio de estado, lo que permite trazabilidad y cálculo de métricas por rango.

El cálculo de OEE se implementó como lógica de negocio testeable. Primero se reconstruyen intervalos desde eventos discretos, luego se calcula disponibilidad, rendimiento y calidad.

Para alarmas, se decidió que un `ALARM` pueda generar también un `STATE_CHANGE` hacia `ALARM` dentro de una transacción. Esto evita inconsistencias entre estado actual y detalle de alarma.

SQLite se usa por simplicidad local. Para un escenario real con alta concurrencia se podría migrar a PostgreSQL.

---

## Limitaciones conocidas

- No hay autenticación ni usuarios.
- No se registra quién creó o corrigió un evento.
- No existe `ALARM_CLEARED` ni `resolved_at`.
- No hay calendario formal de producción planificada.
- No se distingue entre unidades buenas y defectuosas.
- El frontend usa polling simple; no hay WebSockets ni SSE.
- La paginación usa `limit` y `offset`.
- El OEE se recalcula bajo demanda.
- No hay pruebas end-to-end.

---

## Mejoras futuras

- Agregar autenticación y auditoría.
- Agregar corrección de eventos sin perder historial.
- Modelar resolución de alarmas.
- Agregar calendario de turnos y tiempo planificado real.
- Incorporar unidades buenas, defectuosas y calidad real.
- Migrar SQLite a PostgreSQL.
- Agregar pruebas de integración de API.
- Migrar polling a SSE o WebSockets.
- Agregar preagregados por hora, turno o día para consultas largas de OEE.

---

## Flujo recomendado para probar la aplicación

1. Instalar dependencias:

```bash
npm run install:all
```

2. Crear archivos `.env` en backend y frontend.

3. Inicializar base de datos:

```bash
npm run db:init
```

4. Levantar backend:

```bash
npm run dev:backend
```

5. Levantar frontend en otra terminal:

```bash
npm run dev:frontend
```

6. Abrir:

```text
http://localhost:5173
```

7. Probar dashboard.

8. Entrar al detalle de una máquina.

9. Registrar un evento de producción.

10. Registrar un cambio de estado.

11. Registrar una alarma.

12. Verificar que historial, estado actual y OEE se actualicen.

---

## Autor

Proyecto desarrollado como prueba técnica Ingeniero desarollo de soluciones digitales junior - Alejandro Gutierrez Mora.
