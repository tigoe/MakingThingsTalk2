/*
  Accelerometer reader
  Context: Arduino
  Reads an  ADXL33x accelerometer's raw values
*/

void setup() {
  Serial.begin(9600);   // begin serial communication
}

void loop() {
  // read the accelerometer axes, and convert
  // the results to acceleration values:
  int xRaw = analogRead(A0);  // read x axis
  delay(1);
  int yRaw = analogRead(A1);  // read y axis
  delay(1);
  int zRaw = analogRead(A2);  // reax z axis

// convert to accelerations:
  float x = readAcceleration(xRaw);
  float y = readAcceleration(yRaw);
  float z = readAcceleration(zRaw);
}

float readAcceleration(int rawValue) {
  // ADXL33x accelerometer has a +/- 3g range:
  float result = ((rawValue * 3.0) / 512.0) - 3.0;
  return result;
}

