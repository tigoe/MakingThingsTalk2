/*
  Galvanic Skin Response reader
 Context: Arduino
 */
const int voltagePin = 11;      // use pin 11 as voltage
const int groundPin = A1;       // use pin A1 as ground

void setup() {
  // initialize serial:
  Serial.begin(115200);  
  // set powerPin and groundPin as digital outputs:
  pinMode(voltagePin, OUTPUT);
  pinMode(groundPin, OUTPUT);
  // set them high and low respectively:
  digitalWrite(voltagePin, HIGH);
  digitalWrite(groundPin, LOW);
}

void loop() {
  // if serial available, send average
  if (Serial.available() > 0) {
    int inByte = Serial.read();
    int sensorReading = analogRead(A0);
    float voltage = map(sensorReading, 0, 1023, 0,3.7);
    Serial.println(voltage);  
  }
}
