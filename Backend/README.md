# Backend (FastAPI)
This service connects:

* **Frontend UI** (React / Vite)
* **Plant classification model**
* **Raspberry Pi device**
* **Sensor data pipeline**
* **Instruction dispatch system**

It provides secure communication between devices and the UI using REST + WebSockets.

---

# Architecture Overview

```
Frontend (GitHub Pages)
        │
        │ REST API (HTTPS)
        ▼
FastAPI Backend (Render)
        │
        │ WebSocket (WSS)
        ▼
Raspberry Pi Device
```

The backend:

* Accepts image captures
* Runs plant classification
* Stores latest plant per device
* Dispatches care instructions
* Receives sensor updates
* Provides polling endpoints for UI

<br>

---

# Features

## Plant Identification

* Capture image from Pi
* Upload to backend
* Run ML inference
* Return plant label + confidence + notes

---

## Instruction Dispatch

* Frontend sends structured care instructions
* Backend validates pairing + auth
* Instructions sent via WebSocket to Pi
* Pi acknowledges success/failure
* UI polls for status

---

## Sensor System

Pi periodically sends sensor reading updates, example:

```json
{
  "type": "sensor_update",
  "water": { "status": "ok", "value": 65 },
  "light": { "status": "error", "message": "No response" }
}
```

Backend:

* Stores latest reading per device
* Timestamps values (ms)
* Serves `/api/v1/sensors/{device_id}` endpoint

Frontend:

* Polls every 5 minutes.
* Displays meter or error state

<br>

---

# Security Model

Three levels of validation:

| Key             | Purpose                              |
| --------------- | ------------------------------------ |
| `PI_KEY`        | Authenticates physical Pi device     |
| `FRONTEND_KEY`  | Authenticates frontend               |
| `device_secret` | Ensures frontend is paired to device |

This prevents:

* Unauthorized instruction injection
* Cross-device spoofing
* Random sensor spam

<br>

---

# Project Structure

```
app/
├── api/v1/
| ├── router.py
| ├── endpoints/
│   ├── health.py
│   ├── analyze.py
│   ├── capture.py
│   ├── instructions.py
│   ├── instruction_status.py
│   ├── pi_ws.py
│   ├── result.py
│   ├── upload.py
│   ├── stored_image.py
│   ├── sensors.py
│   └── device_status.py
│
├── core/
│   ├── pi_connection_manager.py
│   ├── instruction_store.py
│   ├── image_store.py
│   ├── job_store.py
│   └── sensor_store.py
│
├── ml/
│   ├── efficient_net_fine_tuner.py
│   ├── plant_care_database.xlsx
│   ├── model_loader.py
│   ├── plant_care.py
│   ├── preprocessing.py
│   └── labels.py
│
├── schemas/
│   └── analysis.py
|
├── services/
│   └── analyze_service.py
│
└── main.py
```

<br>

---

# Environment Variables

Set in Render dashboard:

```
PI_KEY=your_pi_secret
FRONTEND_KEY=your_frontend_secret
```

---

# Deployment

Backend is deployed on:

**Render**

* Auto-deploy on push to main
* Environment variables configured in dashboard
* Uses Uvicorn production server

---

# Plant Care Database Design

## Current Approach 

At this stage of development:

* The plant dataset is **small**
* The data is **read-only**
* The dataset is **immutable during runtime**
* Only **label-based lookup** is required

For these reasons, the plant care guidance is stored locally in the backend runtime as:

```
plant_care_database.xlsx
```

This file:

* Is loaded into memory at startup
* Indexed by plant name
* Used to retrieve structured care notes after classification

Example workflow:

```
Image → ML model → label
Label → XLSX lookup → care guidance
Care guidance → instruction dispatch to Pi
```

Because:

* The dataset does not change dynamically
* There are no writes
* There are no mutation concerns

There is **no requirement for database synchronization or transactional guarantees** at this stage.

A local XLSX file is therefore:

* Simple
* Lightweight
* Fast
* Easy to version control
* Ideal for development

Introducing:

* PostgreSQL
* Supabase
* Firebase
* ORM layers

would add unnecessary complexity and operational overhead.

---

## Future Scalability

If scaling is required, migration is straightforward.

The current abstraction allows easy transition to:

* PostgreSQL
* Supabase
* MongoDB
* Cloud-hosted managed database

Migration would involve:

1. Moving plant care data into a database table
2. Replacing XLSX lookup with a repository/query layer
3. Maintaining the same response schema

No changes would be required to:

* The ML pipeline
* The instruction dispatch flow
* The frontend interface
