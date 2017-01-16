/*
  Accelerometer orientation
  context: Arduino

  Determines which face is up,
  using an accelerometer.
  Can be used with any accelerometer, though Arduino 101 is shown 
  Turn accelerometer so that all six faces are up in
  order to see all possible values
*/
// includes & globals for LSM303:
#include <Wire.h>
#include <LSM303.h>
LSM303 sensor;

void setup() {
  // setup for LSM303:
  Serial.begin(9600);   // begin serial communication
  Wire.begin();         // initialize I2C
  sensor.init();        // initialize LSM303 sensor
  // enable default range (+/- 2g range):
  sensor.enableDefault();
}

void loop() {
  float x, y, z;
  // read for LSM303:
  sensor.read();
  x = sensor.a.x;
  y = sensor.a.y;
  z = sensor.a.z;
  int orientation = readOrientation(x, y, z);
  Serial.println(orientation);
}

int readOrientation(float x, float y, float z) {
  int result = -1;    // result to return orientation
  int absX = abs(x);  // absolute values of sensor readings
  int absY = abs(y);
  int absZ = abs(z);

  // determine which axis had the greatest magnitude:
  int bigger = max(absX, absY);
  int biggest = max(bigger, absZ);

  if (biggest == absX) {  // if x axis is greatest
    if (x > 0) {          // positive x is up
      result = 1;
    } else {              // negative x is up
      result = 2;
    }
  }
  if (biggest == absY) {  // if y axis is greatest
    if (y > 0) {          // positive y is up
      result = 3;
    } else {
      result = 4;         // negative y is up
    }
  }
  if (biggest == absZ) {  // if z axis is greatest
    if (z > 0) {
      result = 5;         // positive z is up
    } else {
      result = 6;         // negative z is up
    }
  }
  return result;
}
