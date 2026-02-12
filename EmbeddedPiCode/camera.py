import time
import numpy as np
from PIL import Image
from picamera2 import Picamera2, Preview
from libcamera import controls

class Camera:
    def __init__(self, size, gain, exposure, image_path):
        try:
            self.image_path = image_path
            self.picam2 = Picamera2()
            
            capture_config = self.picam2.create_still_configuration(main={"size": size})
            self.picam2.configure(capture_config)
            
            self.picam2.start()
            
            time.sleep(1)
            with self.picam2.controls as ctrl:
                ctrl.AnalogueGain = gain
                ctrl.ExposureTime = exposure
                
                ctrl.Saturation = 0.8
                
                ctrl.Contrast = 0.9
                ctrl.AwbEnable = False
                ctrl.ColourGains = (1, 1) # (Red, Blue) - adjust these slowly
                
            time.sleep(1) 
            
        except Exception as e:
            print(f"[ERR] Failed to initialize camera: {e}")

    def take_capture(self):
        try:
            # capture_array() returns a (H, W, 3) RGB numpy array directly
            # No stacking needed; grabbing a single high-quality frame
            frame = self.picam2.capture_array()
            
            img = Image.fromarray(frame)
            img.save(self.image_path)
            print(f"[INFO] Image saved to {self.image_path}")
            
        except Exception as e:
            print(f"[ERR] Failed to capture image: {e}")

    def stop(self):
        self.picam2.stop()
