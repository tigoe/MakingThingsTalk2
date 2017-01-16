/*
  Sharp GP2xx IR ranger reader
  Context: Arduino
*/
void setup() {
  Serial.begin(9600); // initialize serial communications
}

void loop() {
  int sensorValue = analogRead(A0); // read the sensor value
  // convert to a voltage:
  float voltage = sensorValue * (5.0 / 1024.0);
  // calculate the distance:
  float distance = 21.7 / voltage;
  Serial.print(voltage);
  Serial.print(" V\t");
  Serial.print(distance);
  Serial.println(" cm");
  // wait 39 milliseconds before the next reading
  delay(39);
}
