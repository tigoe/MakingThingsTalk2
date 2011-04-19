/*
  Sharp GP2D12 IR ranger reader
  Language: Wiring/Arduino
  
  Reads the value from a Sharp GP2D12 IR ranger and sends 
  it out serially.
*/
void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600); 
}

void loop() {
  int sensorValue = analogRead(A0); // read the pot value

  // the sensor actually gives results that aren't linear.
  // this formula converts the results to a linear range.
 // int range = (6787 / (sensorValue - 3)) - 4;
  
  // print the sensor value     
  Serial.print(sensorValue);  
 Serial.println(" cm"); 
  // wait 10 milliseconds before the next reading 
  delay(10);                    
}
