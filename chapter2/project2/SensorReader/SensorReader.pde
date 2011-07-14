/* 
 Sensor Reader
 Context: Arduino
 
 Reads two analog inputs and two digital inputs and outputs 
 their values.
 
 Connections:  
 analog sensors on analog input pins 0 and 1
 switches on digital I/O pins 2 and 3
 
 
 */

const int leftSensor = 0;    // analog input for the left arm
const int rightSensor = 1;   // analog input for tht right arm
const int resetButton = 2;   // digital input for the reset button
const int serveButton = 3;   // digital input for the serve button

int leftValue = 0;           // reading from the left arm
int rightValue = 0;          // reading from the right arm
int reset = 0;               // reading from the reset button
int serve = 0;               // reading from the serve button

void setup() {
  // configure the serial connection:
  Serial.begin(9600);
  // configure the digital inputs:
  pinMode(resetButton, INPUT);
  pinMode(serveButton, INPUT);
}

void loop() {
  // read the analog sensors:
  leftValue = analogRead(leftSensor);
  rightValue = analogRead(rightSensor);

  // read the digital sensors:
  reset = digitalRead(resetButton);
  serve = digitalRead(serveButton);

  // print the results:
  Serial.print(leftValue, DEC);
  Serial.print(",");
  Serial.print(rightValue, DEC);
  Serial.print(",");
  Serial.print(reset, DEC);
  Serial.print(",");
  // print the last sensor value with a println() so that
  // each set of four readings prints on a line by itself:
  Serial.println(serve, DEC);
}

