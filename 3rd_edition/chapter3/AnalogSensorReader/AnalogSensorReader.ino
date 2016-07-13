/*
   Analog sensor reader
   Context: Arduino

   Reads an analog input on Analog in 0, prints the result
   as an ASCII-formatted  decimal value.

   Connections: 
      FSR analog sensors on Analog in 0
*/
//#include <SoftwareSerial.h>
//
//SoftwareSerial mySerial(10, 9); // RX, TX for ATTiny84

void setup() {
  // start serial port at 9600 bps:
  Serial.begin(9600);
}

void loop() {
  // read analog input:
  int sensorValue = analogRead(A0); 

  // send analog value out in ASCII decimal format:
  Serial.println(sensorValue);
  delay(10);
}

