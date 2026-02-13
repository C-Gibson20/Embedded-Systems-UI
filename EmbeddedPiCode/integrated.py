#!/usr/bin/python3
import threading
import csv
import asyncio
import os
import json
import time
import argparse
import requests
import websocket 
import signal 
import sys
import board
from sensors import Sensor, SpectralSensor, SoilSensor
from camera import Camera
from motor import Motor
from leds import Leds
import smbus2
from datetime import datetime

def to_ws_url(http_base):
    """
    Convert an HTTP base URL to the corresponding WebSocket URL by replacing the scheme.
    """
    if http_base.startswith("https://"):
        return "wss://" + http_base[len("https://"):]
    if http_base.startswith("http://"):
        return "ws://" + http_base[len("http://"):]
    raise ValueError("BASE_URL must start with http:// or https://")

class PiSystem:
    def __init__(self, base_url, device_id, pi_key, device_secret, image_path, csv_path, sensors, camera, motor, leds, on_hour, off_hour):
        """
        Initializes the PiSystem with the specified configuration parameters.
        """
        # Setup device properties
        self.base_url = base_url.rstrip("/")
        self.device_id = device_id
        self.pi_key = pi_key
        self.device_secret = device_secret
        self.image_path = image_path
        self._stop = False
        self.ws = None

        # Sensor thread definition
        # Polling every 600 seconds (10 minutes)
        self.sensor_interval_sec = 600
        self._sensor_thread_stop = threading.Event()
        self._sensor_thread = None
        
        # WebSocket URL construction
        ws_base = to_ws_url(self.base_url)
        self.ws_url = f"{ws_base}/api/v1/ws/pi?device_id={self.device_id}&es_pi_key={self.pi_key}&device_secret={self.device_secret}"
        
        # Settings initialization
        self.settings = {"Moisture Requirements":[],"Light Requirements":[],"Maturation Stage" : []}
        
        # Read initial settings from CSV and translate to thresholds and configurations
        self.csv_path = csv_path
        self.read_csv()
        self.translate_requirements()
        self.sensors = sensors
        self.camera = camera
        self.motor = motor
        self.leds = leds
        self.leds.change_brightness(self.brightness, self.color)
        self.current_brightness = self.brightness
        self.on_hour = on_hour
        self.off_hour = off_hour

        print(f"[WS] WebSocket URL: {self.ws_url}")

    def read_csv(self):
        """
        Reads the care settings from a CSV file and updates the system's settings accordingly.
        Restores settings in the event of a reboot or crash to ensure the system continues to operate with the last known configuration.
        """
        try:
            with open(self.csv_path,newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                # Read each requirement from the CSV and update the settings dictionary
                for row in reader:
                    print(f"Printing row {row}")
                    self.settings["Moisture Requirements"] = row["Moisture Requirements"]
                    self.settings["Light Requirements"] = row["Light Requirements"]
                    self.settings["Maturation Stage"] = row["Maturation Stage"]
                    print(f"Settings were initialized to {self.settings}")
        except Exception as e:
            print(f"[ERR] Failed to read CSV file: {e}")

    def write_csv(self,notes):
        """
        Writes the care settings to a CSV file based on the provided notes.
        This is used to persist the latest care instructions received from the server.
        """
        with open(self.csv_path,'w',newline='') as csvfile:
            fieldnames = ["Moisture Requirements","Light Requirements","Maturation Stage"]
            writer = csv.DictWriter(csvfile,fieldnames=fieldnames)
            writer.writeheader()
            print(notes)
            writer.writerow({"Moisture Requirements" : notes["Moisture Requirements"], "Light Requirements" : notes["Light Requirements"], "Maturation Stage" : notes["Maturation Stage"]})

    def sense_values(self):
        """
        Reads sensor values from all connected sensors and returns a dictionary of sensor readings.
        """
        sensor_dict = {}
        for sensor in self.sensors:
            sensor_dict[sensor.reading_name] = sensor.take_single_reading()
        print(sensor_dict)
        return sensor_dict

    def construct_sensor_payload(self, sensor_dict):
        """
        Constructs a payload dictionary containing sensor readings formatted for transmission.
        """
        payload = {"type": "sensor_update"}

        for k, v in sensor_dict.items():
            # For each sensor reading, determine if it's a valid numeric value. 
            # If so, include it in the payload with an "ok" status.
            if isinstance(v, int) or isinstance(v, float):
                print(f"Key {k} current_brightness {self.current_brightness}")
                if k == "light" and self.current_brightness > 0:
                    value = v + self.light_threshold
                else:
                    value = v
                payload[k] = {"status": "ok", "value": value}
            # Else include an "error" status in the payload for that sensor.
            else:
                payload[k] = {"status": "error", "message": f"{k} sensor failure"}
        return payload


    def sensing_protocol(self, ws):
        """
        Continuously reads sensor values, adjusts LED brightness based on light levels,
        controls watering based on moisture levels, and sends sensor data via WebSocket.
        """
        print(f"[SENSORS] Sensor loop started (every {self.sensor_interval_sec}s)")
        while not self._sensor_thread_stop.is_set():
            try:
                # Read current sensor values
                sensor_dict = self.sense_values()
                
                # Determine if the current time is within the defined light hours 
                # Adjust LED brightness based on the light sensor reading and the defined threshold.
                current_hour = datetime.now().hour
                light_hours = self.on_hour <= current_hour < self.off_hour
                if sensor_dict["light"] < self.light_threshold and light_hours:
                    self.leds.change_brightness(self.brightness, self.color)
                    self.current_brightness = self.brightness
                else:
                    self.leds.change_brightness(0, (0,0,0))
                    self.current_brightness = 0

                # Check moisture levels and water if below threshold
                # Only during defined light hours or if light levels are sufficient to avoid mold growth
                if sensor_dict["water"] < self.moisture_threshold:
                    if (light_hours or sensor_dict["light"] > self.light_threshold) and self.current_brightness != 0:
                        def get_current_moisture():
                                for s in self.sensors:
                                    if s.reading_name == "water":
                                        try:
                                            return s.take_single_reading()
                                        except Exception as e:
                                            print(f"[SENSORS] Failed to take moisture reading while watering {e}")
                                return 0
                        self.motor.spin_until_moisture(get_current_moisture, self.moisture_threshold)
                    else:
                        print("Plant requires water, however light level is too low to water.")
                else:
                    print("Plant is happy at current water level.")

                # Construct the payload with sensor readings and send it via WebSocket
                payload = self.construct_sensor_payload(sensor_dict)
                ws.send(json.dumps(payload))
                print(f"[SENSORS] Sent: {payload}")
            except Exception as e:
                print(f"[SENSORS] Send error: {e}")
                return
            self._sensor_thread_stop.wait(self.sensor_interval_sec)
        print("[SENSORS] Sensor loop stopped")

    def translate_requirements(self):
        """
        Translates user-friendly plant care requirements into numeric thresholds
        for moisture, light, and LED color settings.
        """

        # Translate the moisture requirement into a numeric threshold using a predefined mapping.
        moisture_requirement = self.settings["Moisture Requirements"]
        moisture_threshold_dict = {"Low" : 10, "Medium" : 33, "High" : 66}
        try:
            self.moisture_threshold = moisture_threshold_dict[moisture_requirement]
        except ValueError:
            print(f"Couldn't determine moisture {moisture_requirement} setting to Low")
            self.moisture_threshold = 30

        # Translate the light requirement into a numeric threshold for the light sensor and a brightness level for the LEDs using a predefined mapping.
        light_requirement = self.settings["Light Requirements"]
        light_threshold_dict = {"Dark" : (0,0), "Low" : (18,0.025), "Medium" : (36,0.05), "Bright Indirect" : (54,0.075), "Bright Direct" : (72,0.1)}
        try:
            self.light_threshold, self.brightness = light_threshold_dict[light_requirement]
        except ValueError:
            print(f"Couldn't determine light {light_requirement} setting to low")
            self.light_threshold = 18

        # Translate the maturation stage into an LED color using a predefined mapping.
        color_requirement = self.settings["Maturation Stage"]
        color_requirement_dict = {"Seedling" : (0,0,255), "Mature" : (212,235,255), "Flowering" : (255,0,0), "Fruiting" : (255,60,40)}
        try:
            self.color = color_requirement_dict[color_requirement]
        except ValueError:
            print(f"Couldn't determine color {color_requirement} setting to red")
            self.color = (255,0,0)

    def upload_image(self, job_id):
        """
        Uploads the captured image to the server for the specified job ID using an HTTP POST request with the appropriate headers and file data.
        """
        url = f"{self.base_url}/api/v1/pi/upload/{job_id}?device_id={self.device_id}"
        headers = {"ES-Pi-Key": self.pi_key}

        with open(self.image_path, "rb") as f:
            files = {"file": (os.path.basename(self.image_path), f, "image/png")}
            r = requests.post(url, headers=headers, files=files, timeout=120)

        if not r.ok:
            raise RuntimeError(f"Upload failed: {r.status_code} {r.text}")

        print(f"[OK] Uploaded image for job_id={job_id}")
    
    def run_forever(self):
        """
        Runs the main loop, handling WebSocket connections and signals for graceful shutdown.
        """
        def handle_sigint(signum, frame):
            """
            Handles the SIGINT signal (e.g., Ctrl+C) to perform shutdown of the system
            Ensures that hardware components are properly cleaned up before exiting.
            """
            print("\n[WS] SIGINT received, shutting down...")
            self.motor.cleanup()
            self.stop()
            sys.exit(0)

        signal.signal(signal.SIGINT, handle_sigint)

        def on_open(ws):
            """
            Handles the event when the WebSocket connection is opened.
            Starts the sensor thread to begin sensing protocol.
            """
            print(f"[WS] Connected: {self.ws_url}")
            try:
                self._sensor_thread_stop.clear()
                self._sensor_thread = threading.Thread(target=self.sensing_protocol, args=(ws,), daemon=True)
                self._sensor_thread.start()
                print("Started sensor thread")
            except Exception as e:
                print(f"[ERR] Sensor thread error: {e}")

        def on_message(ws, message):
            """
            Handles incoming WebSocket messages, processing capture commands and care instructions.
            """
            try:
                data = json.loads(message)
            except Exception:
                return

            # Process capture command from the server to take a picture and upload it
            if data.get("type") == "capture":
                job_id = data.get("job_id")
                if not job_id:
                    return
                print(f"[WS] Capture command received. job_id={job_id}")
                
                try:
                    # Briefly flash the LEDs to assists capture, take the picture, and then restore LED brightness.
                    self.leds.change_brightness(0.1,(255,255,255))
                    time.sleep(0.15)
                    camera.take_capture()
                    time.sleep(0.15)
                    self.leds.change_brightness(self.current_brightness, self.color)
                except Exception as e:
                    print(f"[ERR] {e}")

                try:
                    self.upload_image(job_id)
                except Exception as e:
                    print(f"[ERR] {e}")

            # Process care instructions from the server to update settings
            elif data.get("type") == "apply instructions":
                instruction_id = data.get("instruction_id")
                job_id = data.get("job_id")
                notes = data.get("notes", {})
                print(f"[WS] Care instructions received for job_id={job_id}.")
                print(notes) 
                try:
                    time.sleep(1)
                    # Acknowledge receipt of instructions back to the server with the instruction ID and job ID
                    ack = {
                        "type": "instructions applied", 
                        "instruction_id": instruction_id,
                        "job_id": job_id, 
                        "ok": True,
                        "message": "Instructions applied successfully."
                    }
                    
                    print(f"Notes: {notes}") 

                    # Update settings based on the received instructions
                    self.settings["Moisture Requirements"] = notes["Moisture Requirements"]
                    self.settings["Light Requirements"] = notes["Light Requirements"]
                    self.settings["Maturation Stage"] = notes["Maturation Stage"]
                    
                    # Write them to the CSV for persistence
                    self.write_csv(notes)

                    # Translate them into thresholds and configurations for the system to use.
                    self.translate_requirements()
                    self.leds.change_brightness(self.brightness, self.color)
                    self.current_brightness = self.brightness

                    # Send the acknowledgment back to the server to confirm that the instructions have been applied
                    ws.send(json.dumps(ack))
                    print(f"[WS] Acknowledged instructions for job_id={job_id}.")
                except Exception as e:
                    print(f"[ERR] {e}")

        def on_error(ws,error):
            """
            Handles WebSocket errors by printing the error message and allowing for reconnection attempts.
            """
            print(f"[WS] Error: {error}")

        def on_close(ws, code, msg):
            """
            Handles the event when the WebSocket connection is closed.
            Stops sensor thread and resources are cleaned up.
            """
            print(f"[WS] Closed: code={code} msg={msg}")

            self._sensor_thread_stop.set()
        
        print("Running forever")  
        while not self._stop:
            print("Opening socket")

            # Initialize and run the WebSocket connection with the defined event handlers for open, message, error, and close events.
            self.ws = websocket.WebSocketApp(
                self.ws_url,
                on_open=on_open,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close,
            )
            print("Opened socket")
            self.ws.run_forever(ping_interval=25, ping_timeout=10)

    def stop(self):
        """
        Stops the main loop and sensor thread, and closes the WebSocket connection if it exists.
        """
        self._stop = True
        self._sensor_thread_stop.set()
        if self.ws:
            self.ws.close()

if __name__ == "__main__":

    bus = smbus2.SMBus(1)
    base_url = "https://embedded-systems-ui.onrender.com"
    device_id = "pi-01"
    pi_key = "***REMOVED***"
    device_secret = "***REMOVED***"
    image_path = "sample_plant.png"  
    csv_path = "care_settings.csv"
    sensors = [SpectralSensor(bus), SoilSensor(bus)] 
    camera = Camera((1440,1080),1.0,40000,image_path)
    out1, out2, out3, out4 = 10, 24, 23, 22
    step_sleep = 0.0015
    motor = Motor(out1, out2, out3, out4, step_sleep)
    pixel_pin = board.D12
    num_pixels = 64
    leds = Leds(pixel_pin, num_pixels)
    on_hour = 8
    off_hour = 23 

    system = PiSystem(
        base_url=base_url,
        device_id=device_id,
        pi_key=pi_key,
        device_secret=device_secret,
        image_path=image_path,
        csv_path=csv_path,
        sensors=sensors,
        camera=camera,
        motor=motor,
        leds=leds,
        on_hour=on_hour,
        off_hour=off_hour,
    )


    def daemon_shutdown(signum, frame):
        """
        Handles the shutdown signal to stop the daemon and clean up resources.
        """
        print("[SHUTDOWN] Stopping daemon...")
        system.stop()
        # Explicitly turn off hardware
        motor.cleanup() 
        leds.change_brightness(0, (0,0,0))
        sys.exit(0)

    signal.signal(signal.SIGINT, daemon_shutdown)
    signal.signal(signal.SIGTERM, daemon_shutdown)

    try:
        system.run_forever()
    except Exception as e:
        print(f"[CRITICAL] System crashed: {e}")
        motor.cleanup()
