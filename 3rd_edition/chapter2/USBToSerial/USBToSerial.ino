/*
  USB-to-serial adapter
  Context: Arduino

  Turns a USB-native Arduino into a USB-to-serial adapter. Any
  data coming in the native USB COM port will be sent out the
  Serial1 TX pin, and anything coming in the Serial1 RX pin will
  be sent out the native USB COM port.

  created 14 Mar 2016
  by Tom Igoe
*/
void setup() {
  Serial.begin(9600); // init USB Native serial
  Serial1.begin(9600);// init TX/RX serial
}

void loop() {
  // read from RX, send to USB:
  if (Serial1.available()) {
    char c = Serial1.read();
    Serial.write(c);
  }
  // read from USB, send to TX:
  if (Serial.available()) {
    char c = Serial.read();
    Serial1.write(c);
  }
}
