/*
  LSM303 accelerometer reader/ L3G gyro reader
  Context: Arduino
  Reads an LSM303 accelerometer's values
  and an L3G gyro's values
*/
#include <Wire.h>
#include <LSM303.h>
#include <L3G.h>

LSM303 accelerometer;
L3G gyro;

void setup() {
  Serial.begin(9600);   // begin serial communication
  Wire.begin();         // initialize I2C
  accelerometer.init(); // initialize acclerometer
  accelerometer.enableDefault(); // enable default range (+/- 2g)
  gyro.init();          // initialize gyro
  gyro.enableDefault(); // enable default range (+/- 250dps)
}

void loop() {
  accelerometer.read(); // read accelerometer
  gyro.read();          // read gyro

  // convert accelerometer readings to g's:
  float x = readAcceleration(accelerometer.a.x);
  float y = readAcceleration(accelerometer.a.y);
  float z = readAcceleration(accelerometer.a.z);
  
   // convert gyro readings to degrees per second:
  float gx = readGyro(gyro.g.x);
  float gy = readGyro(gyro.g.y);
  float gz = readGyro(gyro.g.z);
}

float readAcceleration(int rawValue) {
  // LSM303 accelerometer has a +/- 2g range
  // and a 16-bit resolution:
  float result = (rawValue * 2.0) / 32768.0;
  return result;
}


float readGyro(int rawValue) {
  // L3G gyro has a +/- 250 dps range
  // a 16-bit resolution:
  float result = (rawValue * 250.0) / 32768.0;
  return result;
}
