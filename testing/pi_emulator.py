import os
import json
import time
import requests
import websocket 
import signal 
import sys

def to_ws_url(http_base):
    if http_base.startswith("https://"):
        return "wss://" + http_base[len("https://"):]
    if http_base.startswith("http://"):
        return "ws://" + http_base[len("http://"):]
    raise ValueError("BASE_URL must start with http:// or https://")

class PiEmulator:
    def __init__(self, base_url, device_id, pi_key, device_secret, image_path):
        self.base_url = base_url.rstrip("/")
        self.device_id = device_id
        self.pi_key = pi_key
        self.device_secret = device_secret
        self.image_path = image_path
        self._stop = False

        ws_base = to_ws_url(self.base_url)
        self.ws_url = f"{ws_base}/api/v1/ws/pi?device_id={self.device_id}&es_pi_key={self.pi_key}&device_secret={self.device_secret}"

    def upload_image(self, job_id):
        url = f"{self.base_url}/api/v1/pi/upload/{job_id}?device_id={self.device_id}"
        headers = {"ES-Pi-Key": self.pi_key}

        with open(self.image_path, "rb") as f:
            files = {"file": (os.path.basename(self.image_path), f, "image/jpeg")}
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

        def on_open():
            print(f"[WS] Connected: {self.ws_url}")

        def on_message(message):
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
                    time.sleep(1)
                    self.upload_image(job_id)
                except Exception as e:
                    print(f"[ERR] {e}")

        def on_error(error):
            print(f"[WS] Error: {error}")

        def on_close(code, msg):
            print(f"[WS] Closed: code={code} msg={msg}")

        while not self._stop:
            self.ws = websocket.WebSocketApp(
                self.ws_url,
                on_open=on_open,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close,
            )
            self.ws.run_forever(ping_interval=25, ping_timeout=10)

    def stop(self):
        self._stop = True
        if self.ws:
            self.ws.close()

base_url = "https://embedded-systems-ui.onrender.com"
device_id = "pi-01"
pi_key = "***REMOVED***"
device_secret = "***REMOVED***"
image_path = "sample_plant.png"  

emu = PiEmulator(
    base_url=base_url,
    device_id=device_id,
    pi_key=pi_key,
    device_secret=device_secret,
    image_path=image_path,
)
emu.run_forever()