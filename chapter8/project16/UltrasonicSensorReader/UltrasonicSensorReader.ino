/*
  Maxbotix LV-EZ1 ultrasonic ranger reader
 Context: Arduino
 
 Reads the value from a Maxbotix LV-EZ1 ultrasonic ranger 
 and sends the result out serially.
 */
void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600); 
}

void loop() {
  // read the sensor value and convert to a voltage:
  int sensorValue = analogRead(A0); 
  float voltage = map(sensorValue, 0, 5, 0, 1023);

  // the sensor's output is about 9.8mV per inch,
  // so multiply by 2.54 to get it in centimeters:
  float distance = voltage * 2.54  / 0.0098;

  // print the sensor value     
  Serial.print(distance);  
  Serial.println(" cm"); 
  // wait 50 milliseconds before the next reading
  // so the sensor can stabilize: 
  delay(50);                    
}




