from __future__ import annotations
from dataclasses import dataclass
import time

@dataclass
class ImageData:
    content_type: str
    data: bytes
    updated_at: float

class ImageStore:
    def __init__(self):
        self._images = {}

    def set_image(self, device_id, content_type, data):
        self._images[device_id] = ImageData(
            content_type=content_type,
            data=data,
            updated_at=time.time()
        )

    def get_image(self, device_id):
        return self._images.get(device_id)
    
image_store = ImageStore()