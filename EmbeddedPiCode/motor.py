#!/usr/bin/python3
import RPi.GPIO as GPIO
import time
 

class Motor:
    def __init__(self, out1, out2, out3, out4, step_sleep):
        self.out1 = out1
        self.out2 = out2
        self.out3 = out3
        self.out4 = out4
        self.step_sleep = step_sleep

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
        GPIO.output( self.out1, GPIO.LOW )
        GPIO.output( self.out2, GPIO.LOW )
        GPIO.output( self.out3, GPIO.LOW )
        GPIO.output( self.out4, GPIO.LOW )
        GPIO.cleanup()
    
    def stop_power(self):
            for pin in [self.out1, self.out2, self.out3, self.out4]:
                GPIO.output(pin, GPIO.LOW)    
    
    def spin_until_moisture(self, check_moisture_func, threshold, max_total_step):
            total_steps = 0
            try:
                while check_moisture_func() < threshold and total_steps < max_total_step:
                    for i in range(500):
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
                    total_steps += 1 
                self.stop_power()
            except Exception as e:
                print(f"[ERR] Motor watering failed: {e}")
                self.stop_power()
    
    def spin_motor(self, step_count): 
        try:
            i = 0
            for i in range(step_count):
                print(f"On step {i}")
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
    step_count = 200
    step_sleep = 0.002
    motor = Motor(out1, out2, out3, out4, step_sleep)
    motor.spin_motor(step_count)
