
/*
  SM130 Firmware reader
  Context: Arduino
*/
#include <Wire.h>

void setup() {
  // initialize serial and I2C:
  Serial.begin(9600);
  Wire.begin();
// give the reader time to reset:
  delay(2000);

  Serial.println("asking for firmware");
  // open the I2C connection, 
   // the I2C address for the reader is 0x42:
  Wire.beginTransmission(0x42);
  Wire.write(0x01);      // length
  Wire.write(0x81);      // command
  Wire.write(0x82);      // checksum
  Wire.endTransmission();
  
  // reader needs 50ms in between responses:
  delay(50);
  Serial.print("getting reply: ");
  // wait for ten bytes back via I2C:
  Wire.requestFrom(0x42,10);
  // don't do anything until new bytes arrive:
  while(!Wire.available()) {
    delay(50);
  }
  // when new bytes arrive on the I2C bus, read them:
  while(Wire.available()) {
    Serial.write(Wire.read());
  }
  // add a newline:
  Serial.println();
}

void loop() {
}


