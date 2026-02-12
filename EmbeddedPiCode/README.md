# Code that runs on the RaspberryPi 
## Classes
### Sensors.py
Contains a base class called Sensors and two derived classes, SpectralSensor and SoilSensor. Each Sensor object contains the following attributes:
- `bus`: used for the smbus2 object to do readwrite transactions
- `device_address`: address used for i2c communications
- `reading_name`: used to identify the sensor type
- `min_value`: minimum sensor reading
- `max_value`: maximum sensor reading
The sensor objects also contain the following methods:
- `scale_reading(self, x)`: uses the min and max value to scale the sensor output into a 0-100 range for display on the frontend
- `take_single_reading(self)`: wrapper for `take_unscaled_reading(self)` so that we can iterate through an array of different sensors to get all their values
- `take_unscaled_reading(self)`: virtual method overriden by all derived classes to implement the sensors specfic i2c communication protocol for a single reading
### Camera.py
Contains a single class called Camera
