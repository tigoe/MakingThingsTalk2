/*
  Accelerometer reader
  Language: Arduino
  Reads 2 axes of an accelerometer and sends the values 
  out the serial port
*/
void setup() {
  // open serial port:
  Serial.begin(9600);
  // use pins A0 and A4 as digital output pins
  // to power the accelerometer:
  pinMode(A0, OUTPUT);
  pinMode(A4, OUTPUT);
  digitalWrite(A0, LOW);  // accelerometer ground
  digitalWrite(A4, HIGH); // accelerometer power
}

void loop() {
  // read 2 channels of the accelerometer:
  int pitch = analogRead(A3);  // X axis
  Serial.print(pitch);
  Serial.print(",");
  int roll = analogRead(A2);   // Y axis
  Serial.println(roll);
}
