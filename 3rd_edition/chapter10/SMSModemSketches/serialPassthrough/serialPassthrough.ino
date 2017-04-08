/*
  SoftwareSerial passthrough
  context: Arduino
*/
#include <SoftwareSerial.h>

const int sim800Tx = 8;              // TX and RX pins for SIM800
const int sim800Rx = 9;
const int sim800Reset = 4;           // reset for SIM800

// make a softwareSerial port on the TX and RX pins:
SoftwareSerial sim800 = SoftwareSerial(sim800Tx, sim800Rx);

void setup() {
  Serial.begin(9600);                // start serial
  sim800.begin(9600);                // start modem serial
  pinMode(sim800Reset, OUTPUT);      // set I/O pins

  digitalWrite(sim800Reset, LOW);    // pulse modem reset pin
  delay(200);
  digitalWrite(sim800Reset, HIGH);
  delay(5000);                       // give the modem time to start
}

void loop() {
  if (Serial.available()) {          // read data from hardware serial
    sim800.write(Serial.read());     // send it to software serial
  }
  if (sim800.available()) {          // read data from software serial
    Serial.write(sim800.read());     // send it to the hardware serial
  }
}
