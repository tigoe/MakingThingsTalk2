/*
  Sharp GP2xx IR ranger reader
 Context: Arduino
 
 Reads the value from a Sharp GP2Y0A21 IR ranger and sends 
 it out serially.
 */
void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600); 
}

void loop() {
  int sensorValue = analogRead(A0); // read the sensor value
  // convert to a voltage:
  float voltage = map(sensorValue, 0, 5, 0, 1023);

  // the sensor actually gives results that aren't linear.
  // This formula is derived from the datasheet's graph
  // of voltage over 1/distance. The slope of that line 
  // is approximately 27:
  float distance = 27.0 /voltage;

  // print the sensor value     
  Serial.print(distance);  
  Serial.println(" cm"); 
  // wait 10 milliseconds before the next reading 
  delay(10);                    
}


