/*
  Accelerometer reader
 Language: Arduino
 Reads 2 axes of an accelerometer, calculates pitch and roll,
 and sends the values out the serial port
 */

int xMax, xMin;    // maxima and minima for x axis acceleration
int yMax, yMin;    // maxima and minima for y axis acceleration

void setup() {
  // open serial port:
  Serial.begin(9600);
  // use pins A0 and A4 as digital output pins
  // to power the accelerometer:
  pinMode(A0, OUTPUT);
  pinMode(A4, OUTPUT);
  digitalWrite(A0, LOW);  // accelerometer ground
  digitalWrite(A4, HIGH); // accelerometer power

  while (millis() < 5000){
    calibrate();
  }
}

void loop() {
  // read 2 channels of the accelerometer:
  int surge = analogRead(A3);
  int pitch = angleRead(surge, xMax, xMin);  // X axis
  Serial.print(pitch);
  Serial.print(",");
  int sway =  analogRead(A2);
  int roll = angleRead(sway, yMax, yMin);   // Y axis
  Serial.println(roll);
}


float angleRead(int thisValue, int thisMax, int thisMin){
  // normalize the given value to a range between -1 and 1:
  float normalized = map(thisValue, thisMax, thisMin, -1.0, 1.0);
  // calculate the angle:
  double result = asin(normalized) * 180.0/PI;
  //return the result:
  return (float)result;
}



void calibrate() {
  // get the x axis reading:
  int surge = analogRead(A3);
  // if it's greater than the current max,
  // or less than the current min, then
  // change them:
  if (surge <= xMin) {
    xMin = surge; 
  }
  if (surge >= xMax) {
    xMax = surge; 
  }
  // give the analog-to-digital converter time to settle:
  delay(10);
  // get the y axis reading:
  int sway = analogRead(A2);
  // if it's greater than the current max,
  // or less than the current min, then
  // change them:
  if (sway <= yMin) {
    yMin = sway; 
  }
  if (sway >= yMax) {
    yMax = sway; 
  }
}
