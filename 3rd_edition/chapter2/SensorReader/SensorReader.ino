/* 
 Sensor Reader
 Context: Arduino
 
 Reads two analog inputs and two digital inputs and outputs 
 their values.
 
 Connections:  
 analog sensors on analog input pins A0 and A1
 switches on digital I/O pins 4 and 5

 */

const int leftSensor = A0;    // analog input for the left arm
const int rightSensor = A1;   // analog input for tht right arm
const int resetButton = 4;    // digital input for the reset button
const int serveButton = 5;    // digital input for the serve button

int leftReading = 0;          // reading from the left arm
int rightReading = 0;         // reading from the right arm
int resetReading = 0;         // reading from the reset button
int serveReading = 0;         // reading from the serve button

void setup() {
  // configure the serial connection:
  Serial.begin(9600);
  // configure the digital inputs:
  pinMode(resetButton, INPUT);
  pinMode(serveButton, INPUT);
}

void loop() {
  // read the analog sensors:
  leftReading = analogRead(leftSensor);
  rightReading = analogRead(rightSensor);

  // read the digital sensors:
  resetReading = digitalRead(resetButton);
  serveReading = digitalRead(serveButton);

  // print the results:
  Serial.print(leftReading);
  Serial.print(",");
  Serial.print(rightReading);
  Serial.print(",");
  Serial.print(resetReading);
  Serial.print(",");
  // print the last sensor value with a println() so that
  // each set of four readings prints on a line by itself:
  Serial.println(serveReading);
}

