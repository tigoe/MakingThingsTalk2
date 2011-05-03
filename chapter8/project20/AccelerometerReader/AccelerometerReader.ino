/*
  Accelerometer reader
 Language: Arduino
 Reads 2 axes of an accelerometer, calculates pitch and roll,
 and sends the values out the serial port
 */

int xMax = 0;
int xMin = 1023;    // maxima and minima for x axis acceleration
int yMax = 0;
int yMin = 1023;    // maxima and minima for y axis acceleration

void setup() {
  // open serial port:
  Serial.begin(9600);
delay(100);
  while (millis() < 5000){
    calibrate();
  }
}

void loop() {
  // read 2 channels of the accelerometer:
  int surge = analogRead(A0);
  float pitch = angleRead(surge, xMax, xMin);  // X axis
  Serial.print(pitch);
  Serial.print("\t");
  int sway =  analogRead(A1);
  float roll = angleRead(sway, yMax, yMin);   // Y axis
  Serial.println(roll);
}


float angleRead(int thisValue, int thisMax, int thisMin){
  calibrate();
  // normalize the given value to a range between -1 and 1:
   float normalized = (float)(thisValue - thisMin) / (float)(thisMax - thisMin) * 2.0 - 1.0;
  // calculate the angle:
  double result = asin(normalized) * 180.0/PI;
  //return the result:
  return (float)result;
}



void calibrate() {
  // get the x axis reading:
  int surge = analogRead(A0);
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
  int sway = analogRead(A1);
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
