#include <SoftwareSerial.h>


// using pins 7 and 8 (7 is the Arduino's RX, 8 is TX)
SoftwareSerial rfid(7,8);


void setup() {           
  rfid.begin(19200);     // set up software serial port
  Serial.begin(19200);                // set up serial port
}

void loop() {
 if (Serial.available()) {
  rfid.write(Serial.read());
 } 
 
 if (rfid.available()) {
  Serial.write(rfid.read());
 } 
}


