import time
import numpy as np
from PIL import Image
from picamera2 import Picamera2, Preview
from libcamera import controls

class Camera:
    def __init__(self, size, gain, exposure, image_path):
        """
        Initializes the camera with the specified settings and prepares it for capturing images.
        Parameters:
            - size: Tuple specifying the resolution for image capture (width, height).
            - gain: Analog gain setting for the camera (higher values increase brightness but may add noise).
            - exposure: Exposure time in microseconds (longer times allow more light but can cause motion blur).
            - image_path: File path where the captured image will be saved. 
        The camera is configured with the specified settings and started to be ready for capturing images.
        """
        try:
            # Store the image path for later use when saving captured images
            self.image_path = image_path

            # Initialize the Picamera2 instance 
            # Configure it for still image capture with the specified settings
            self.picam2 = Picamera2()
            capture_config = self.picam2.create_still_configuration(main={"size": size})
            self.picam2.configure(capture_config)
        
            self.picam2.start()
            
            # Allow the camera to warm up and apply the settings before capturing images
            time.sleep(1)
            with self.picam2.controls as ctrl:
                ctrl.AnalogueGain = gain
                ctrl.ExposureTime = exposure
                
                ctrl.Saturation = 0.8
                ctrl.Contrast = 0.9
                ctrl.AwbEnable = False
                ctrl.ColourGains = (1, 1) # (Red, Blue)
                
            time.sleep(1) 
            
        except Exception as e:
            print(f"[ERR] Failed to initialize camera: {e}")

    def take_capture(self):
        """
        Captures a single image using the camera with the current settings and saves it to the specified file path.
        The captured image is obtained as a numpy array, converted to a PIL Image, and saved
        """
        try:
            # capture_array() returns a (H, W, 3) RGB numpy array directly
            # No stacking needed; grabbing a single high-quality frame
            frame = self.picam2.capture_array()
            
            # Convert the captured frame (numpy array) to a PIL Image and save it to the specified path
            img = Image.fromarray(frame)
            img.save(self.image_path)
            print(f"[INFO] Image saved to {self.image_path}")
            
        except Exception as e:
            print(f"[ERR] Failed to capture image: {e}")

    def stop(self):
        self.picam2.stop()
