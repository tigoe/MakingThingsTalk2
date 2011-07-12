/*
  Accelerometer reader
 Context: Arduino
 Reads 2 axes of an accelerometer, calculates pitch and roll,
 and sends the values out the serial port
 */

void setup() {
  // initialize serial communication:
  Serial.begin(9600); 
  // tell the microcontroller to read the external 
  // analog reference voltage:
  analogReference(EXTERNAL);
}

void loop() {
  // read the accelerometer axes, and convert
  // the results to acceleration values:
  float xAxis = readAcceleration(analogRead(A0));
  delay(10);
  float yAxis= readAcceleration(analogRead(A1));
  delay(10);
  float zAxis = readAcceleration(analogRead(A2));

  // apply trigonometry to get the pitch and roll:
  float pitch = atan(xAxis/sqrt(pow(yAxis,2) + pow(zAxis,2)));
  float roll = atan(yAxis/sqrt(pow(xAxis,2) + pow(zAxis,2)));   
  pitch = pitch * (180.0/PI);  
  roll = roll * (180.0/PI) ; 

  // print the results:
  Serial.print(pitch);
  Serial.print(",");
  Serial.println(roll);
}

float readAcceleration(int thisAxis) {
  // the accelerometer's zero reading is at half
  // its voltage range:
  float zeroPoint = 1.65;
  // convert the reading into a voltage:
  float voltage = (thisAxis * 3.3 / 1023.0) - zeroPoint;
  // divide by the accelerometer's sensitivity:
  float acceleration = voltage / 0.3;  
  // return the acceleration in g's:
  return acceleration; 
}
