# HANA 花

### Intelligent Plant Care, Powered by AI

This IoT project was developed as coursework for the **Embedded Systems module at Imperial College London 2026**.

HANA is a full-stack intelligent plant care system that combines:

* Computer Vision
* IoT Communication
* Machine Learning
* Automated Actuation
* Cloud Backend and Web UI

The system identifies a plant using AI and automatically adjusts watering and lighting according to care requirements.

Find UI at: https://c-gibson20.github.io/Embedded-Systems-UI/ <br>
Find Marketing site at: https://c-gibson20.github.io/Embedded-Systems-UI/marketing/

---

# System Overview

HANA consists of four major components:

```
HANA/
│
├── Backend/            → FastAPI cloud backend
├── Frontend/           → React + TypeScript web UI
├── EmbeddedPiCode/     → Raspberry Pi hardware control
├── ML/                 → Model training & dataset
│
└── (marketing_site branch)
```

---

# Architecture

```
User → Web UI → Backend → Raspberry Pi
                         ↘
                         ML Model
```

### Flow Summary

1. User selects a device in the web UI.
2. User triggers image capture.
3. Raspberry Pi captures image and uploads to backend.
4. ML model classifies plant.
5. Backend returns plant label + care guidance.
6. Instructions sent to Pi.
7. Pi:

   * Adjusts LEDs
   * Waters plant if required
   * Periodically sends sensor updates
8. Frontend displays:

   * Current plant
   * Sensor data
   * Device status

---

# Repository Structure

## Backend

FastAPI-based cloud API.

Responsibilities:

* Image upload handling
* ML inference
* Instruction dispatch via WebSocket
* Sensor data storage
* Device pairing and authentication
* Plant-care lookup from local dataset

Includes:

* REST endpoints
* WebSocket endpoint for Pi communication
* In-memory stores (capture jobs, instructions and sensors)
* Local `plant_care_database.xlsx`

---

## Frontend

React + TypeScript application.

Features:

* Device management
* Plant identification workflow
* Care instruction upload
* Live sensor monitoring
* Device pairing status
* Responsive UI layout

The frontend polls:

* Device status
* Sensor readings
* Current plant

---

## EmbeddedPiCode

Runs on Raspberry Pi.

Controls:

* Camera (Picamera2)
* LED grow lights (NeoPixel)
* Water pump (Stepper motor)
* I2C sensors (Spectral + Soil)

Maintains:

* WebSocket connection to backend
* Periodic sensor updates
* Local CSV persistence of care settings

Can run as:

* Foreground process
* Background daemon service

---

## ML

Contains:

* Custom curated dataset
* 4 Jupyter notebooks
* Transfer learning pipeline
* Model evaluation
* Label order verification

Dataset:

* 6 plant species
* 100 images per class
* Manually curated for development

Designed for:

* Proof of concept
* Easy retraining for scaling

<br>

---

# Marketing Website (Separate Branch)

This repository contains an additional branch:

```
marketing_site
```

This branch includes a dedicated marketing website for the product.

### Deployment Details

* Deployed alongside the main frontend.
* Shares the same base URL.
* Accessible at:

```
BASE_URL/marketing/
```

In this case:

```
https://c-gibson20.github.io/Embedded-Systems-UI/marketing/
```

The marketing site is independent from the main app but deployed together.

---

# Security Model

The system uses multiple key-based protections:

* `FRONTEND_KEY` – Secures frontend → backend requests
* `PI_KEY` – Secures Pi → backend WebSocket connection
* `pairing_secret` – Per-device authentication

This ensures:

* Only registered devices connect
* Only authorised frontend requests are processed
* Devices cannot access each other’s data
* Users cannot access other user devices or data

<br>

---

# Sensor Data Flow

1. Pi reads sensors every defined interval.
2. Sends:

   ```json
   {
     "type": "sensor_update",
     "water": { "status": "...", "value": ... },
     "light": { "status": "...", "value": ... }
   }
   ```
3. Backend stores latest reading per device.
4. Frontend polls `/sensors/{device_id}`.
5. UI updates live meter display.

Sensor readings are always associated with a specific device ID.

---

# Database Design

At this development stage:

* Plant care guidance is stored in a local `.xlsx` file.
* Dataset is immutable.
* No synchronisation required.
* Perfectly suited for prototype scale.

If scaling is required:

* Easily migrated to hosted database (PostgreSQL, etc.)
* No structural redesign required.

<br>

---

# Deployment Model

The frontend and backend are deployed independently:
* Backend hosted on Render
* Frontend hosted via GitHub Pages
The frontend communicates with the backend over HTTPS using a configured API base URL.

The system supports:

* HTTPS
* WSS (secure WebSockets)
* Cloud-hosted inference
* Remote IoT communication

<br>

---

# Development Status

This repository represents a:

* Fully integrated IoT system
* Functional Machine Learning pipeline
* Secure device pairing model
* Working end-to-end hardware control prototype

The architecture is intentionally modular to allow:

* Adding more plant classes
* Supporting multiple devices
* Scaling database
* Expanding sensor types
* Edge inference support
