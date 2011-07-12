/*
  I2C accelerometer
 Context: Arduino
 
 Reads a ST Microelectronics LSM303DLH compass and prints 
 the X and Y axis accelerometer output.
 
 created 30 April 2011
 by Tom Igoe
 
 */

// include the necessary libraries:
#include <LSM303DLH.h>
#include <Wire.h>

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
  Serial.print(compass.pitch());     // X axis angle
  Serial.print(",");
  Serial.println(compass.roll());      // Y axis angle
  delay(100); 
}




