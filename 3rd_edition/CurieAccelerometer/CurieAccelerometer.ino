

#include "CurieIMU.h"

void setup() {
  Serial.begin(9600); 
  CurieIMU.begin();                 // start accelerometer
  CurieIMU.setAccelerometerRange(2);// set range to 2G
}

void loop() {
  float x, y, z;  // axes

  // read accelerometer:
  CurieIMU.readAccelerometerScaled(x, y, z);
  Serial.print(x);
  Serial.print(",");
  Serial.print(y);
  Serial.print(",");
  Serial.println(z);
}
