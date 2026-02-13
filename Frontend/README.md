# Frontends

This is the frontend application for the HANA plant care system.
It provides:

* Plant identification via device capture
* Automated care instruction management
* Live soil moisture and light sensor visualisation
* Real-time device status monitoring

The frontend communicates with the FastAPI backend and connected Raspberry Pi devices via HTTP and WebSocket APIs.

---

# Architecture Overview

The frontend is built with:

* **React**
* **TypeScript**
* **Vite**
* **CSS Modules / Custom Styling**

It interacts with:

* Backend REST API (`/api/v1/...`)
* WebSocket-driven device communication (via backend relay)
* GitHub Pages deployment

<br>

---

# Environment Variables

| Variable            | Purpose                                 |
| ------------------- | --------------------------------------- |
| `VITE_API_BASE`     | Base URL of the backend API             |
| `VITE_FRONTEND_KEY` | Auth header used for backend validation |
| `VITE_STORAGE_KEY`  | Local storage key for saved devices     |

These are required at **build time** for production.

---

# Deployment

Deployment is handled by:

* GitHub Actions workflow
* Repository Secrets:

  * `VITE_API_BASE`
  * `VITE_FRONTEND_KEY`
  * `VITE_STORAGE_KEY`

The workflow:

1. Installs dependencies
2. Injects environment variables
3. Builds the project
4. Publishes to GitHub Pages

<br>

---

# Core Features

## Current Plant Panel

* Displays last identified plant for selected device
* “Manage Plant” toggle reveals capture + analysis UI

## Image Capture and Analysis

* Trigger capture on connected Pi device
* Polls backend until classification completes

## Care Instruction Dispatch

* Sends structured care instructions to device
* Polls instruction status
* Displays confirmation or error feedback

## Sensor Monitoring

* Polls backend periodically
* Displays:

  * Soil moisture (0–100%)
  * Light level (0–100%)
* Handles:

  * Loading state
  * Error state
  * Time since last update

Sensor values are device-specific and isolated by `device_id`.

---

# Data Flow

### Capture Flow

Frontend → Backend → WebSocket → Pi → Image Upload → Backend → Frontend Poll

### Instruction Flow

Frontend → Backend → WebSocket → Pi → Ack → Backend → Frontend Poll

### Sensor Flow

Pi → WebSocket → Backend Store → Frontend Poll

---

# Device Model

Devices are stored locally in browser storage:

```ts
type SavedDevice = {
  deviceId: string;
  pairingSecret: string;
};
```

Multiple devices are supported.
UI updates dynamically when switching between devices.

---

# UI Structure

```
App
 ├── DeviceCard
 ├── PlantPanel
 │    ├── CurrentPlantCard
 │    ├── ImageInputCard
 │    └── ResultsCard
 └── SensorsCard
```

The PlantPanel handles UI collapse/expand state while App maintains all core state and API logic.

---

# Error Handling

The UI handles:

* Device not paired
* Backend unreachable
* Instruction timeout
* Sensor errors
* Missing readings
* Stale sensor updates
