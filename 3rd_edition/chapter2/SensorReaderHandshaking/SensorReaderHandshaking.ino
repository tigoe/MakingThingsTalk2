/*
  Sensor Reader Handshaking
  Context: Arduino

  Reads two analog inputs and two digital inputs and outputs
  their values. Waits for response from receiver before sending again.

  Connections:
  analog sensors on analog input pins A0 and A1
  switches on digital I/O pins 4 and 5

*/

#include <SoftwareSerial.h>

const int leftSensor = A0;    // analog input for the left arm
const int rightSensor = A1;   // analog input for tht right arm
const int resetButton = 0;    // digital input for the reset button
const int serveButton = 1;    // digital input for the serve button

int leftReading = 0;          // reading from the left arm
int rightReading = 0;         // reading from the right arm
int resetReading = 0;         // reading from the reset button
int serveReading = 0;         // reading from the serve button

SoftwareSerial mySerial(2, 3);

void setup() {
  // configure the mySerial connection:
  mySerial.begin(9600);
  // configure the digital inputs:
  pinMode(resetButton, INPUT);
  pinMode(serveButton, INPUT);

  while (mySerial.available() <= 0) {
    mySerial.println("hello");   // send a starting message
  }
}

void loop() {
  // check to see whether there is a byte available
  // to read in the mySerial buffer:
  if (mySerial.available() > 0)   {
    // read the mySerial buffer;
    // you don't care about the value of
    // the incoming byte, just that one was
    // sent:
    char inByte = mySerial.read();

    // read the analog sensors:
    leftReading = analogRead(leftSensor);
    rightReading = analogRead(rightSensor);

    // read the digital sensors:
    resetReading = digitalRead(resetButton);
    serveReading = digitalRead(serveButton);

    // print the results:
    mySerial.print(leftReading);
    mySerial.print(",");
    mySerial.print(rightReading);
    mySerial.print(",");
    mySerial.print(resetReading);
    mySerial.print(",");
    // print the last sensor value with a println() so that
    // each set of four readings prints on a line by itself:
    mySerial.println(serveReading);
  }
}

