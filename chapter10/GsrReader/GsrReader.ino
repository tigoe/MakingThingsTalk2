long now;               // current millis() reading
long lastReadingTime;   // last time you read
const int readingInterval = 1 * 1000;        // time between readings
float average;          // average voltage reading of the GSR circuit
int readingCount = 0;
float runningTotal = 0.0;

void setup() {
  // initialize serial:
  Serial.begin(115200);  
}

void loop() {
  // read sensor once a second 
  now = millis(); 
  if (now - lastReadingTime > readingInterval) {
    int sensorReading = analogRead(A0);
    float voltage = map(sensorReading, 0, 1023, 0, 5);
    lastReadingTime = now;
    // make sure there is a valid reading:
    if (voltage > 0) {
      // add to running total for averaging:
      runningTotal += voltage;
      readingCount++;
    }
  }
  // if serial available, send average
  if (Serial.available() > 0) {
    int inByte = Serial.read();
    float average = runningTotal / readingCount;
    Serial.println(average);
    runningTotal = 0;
    readingCount = 0;
  }
}



