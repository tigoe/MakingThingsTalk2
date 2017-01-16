/*
  LSM303 compass example
  context: Arduino
*/
#include <Wire.h>
#include <LSM303.h>

LSM303 compass;       // an instance of the sensor library

void setup() {
  Serial.begin(9600);       // start serial communication
  Wire.begin();             // start I2C communication
  compass.init();           // initialize the compass
  compass.enableDefault();  // enable defaults on the compass
}

void loop() {
  compass.read();                       // read the compass
  float myHeading = compass.heading();  // get the heading
  Serial.println(myHeading);            // print it
  delay(100);                           // wait 100ms
}

