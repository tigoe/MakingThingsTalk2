/*
  CurieIMU reader
  Context: Arduino
  Reads the Arduino 101 IMU's scaled values
*/
#include "CurieIMU.h"

void setup() {
  Serial.begin(9600); // begin serial communication
  CurieIMU.begin();  // intialize the IMU

  // set the accelerometer range to +/-2g:
  CurieIMU.setAccelerometerRange(2);
  // set the gyro range to 250 dps:
  CurieIMU.setGyroRange(250);
}

void loop() {
  float x, y, z;  // variables for the scaled accelerometer values
  float gx, gy, gz; // variables for the scaled gyro values
  // read and scale:
  CurieIMU.readAccelerometerScaled(x, y, z);
  CurieIMU.readGyroScaled(gx, gy, gz);
}

