

# Gestor de Reservas de Canchas — Backend

API REST para gestionar **canchas** y **reservas**. Construida con **Node.js + Express** y **MongoDB Driver oficial**.

---

## ✨ Características
- CRUD de **canchas** y **reservas**.
- Validaciones con **express-validator**.
- **CORS** configurable por `.env`.
- Persistencia en **MongoDB Atlas**.
- Manejo de errores consistente (códigos HTTP y mensajes claros).
- Formato de horas **inteligible**: se almacena `date`, `start`, `end` como **strings** (`YYYY-MM-DD`, `HH:mm`). Para validar y ordenar, se calculan campos derivados `startMins` y `endMins`.

---

## 🧱 Tech Stack
- Node 18+
- Express 4
- MongoDB Driver 6

---

## 🔐 Variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=4000
MONGODB_URI=mongodb+srv://reservation_admin:admin1234@mycluster.vlbhwms.mongodb.net/?retryWrites=true&w=majority
DB_NAME=gestor_de_reservas_de_canchas
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

```

---

## ⚙️ Instalación y ejecución
```bash
npm i
npm run dev  # o npm start
```
La API quedará en `http://localhost:4000`.

---

## 🔌 Endpoints

## Endpoint de documentacion
- `http://localhost:4000/api-docs/#/`

### Health
- `GET /api/health` → `{ "status": "ok" }`

### Canchas
- `GET /api/courts/get` listar
- `POST /api/courts/post` crear `{ name, type: futbol|baloncesto|tenis, pricePerHour }`
- `PUT /api/courts/put/:id` actualizar (cualquier campo)
- `DELETE /api/courts/delete/:id` eliminar *(bloquea si hay reservas futuras)*

### Reservas
- `GET /api/reservations/get?date=YYYY-MM-DD&courtId=<id>` listar por fecha/cancha
- `POST /api/reservations/post` crear `{ date: YYYY-MM-DD, start: HH:mm, end: HH:mm, courtId, clientName }`
- `PUT /api/reservations/put/:id` actualizar (mismos campos, todos opcionales)
- `DELETE /api/reservations/delete/:id` eliminar

**Documento de reserva (ejemplo)**
```json
{
  "_id": "...",
  "courtId": "ObjectId(...)",
  "clientName": "Juan Pérez",
  "date": "2025-08-19",
  "start": "19:00",
  "end": "20:00",
  "startMins": 1140,
  "endMins": 1200,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 🧪 Pruebas rápidas en Insomnia
> Crea una Environment Variable `base_url = http://localhost:4000/api`.

### 1) Health
**GET** `{{ base_url }}/health`

### 2) Crear cancha
**POST** `{{ base_url }}/courts/post`
```json
{
  "name": "Cancha 1",
  "type": "futbol",
  "pricePerHour": 30
}
```
> Copia el `_id` de la respuesta en la variable `courtId`.

### 3) Listar canchas
**GET** `{{ base_url }}/courts/get`

### 4) Actualizar cancha
**PUT** `{{ base_url }}/courts/put/{{ courtId }}`
```json
{ "pricePerHour": 35 }
```

### 5) Eliminar cancha
**DELETE** `{{ base_url }}/courts/delete/{{ courtId }}`
> Si tiene reservas futuras → **409**.

### 6) Crear reserva
**POST** `{{ base_url }}/reservations/post`
```json
{
  "date": "2025-08-20",
  "start": "19:00",
  "end": "20:00",
  "courtId": "{{ courtId }}",
  "clientName": "Juan Pérez"
}
```
> Copia el `_id` en `reservationId`.

### 7) Listar reservas
**GET** `{{ base_url }}/reservations/get`

**GET** `{{ base_url }}/reservations/get?date=2025-08-20`

### 8) Cambiar horas de una reserva
**PUT** `{{ base_url }}/reservations/put/{{ reservationId }}`
```json
{ "start": "20:00", "end": "21:00" }
```

### 9) Eliminar reserva
**DELETE** `{{ base_url }}/reservations/delete/{{ reservationId }}`

---

## 🌐 CORS (cómo probar)
- Backend en `http://localhost:4000`.
- Define `CORS_ORIGIN` con la URL del frontend (p. ej. `http://localhost:5173`).
- Desde el frontend podrás hacer `fetch` a `http://localhost:4000/api/...`.

---

## 🧭 Colecciones e índices
- `courts`: índice único `{ name: 1 }`
- `reservations`: índice compuesto `{ courtId: 1, date: 1, startMins: 1, endMins: 1 }`

---


## 🔗 Frontend
**Repositorio frontend :** _[[link repo](https://github.com/JhonIsaacMedinaMendoza08/Gestor-de-reservas-de-canchas-frontend.git)]_  
**Deploy de frontend:** _[[link ](https://gestor-de-reservas-de-canchas-front.vercel.app/)]_ 

---

## 🔗 Video explicativo
**Video de Youtube :** _[[[link](https://youtu.be/-rfr3Kpvxpk)]]_  

---

## 📝 Licencia
MIT
