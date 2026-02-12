import neopixel
import board

class Leds:
    def __init__(self, pixel_pin, num_pixels):
        self.pixel_pin = pixel_pin
        self.num_pixels = num_pixels
        self.brightness = 0
        self.pixels = neopixel.NeoPixel(
            self.pixel_pin,
            self.num_pixels,
            brightness=self.brightness,
            auto_write=False
        )

    def change_brightness(self, brightness, color):
        print(f"Changing brightness to {brightness}, with color {color}")
        self.brightness = brightness
        self.pixels.brightness = self.brightness
        self.pixels.fill(color)
        self.pixels.show()

if __name__ == "__main__":
    PIXEL_PIN = board.D12
    NUM_PIXELS = 64
    BRIGHTNESS = 0.01
    leds = Leds(PIXEL_PIN,NUM_PIXELS)
    leds.change_brightness(0, (255,255,255))

