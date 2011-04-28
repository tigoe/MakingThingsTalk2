/*
  I2C accelerometer
 Language: Arduino
 
 Reads a ST Microelectronics LSM303DLH compass and prints 
 the X and Y axis accelerometer output.
 
 Uses a fork of the LSM303DLH library by Ryan Mulligan, available at
 https://github.com/tigoe/LSM303DLH/
 
 */

// include the necessary libraries:
#include <LSM303DLH.h>

// initialize the compass:
LSM303DLH compass;

void setup() {
  // initialize serial and Wire, and enable the compass:
  Serial.begin(9600);
  Wire.begin();
  compass.enable();

  // calibrate for the first five seconds after startup:
  while (millis() < 5000) {
    compass.calibrate(); 
  }
}

void loop() {
  // read the compass and print the accelerometer
  // X and Y readings:
  compass.read();
  Serial.print(compass.pitch());  // X axis
  Serial.print(",");
  Serial.println(compass.roll());       // Y axis
  delay(100); 
}




