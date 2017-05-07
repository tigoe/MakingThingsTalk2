/*
  SIM80 GSM modem SMS sender
  context: Arduino
*/
#include <SoftwareSerial.h>           // include softwareSerial library

const int sim800Tx = 8;               // TX and RX pins for SIM800
const int sim800Rx = 9;
const int sim800Reset = 4;            // reset for SIM800
const int pushButton = 5;             // pushbutton
int lastButtonState = HIGH;           // previous button state
String phoneNum = "+15555556666";     // number to text

// make a softwareSerial port on the TX and RX pins:
SoftwareSerial sim800 = SoftwareSerial(sim800Tx, sim800Rx);

void setup() {
  Serial.begin(9600);                 // start serial
  sim800.begin(9600);                 // start modem serial
  pinMode(sim800Reset, OUTPUT);       // set I/O pins
  pinMode (pushButton, INPUT_PULLUP);

  digitalWrite(sim800Reset, LOW);    // pulse modem reset pin
  delay(200);
  digitalWrite(sim800Reset, HIGH);
  delay(5000);                       // give the modem time to start

  while (!sim800.find("OK")) {       // send initial "AT"
    sim800.println("AT");
  }
  Serial.println("GSM modem ready");
}

void loop() {
  // read pushbutton:
  int buttonState = digitalRead(pushButton);
  if (buttonState != lastButtonState) {            // if it’s changed,
    delay(100);                                    // debounce delay
    if (buttonState == LOW) {                      // and it’s pushed,
      int reading = analogRead(A4);                // read analog input
      String sensorReading = "{\"Sensor\":X}";     // make JSON format
      sensorReading.replace("X", String(reading)); // add sensor value

      Serial.println("sending...");                // send an SMS
      int result = sendSMS(phoneNum, sensorReading);
      Serial.println(result);                      // 1 = success
    }
  }
  lastButtonState = buttonState;                   // save for next loop
}

// sends an SMS message using the modem:
int sendSMS(String phoneNumber, String message) {
  sim800.println("AT+CMGF=1");      // set message format
  if (!sim800.find("OK")) {         // if you don’t get OK
    return -2;                      // return error
  }
  sim800.print("AT+CMGS=\"");       // start message
  sim800.print(phoneNumber);        // add phone number
  sim800.println("\",145");         // add message format (from datasheet)
  if (!sim800.find(">")) {          // if you don’t get >
    return -1;                      // return error
  }
  sim800.print(message);            // add body of message
  sim800.write(0x1A);               // control-Z ends and sends message
  return 1;                         // return success!
}
