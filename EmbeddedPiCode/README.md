# Raspberry Pi Runtime

This directory contains the Python code that runs directly on the Raspberry Pi hardware.

It is responsible for:

* Capturing plant images
* Reading environmental sensors
* Controlling LEDs and water pump
* Persisting plant care settings
* Communicating with the backend via WebSocket
* Executing automated care routines

<br>

---

# Daemon Support

The Raspberry Pi runtime can be configured to run as a daemon, ensuring it starts automatically on boot and runs in the background.

---

# System Architecture

```
Frontend (UI)
        ↓
Backend API + WebSocket Server
        ↓
Raspberry Pi Runtime (this code)
        ↓
Sensors + Camera + Motor + LEDs
```

The Pi maintains a persistent WebSocket connection to the backend and:

* Receives capture commands
* Receives care instructions
* Sends periodic sensor updates
* Uploads captured images
* Applies lighting and watering logic locally

<br>

---

# Modules Overview

## sensors.py

Defines a generic sensor abstraction and two concrete implementations:

### Base Class: `Sensor`

Common interface for all I2C-based sensors.

### Attributes

* `bus` – smbus2 instance for I2C communication
* `device_address` – I2C device address
* `reading_name` – identifier ("water", "light")
* `min_value` – minimum expected raw reading
* `max_value` – maximum expected raw reading

### Methods

* `scale_reading(x)`
  Scales raw sensor value into a 0–100 range for frontend display.

* `take_single_reading()`
  Returns a scaled reading.

* `take_unscaled_reading()`
  Virtual method implemented by subclasses.

---

### `SpectralSensor`

* I2C address: `0x49`
* Measures spectral light intensity
* Returns calibrated multi-channel light data
* Final value is the summed intensity

---

### `SoilSensor`

* I2C address: `0x48`
* Reads raw soil moisture via ADC
* Inverts reading (higher moisture = lower raw value)
* Scales into 0–100%

<br>

---

## camera.py

Encapsulates Raspberry Pi camera functionality.

### Class: `Camera`

Uses `Picamera2` for still image capture.

### Features

* Configurable resolution
* Manual gain and exposure control
* Controlled white balance and saturation
* Warm-up time before capture

### Methods

* `take_capture()`
  Captures a single image and saves to disk.

* `stop()`
  Stops the camera safely.

<br>

---

## leds.py

Controls NeoPixel LED matrix or strip.

### Class: `Leds`

Uses `neopixel` library.

### Methods

* `change_brightness(brightness, color)`
  Adjusts LED brightness and RGB color.

Used for:

* Growth lighting
* Capture flash assist
* Visual plant stage indication

<br>

---

## motor.py

Controls stepper motor used for watering.

### Class: `Motor`

Uses `RPi.GPIO`.

### Methods

* `spin_motor(step_count)`
  Spins motor fixed number of steps.

* `spin_until_moisture(check_moisture_func, threshold)`
  Waters incrementally until moisture threshold reached.

* `stop_power()`
  Cuts motor power safely.

* `cleanup()`
  Resets GPIO pins.

<br>

---

## integrated.py

This is the **main orchestration module**.

### Class: `PiSystem`

Coordinates:

* WebSocket communication
* Sensor polling
* LED control
* Motor control
* Camera capture
* CSV persistence
* Plant care automation logic

<br>

---

# Runtime Behaviour

## Startup

On launch:

* Reads saved care settings from `care_settings.csv`
* Translates requirements into numeric thresholds
* Connects to backend via WebSocket
* Starts sensor polling thread

---

## Sensor Polling Loop

Runs every `sensor_interval_sec` (default: 600 seconds).

Each cycle:

1. Read all sensors
2. Adjust LED brightness if below light threshold
3. Water plant if below moisture threshold
4. Send sensor update to backend

<br>

---

## Capture Flow

When backend sends:

```json
{
  "type": "capture",
  "job_id": "..."
}
```

The Pi:

1. Turns on LEDs
2. Captures image
3. Uploads image via HTTP POST
4. Restores LED state

---

## Apply Instructions Flow

When backend sends:

```json
{
  "type": "apply instructions",
  "instruction_id": "...",
  "job_id": "...",
  "notes": {
    "Moisture Requirements": "Medium",
    "Light Requirements": "Bright Indirect",
    "Maturation Stage": "Flowering"
  }
}
```

The Pi:

1. Updates internal settings
2. Writes them to CSV
3. Translates to thresholds
4. Updates LED color
5. Acknowledges back to backend

<br>

---

# Settings Persistence

Care instructions are saved in:

```
care_settings.csv
```

This ensures:

* Reboot resilience
* Crash recovery
* Autonomous operation without backend

<br>

---

# Authentication

WebSocket connection includes:

* `device_id`
* `es_pi_key`
* `device_secret`

Backend verifies pairing before accepting communication.

