#!/usr/bin/python3
import RPi.GPIO as GPIO
import time

class Motor:
    def __init__(self, out1, out2, out3, out4, step_sleep):
        """
        Initializes the Motor object with the specified GPIO pins for controlling the stepper motor and the sleep time between steps.
        """
        # Store the GPIO pin numbers and step sleep time for later use in controlling the motor
        self.out1 = out1
        self.out2 = out2
        self.out3 = out3
        self.out4 = out4
        self.step_sleep = step_sleep

        # Set up the GPIO pins for output and initialize them to LOW to ensure the motor is not powered on startup
        GPIO.setmode( GPIO.BCM )
        GPIO.setup( out1, GPIO.OUT )
        GPIO.setup( out2, GPIO.OUT )
        GPIO.setup( out3, GPIO.OUT )
        GPIO.setup( out4, GPIO.OUT )
         
        GPIO.output( out1, GPIO.LOW )
        GPIO.output( out2, GPIO.LOW )
        GPIO.output( out3, GPIO.LOW )
        GPIO.output( out4, GPIO.LOW )
 
    def cleanup(self):
        """
        Cleans up the GPIO settings by setting all motor control pins to LOW and calling GPIO.cleanup().
        """
        GPIO.output( self.out1, GPIO.LOW )
        GPIO.output( self.out2, GPIO.LOW )
        GPIO.output( self.out3, GPIO.LOW )
        GPIO.output( self.out4, GPIO.LOW )
        GPIO.cleanup()
    
    def stop_power(self):
        """
        Stops power to the motor by setting all control pins to LOW.
        """
        for pin in [self.out1, self.out2, self.out3, self.out4]:
            GPIO.output(pin, GPIO.LOW)    
    
    def spin_until_moisture(self, check_moisture_func, threshold):
        """
        Spins the motor in a sequence of steps until the moisture level, as determined by the provided check_moisture_func, reaches or exceeds the specified threshold.
        """
        try:
            # Continuously check the moisture level
            while check_moisture_func() < threshold:
                # Pump water for 500 steps, then check moisture again
                for i in range(500):
                    # Determine the motor state based on the current step index and set the GPIO outputs accordingly to create the stepping sequence
                    state_index = i % 4
                    if state_index == 0:
                        GPIO.output(self.out1, GPIO.HIGH); GPIO.output(self.out2, GPIO.LOW)
                        GPIO.output(self.out3, GPIO.LOW);  GPIO.output(self.out4, GPIO.LOW)
                    elif state_index == 1:
                        GPIO.output(self.out1, GPIO.LOW);  GPIO.output(self.out2, GPIO.LOW)
                        GPIO.output(self.out3, GPIO.HIGH); GPIO.output(self.out4, GPIO.LOW)
                    elif state_index == 2:
                        GPIO.output(self.out1, GPIO.LOW);  GPIO.output(self.out2, GPIO.HIGH)
                        GPIO.output(self.out3, GPIO.LOW);  GPIO.output(self.out4, GPIO.LOW)
                    elif state_index == 3:
                        GPIO.output(self.out1, GPIO.LOW);  GPIO.output(self.out2, GPIO.LOW)
                        GPIO.output(self.out3, GPIO.LOW);  GPIO.output(self.out4, GPIO.HIGH)
                    
                    time.sleep(self.step_sleep)
                
                print(f"[MOTOR] 500 steps finished. Current moisture: {check_moisture_func()}%")
            self.stop_power()
        except Exception as e:
            print(f"[ERR] Motor watering failed: {e}")
            self.stop_power()
    
    def spin_motor(self, step_count): 
        """
        Spins the motor for a specified number of steps by iterating through a stepping sequence and controlling the GPIO outputs.
        """
        try:
            i = 0
            for i in range(step_count):
                print(f"On step {i}")
                # Determine the motor state based on the current step index and set the GPIO outputs accordingly to create the stepping sequence
                if i%4==0:
                    GPIO.output( self.out1, GPIO.HIGH )
                    GPIO.output( self.out2, GPIO.LOW )
                    GPIO.output( self.out3, GPIO.LOW )
                    GPIO.output( self.out4, GPIO.LOW )
                elif i%4==1:
                    GPIO.output( self.out1, GPIO.LOW )
                    GPIO.output( self.out2, GPIO.LOW )
                    GPIO.output( self.out3, GPIO.HIGH )
                    GPIO.output( self.out4, GPIO.LOW )
                elif i%4==2:
                    GPIO.output( self.out1, GPIO.LOW )
                    GPIO.output( self.out2, GPIO.HIGH )
                    GPIO.output( self.out3, GPIO.LOW )
                    GPIO.output( self.out4, GPIO.LOW )
                elif i%4==3:
                    GPIO.output( self.out1, GPIO.LOW )
                    GPIO.output( self.out2, GPIO.LOW )
                    GPIO.output( self.out3, GPIO.LOW )
                    GPIO.output( self.out4, GPIO.HIGH )

                time.sleep( self.step_sleep )
            self.stop_power()
        except KeyboardInterrupt:
            self.stop_power()

if __name__ == "__main__":
    out1 = 10 
    out2 = 24
    out3 = 23
    out4 = 22
    step_count = 100000
    step_sleep = 0.002
    motor = Motor(out1, out2, out3, out4, step_sleep)
    motor.spin_motor(step_count)
