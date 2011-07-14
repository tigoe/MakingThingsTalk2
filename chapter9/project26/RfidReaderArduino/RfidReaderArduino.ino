/*
 RFID Reader
 Context: Arduino
*/
#include <SoftwareSerial.h>
SoftwareSerial rfid(7,8);

void setup() {
  // begin serial:
  Serial.begin(9600);
  rfid.begin(9600);
}
void loop() {
  // read in from the reader and 
  // write it out to the serial monitor:
  if (rfid.available()) {
    char thisChar = rfid.read();
    Serial.write(thisChar);
  }
}



