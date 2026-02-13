from __future__ import annotations
from dataclasses import dataclass
import time

@dataclass
class ImageData:
    """Data class representing an image stored in memory including its: 
        - content type, 
        - binary data, 
        - the timestamp of when it was last updated.
    """
    content_type: str
    data: bytes
    updated_at: float

class ImageStore:
    def __init__(self):
        self._images = {}

    def set_image(self, job_id, content_type, data):
        self._images[job_id] = ImageData(
            content_type=content_type,
            data=data,
            updated_at=time.time()
        )

    def get_image(self, job_id):
        return self._images.get(job_id)
    
image_store = ImageStore()