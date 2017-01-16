/*
  LSM303 calibration sketch
  context: Arduino

  To increase the accuracy of the compass, you can set the expected
  minimum and maximum values for each axis to the actual maxima 
  and minima that you read in your location. The calibrate function
  below does this. First the resetCalibration() function sets the 
  expected maxima and minima to their opposite values, so that 
  the calibrate() routine can set them to the highest 
  or lowest possible actual values. Then the calibrate() function
  continually updates the maxima and minima with the highest
  or lowest read values, as appropriate.

  To use this, rotate the compass slowly through all three axes. 
  The sketch will print out the highest and lowest read values, that
  you can then use in other sketches to set the expected maxima and minima.
 */

#include <Wire.h>
#include <LSM303.h>

LSM303 compass;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  compass.init();
  compass.enableDefault();
  resetCalibration();       // reset compass limits
  calibrate();              // calibrate
}

void loop() {
  compass.read();
  calibrate();
  // print mins and maxes:
  Serial.print(compass.m_min.x);
  Serial.print("\t");
  Serial.print(compass.m_min.y);
  Serial.print("\t");
  Serial.print(compass.m_min.z);
  Serial.print("\t");
  Serial.print(compass.m_max.x);
  Serial.print("\t");
  Serial.print(compass.m_max.y);
  Serial.print("\t");
  Serial.println(compass.m_max.z);
  // print heading:
  Serial.println(compass.heading());
  delay(100);
}

void resetCalibration() {
  // set limits opposite, so that calibrate() routine
  // can set them to the highest or lowest possible
  // actual values:
  compass.m_min.x = 32767;
  compass.m_min.y = 32767;
  compass.m_min.z = 32767;
  compass.m_max.x = -32768;
  compass.m_max.y = -32768;
  compass.m_max.z = -32768;
}
void calibrate() {
  // set new mins with the lowest actual reading on each axis:
  compass.m_min.x = min(compass.m_min.x, compass.m.x);
  compass.m_min.y = min(compass.m_min.y, compass.m.y);
  compass.m_min.z = min(compass.m_min.z, compass.m.z);

  // set new maxes with the highest actual reading on each axis:
  compass.m_max.x = max(compass.m_max.x, compass.m.x);
  compass.m_max.y = max(compass.m_max.y, compass.m.y);
  compass.m_max.z = max(compass.m_max.z, compass.m.z);
}

