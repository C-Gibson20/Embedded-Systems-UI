import time
import struct
import smbus2

class Sensor:
    def __init__(self, bus):
        """
        Initializes the Sensor object with the specified I2C bus for communication with the sensor device.
        """
        self.bus = bus
        self.device_address = None 
        self.reading_name = "Not Implemented" 
        self.min_value = 0
        self.max_value = 0

    def scale_reading(self, x):
        """
        Scales the raw sensor reading x to a percentage value between 0 and 100 based on the defined minimum and maximum values for the sensor.
        """
        return (x-self.min_value)/(self.max_value-self.min_value)*100
    
    def take_single_reading(self):
        """
        Takes a single reading from the sensor by first obtaining the raw unscaled reading and then scaling it to a percentage value.
        """
        unscaled_reading = self.take_unscaled_reading()
        print(f"Unscaled reading: {unscaled_reading}")
        return self.scale_reading(unscaled_reading) 
    
    def take_unscaled_reading(self):
        """
        This method should be implemented by subclasses to interact with the specific sensor hardware and return the raw reading value.
        """
        raise NotImplementedError

class SpectralSensor(Sensor):
    
    def __init__(self, bus):
        """
        Initializes the SpectralSensor object with the specified I2C bus.
        Sets up properties specific to the spectral sensor, such as the device address and reading name.
        """
        super().__init__(bus)
        self.reading_name = "light"
        self.device_address = 0x49
        self.min_value = 0
        self.max_value = 1000 

    def read_reg(self, reg_to_read):
        """
        Reads a byte from the specified register of the spectral sensor.
        """
        # Check the DEVICE_STATUS_REG (0x00) until it indicates
        # that the write buffer is ready to be written to
        while True:
            status = self.bus.read_byte_data(self.device_address, 0x00)
            # Continue if the write buffer is ready
            if (status & 0b00000010) == 0:
                break
            # Else keep waiting
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
        """
        Retrieves the calibrated spectral values from the sensor by reading the appropriate registers and processing the data.
        """
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
        
        # The sensor returns 6 calibrated values (R, O, Y, G, B, V) as 4 bytes each in the data registers.
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

        # Convert the byte data for each color channel into floating point values using struct.unpack
        # Return them as a list of calibrated values.
        calibrated_values = []
        calibrated_values.append(struct.unpack('>f', bytearray(r))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(o))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(y))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(g))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(b))[0])
        calibrated_values.append(struct.unpack('>f', bytearray(v))[0])
        return	calibrated_values

    def take_unscaled_reading(self):
        """
        Takes an unscaled reading from the spectral sensor.
        """
        # Check the current state of the sensor
        current_state = self.read_reg(0x04)
        current_state = current_state & 0b11110011
        mode = 0x1000 

        # Set the measurement mode by writing to the control register
        new_state = current_state | mode
        self.bus.write_byte_data(self.device_address, 0x01, (0x04 | 0x80))
        self.bus.write_byte_data(self.device_address, 0x01, new_state)

        # After setting the measurement mode, wait for the data to be ready and then read the calibrated values
        readings = self.get_calibrated_values()

        # Sum readings for a value of overall light intensity
        return sum(readings)

class SoilSensor(Sensor):
    
    def __init__(self, bus):
        """
        Initializes the SoilSensor object with the specified I2C bus.
        Sets up properties specific to the soil sensor, such as the device address and reading name.
        """
        super().__init__(bus)
        self.reading_name = "water"
        self.device_address = 0x48
        self.min_value = 0 
        self.max_value = 12000

    def take_unscaled_reading(self):   
        """
        Takes an unscaled reading from the soil sensor by communicating with the sensor over I2C to retrieve the raw value.
        """   
        # Configuration data for a single reading  
        CONFIG_REG = 0x01
        CONV_REG = 0x00
        CONFIG_DATA = [0xC4, 0x83]
        
        # Write the configuration data to the sensor to set it up for a single reading
        write_conf = smbus2.i2c_msg.write(self.device_address, [CONFIG_REG] + CONFIG_DATA)
        self.bus.i2c_rdwr(write_conf)
        time.sleep(0.1)
        
        # After configuring the sensor, read the raw value from the conversion register
        write_pointer = smbus2.i2c_msg.write(self.device_address, [CONV_REG])
        self.bus.i2c_rdwr(write_pointer)
        
        read_msg = smbus2.i2c_msg.read(self.device_address, 2)
        self.bus.i2c_rdwr(read_msg)
        
        # The raw reading is obtained as two bytes, which are combined to form a single integer value representing the sensor reading. 
        # The value is inverted (since higher moisture corresponds to lower raw values) and returned.
        data = list(read_msg)
        value = (data[0] << 8) | data[1]
        return 32767-value


