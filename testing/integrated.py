#!/usr/bin/python3
import neopixel
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
import struct
import numpy as np
from PIL import Image
from codetiming import Timer
from picamera2 import Picamera2, Preview
import smbus2

PIXEL_PIN = board.D12
NUM_PIXELS = 64
BRIGHTNESS = 0.01

pixels = neopixel.NeoPixel(
    PIXEL_PIN,
    NUM_PIXELS,
    brightness=BRIGHTNESS,
    auto_write=False
)

def change_light_level(light_requirement,color):
    if light_requirement == "Medium indirect":
        brightness = 0.005
    elif light_requirement == "Bright direct":
        brightness = 0.01
    elif light_requirement == "Dark":
        brightness = 0
    else:
        print(f"Could not determine brightness for light requirement:{light_requirement} setting brightness low")
        brightness = 0.001     
    pixels.brightness = brightness
    pixels.fill(color)
    pixels.show()


class Camera:
    def __init__(self,size,gain,exposure,image_path):
        self.image_path = image_path
        self.picam2 = Picamera2()
        self.picam2.start_preview(Preview.NULL)
        capture_config = self.picam2.create_still_configuration({"size":size})
        # capture_config = picam2.create_still_configuration({"size":(1920,1080)})
        self.picam2.configure(capture_config)
        self.picam2.start()
        time.sleep(2)
        with self.picam2.controls as ctrl:
            ctrl.AnalogueGain = gain 
            ctrl.ExposureTime = exposure 
        time.sleep(2)

    def take_capture(self):
        imgs = 1 
        sumv = None
        for _ in range(imgs):
            if sumv is None:
                sumv = np.longdouble(self.picam2.capture_array())
                img = Image.fromarray(np.uint8(sumv))
                img.save("original.tif")
            else:
                sumv += np.longdouble(self.picam2.capture_array())
        img = Image.fromarray(np.uint8(sumv / imgs))
        img.save(self.image_path)

def to_ws_url(http_base):
    if http_base.startswith("https://"):
        return "wss://" + http_base[len("https://"):]
    if http_base.startswith("http://"):
        return "ws://" + http_base[len("http://"):]
    raise ValueError("BASE_URL must start with http:// or https://")

class Sensor:
    def __init__(self, bus):
        self.bus = bus
        self.device_address = None 
        self.reading_name = "Not Implemented" 
        self.active = True

    def take_single_reading(self):
        raise NotImplementedError("Method must be implemented by subclass")
    
    def activate(self):
        self.active = True

    def deactivate(self):
        self.active = False

class SpectralSensor(Sensor):
    
    def __init__(self, bus):
        super().__init__(bus)
        self.reading_name = "Light Level"
        self.device_address = 0x49

    def read_reg(self, reg_to_read):
        # Check the DEVICE_STATUS_REG (0x00) until it indicates
        # that the write buffer is ready to be written to
        while True:
            status = self.bus.read_byte_data(self.device_address, 0x00)
            #Continue if the write buffer is ready
            if (status & 0b00000010) == 0:
                break
            #Else keep waiting
            else:
                pass
        # When the write buffer is ready, write the value of the register
        # you want to read from into the DEVICE_WRITE_REG (0x01)
        self.bus.write_byte_data(self.device_address, 0x01, reg_to_read)
        # Check the DEVICE_STATUS_REG (0x00) until it indicates
        # that the read buffer contains data
        while True:
            status = self.bus.read_byte_data(self.device_address, 0x00)
            # Continue if the read buffer is ready
            if (status & 0b00000001) == 0x01:
                break
            # Otherwise keep waiting
            else:
                pass
        # When the read buffer is ready, read the value from the
        # DEVICE_READ_REG (0x02)
        value = self.bus.read_byte_data(self.device_address, 0x02)
        return value
    
    def get_calibrated_values(self):
        # Wait for data to arrive into the data registers
        # by checking the DATA_RDY bit of the Control Setup reg
        # Return None if waiting for more than 10 seconds
        start = time.time()
        while True:
            state = self.read_reg(0x04)
            # If the data is ready then break to the next stage
            if (state & 0b00000010) == 0b00000010:
                break
            # Otherwise keep waiting, or quit if waited more than 10s
            else:
                if (time.time() >= (start + 10)):
                    print("Error, no data available. Did you use set_measurement_mode() to tell the device to take a reading?")
                    return
                else:
                    pass      
        
        colour_bytes = []
        for x in range (0x14, 0x2C):
            colour_bytes.append(self.read_reg(x))
        
        v = [colour_bytes[0], colour_bytes[1], colour_bytes[2],\
     colour_bytes[3]]
        b = [colour_bytes[4], colour_bytes[5], colour_bytes[6],\
     colour_bytes[7]]
        g = [colour_bytes[8], colour_bytes[9], colour_bytes[10],\
     colour_bytes[11]]
        y = [colour_bytes[12], colour_bytes[13], colour_bytes[14],\
     colour_bytes[15]]
        o = [colour_bytes[16], colour_bytes[17], colour_bytes[18],\
     colour_bytes[19]]
        r = [colour_bytes[20], colour_bytes[21], colour_bytes[22],\
     colour_bytes[23]]

        calibrated_values = []
        calibrated_values.append(struct.unpack('>f', bytearray(r))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(o))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(y))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(g))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(b))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(v))[0])
        return	calibrated_values

    def take_single_reading(self):
        current_state = self.read_reg(0x04)
        current_state = current_state & 0b11110011
        mode = 0x1000 
        new_state = current_state | mode
        self.bus.write_byte_data(self.device_address, 0x01, (0x04 | 0x80))
        self.bus.write_byte_data(self.device_address, 0x01, new_state)
        readings = self.get_calibrated_values()
        return readings

class SoilSensor(Sensor):
    
    def __init__(self, bus):
        super().__init__(bus)
        self.reading_name = "Moisture"
        self.device_address = 0x48

    def take_single_reading(self):        
        CONFIG_REG = 0x01
        CONV_REG = 0x00
        CONFIG_DATA = [0xC4, 0x83]
        
        write_conf = smbus2.i2c_msg.write(self.device_address, [CONFIG_REG] + CONFIG_DATA)
        self.bus.i2c_rdwr(write_conf)
        time.sleep(0.1)
        
        write_pointer = smbus2.i2c_msg.write(self.device_address, [CONV_REG])
        self.bus.i2c_rdwr(write_pointer)
        
        read_msg = smbus2.i2c_msg.read(self.device_address, 2)
        self.bus.i2c_rdwr(read_msg)
        
        data = list(read_msg)
        value = (data[0] << 8) | data[1]
        return value

class PiSystem:
    def __init__(self, base_url, device_id, pi_key, device_secret, image_path,csv_path,sensors,camera):
        self.base_url = base_url.rstrip("/")
        self.device_id = device_id
        self.pi_key = pi_key
        self.device_secret = device_secret
        self.image_path = image_path
        self._stop = False
        self.ws = None

        self.sensor_interval_sec = 10
        self._sensor_thread_stop = threading.Event()
        self._sensor_thread = None
        
        ws_base = to_ws_url(self.base_url)
        self.ws_url = f"{ws_base}/api/v1/ws/pi?device_id={self.device_id}&es_pi_key={self.pi_key}&device_secret={self.device_secret}"
        self.settings = {"Moisture":[],"Light Level":[]}
        self.csv_path = csv_path
        # self.write_csv(["Bright direct","Low"])
        self.read_csv()
        change_light_level(self.settings["Light Level"],[255,0,0])
        self.sensors = sensors
        self.camera = camera
        print(f"[WS] WebSocket URL: {self.ws_url}")

    def read_csv(self):
        try:
            with open(self.csv_path,newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    self.settings["Moisture"] = row["Moisture"]
                    self.settings["Light Level"] = row["Light Level"]
                    print(f"Settings were initialized to {self.settings}")
        except:
            print("Could not load values from CSV files")

    def write_csv(self,notes):
        with open(self.csv_path,'w',newline='') as csvfile:
            fieldnames = ["Moisture","Light Level"]
            writer = csv.DictWriter(csvfile,fieldnames=fieldnames)
            writer.writeheader()
            writer.writerow({"Moisture" : notes[1], "Light Level" : notes[0]})
    
    def sense_values(self):
        sensor_dict = {}
        for sensor in self.sensors:
            sensor_dict[sensor.reading_name] = sensor.take_single_reading()
        print(sensor_dict)
        return sensor_dict

    def construct_sensor_payload(self, sensor_dict):
        payload = {"type": "sensor_update"}

        for k, v in sensor_dict.items():
            if isinstance(v, float):
                payload[k] = {"status": "ok", "value": v}
            else:
                payload[k] = {"status": "error", "message": f"{k} sensor failure"}

        return payload

    def sensing_protocol(self, ws):
        print(f"[SENSORS] Sensor loop started (every {self.sensor_interval_sec}s)")
        while not self._sensor_thread_stop.is_set():
            try:
                sensor_dict = self.sense_values()
                if sum(sensor_dict["Light Level"]) > 50.0:
                    change_light_level(self.settings["Light Level"],[255,0,0])
                else:
                    change_light_level("Dark",[0,0,0])

                payload = self.construct_sensor_payload(sensor_dict)
                ws.send(json.dumps(payload))
                print(f"[SENSORS] Sent: {payload}")
            except Exception as e:
                print(f"[SENSORS] Send error: {e}")
                return
            self._sensor_thread_stop.wait(self.sensor_interval_sec)
        print("[SENSORS] Sensor loop stopped")

    def upload_image(self, job_id):
        url = f"{self.base_url}/api/v1/pi/upload/{job_id}?device_id={self.device_id}"
        headers = {"ES-Pi-Key": self.pi_key}

        with open(self.image_path, "rb") as f:
            files = {"file": (os.path.basename(self.image_path), f, "image/png")}
            r = requests.post(url, headers=headers, files=files, timeout=120)

        if not r.ok:
            raise RuntimeError(f"Upload failed: {r.status_code} {r.text}")

        print(f"[OK] Uploaded image for job_id={job_id}")
    
    def run_forever(self):
        def handle_sigint(signum, frame):
            print("\n[WS] SIGINT received, shutting down...")
            self.stop()
            sys.exit(0)

        signal.signal(signal.SIGINT, handle_sigint)

        def on_open(ws):
            print(f"[WS] Connected: {self.ws_url}")
            try:
                self._sensor_thread_stop.clear()
                self._sensor_thread = threading.Thread(target=self.sensing_protocol, args=(ws,), daemon=True)
                self._sensor_thread.start()
            except Exception as e:
                print(f"[ERR] Sensor thread error: {e}")

        def on_message(ws, message):
            try:
                data = json.loads(message)
            except Exception:
                return

            if data.get("type") == "capture":
                job_id = data.get("job_id")
                if not job_id:
                    return
                print(f"[WS] Capture command received. job_id={job_id}")
                
                try:
                    camera.take_capture()
                except Exception as e:
                    print(f"[ERR] {e}")

                try:
                    self.upload_image(job_id)
                except Exception as e:
                    print(f"[ERR] {e}")

            elif data.get("type") == "apply instructions":
                instruction_id = data.get("instruction_id")
                job_id = data.get("job_id")
                notes = data.get("notes", [])
                print(f"[WS] Care instructions received for job_id={job_id}.")
                
                try:
                    time.sleep(1)
                    ack = {
                        "type": "instructions applied", 
                        "instruction_id": instruction_id,
                        "job_id": job_id, 
                        "ok": True,
                        "message": "Instructions applied successfully."
                    }
                    
                    print(f"Notes: {notes}") 
                    self.settings["Moisture"] = notes[1]
                    self.settings["Light Level"] = notes[0]
                    self.write_csv(notes)
                    change_light_level(self.settings["Light Level"],[255,0,0])
                    ws.send(json.dumps(ack))
                    print(f"[WS] Acknowledged instructions for job_id={job_id}.")
                except Exception as e:
                    print(f"[ERR] {e}")

        def on_error(ws,error):
            print(f"[WS] Error: {error}")

        def on_close(ws, code, msg):
            print(f"[WS] Closed: code={code} msg={msg}")

            self._sensor_thread_stop.set()
          
        while not self._stop:
            self.ws = websocket.WebSocketApp(
                self.ws_url,
                on_open=on_open,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close,
            )
            wst = threading.Thread(target=self.ws.run_forever)
            wst.start()

    def stop(self):
        self._stop = True
        self._sensor_thread_stop.set()
        if self.ws:
            self.ws.close()


bus = smbus2.SMBus(1)
base_url = "https://embedded-systems-ui.onrender.com"
device_id = "pi-01"
pi_key = "***REMOVED***"
device_secret = "***REMOVED***"
image_path = "sample_plant.png"  
csv_path = "care_settings.csv"
sensors = [SpectralSensor(bus), SoilSensor(bus)] 
camera = Camera((640,480),1.0,400000,image_path)

system = PiSystem(
    base_url=base_url,
    device_id=device_id,
    pi_key=pi_key,
    device_secret=device_secret,
    image_path=image_path,
    csv_path=csv_path,
    sensors=sensors,
    camera=camera,
)

system.run_forever()

