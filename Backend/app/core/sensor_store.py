from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, Dict
import time

@dataclass
class SensorValue:
    status: str  # "ok", "error", "loading"
    updated_at: int = field(default_factory=lambda: int(time.time() * 1000))
    value: Optional[float] = None
    message: Optional[str] = None

    def to_dict(self):
        return {
            "status": self.status,
            "updatedAt": self.updated_at,
            "value": self.value,
            "message": self.message
        }

@dataclass
class SensorReading:
    device_id: str
    water: SensorValue
    light: SensorValue

    def to_dict(self):
        return {
            "device_id": self.device_id,
            "water": self.water.to_dict(),
            "light": self.light.to_dict()
        }

class SensorStore:
    def __init__(self):
        self._latest_readings = {}

    def set_latest(self, device_id, water, light):
        self._latest_readings[device_id] = SensorReading(
            device_id=device_id,
            water=water,
            light=light
        )

    def get_latest(self, device_id):
        return self._latest_readings.get(device_id)
    
sensor_store = SensorStore()
