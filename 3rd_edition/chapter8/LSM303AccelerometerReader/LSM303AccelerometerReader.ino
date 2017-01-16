/*
  Accelerometer reader
  Context: Arduino
  Reads an LSM303 accelerometer's values
*/
#include <Wire.h>
#include <LSM303.h>

LSM303 accelerometer;

void setup() {
  Serial.begin(9600);   // begin serial communication
  Wire.begin();         // initialize I2C
  accelerometer.init(); // initialize sensor
  // enable default range (+/- 2g range): 
  accelerometer.enableDefault();
}

void loop() {
  accelerometer.read();
  
  // convert to accelerations:
  float x = readAcceleration(accelerometer.a.x);
  float y = readAcceleration(accelerometer.a.y);
  float z = readAcceleration(accelerometer.a.z);
}

float readAcceleration(int rawValue) {
  // LSM303 accelerometer has a +/- 2g range
  // and a -32768 to +32767 output:
  float result = (rawValue * 2.0) / 32768.0;
  return result;
}

