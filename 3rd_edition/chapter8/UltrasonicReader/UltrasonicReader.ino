/*
  Ultrasonic sensor reader
  context: Arduino
*/
const int triggerPin = 4;
const int echoPin = 3;

void setup() {
  // set pin states and initialize serial communications:
  pinMode(triggerPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {

  digitalWrite(triggerPin, HIGH); // pulse the trigger pin HIGH
  delayMicroseconds(10);          // for 10 microseconds
  digitalWrite(triggerPin, LOW);  // to start the sensor
  // measure a pulse on the echo pin in microseconds:
  long pulsewidth = pulseIn(echoPin, HIGH);
  float distance = pulsewidth / 58.0;       // cm = microseconds/58
  Serial.println(distance);
}
