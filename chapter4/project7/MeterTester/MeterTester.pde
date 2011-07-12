/*
    Voltmeter Tester
 Uses analogWrite() to control a voltmeter.
 Context: Arduino
 */
// the output pin that the meter is attached to:
const int meterPin = 9;

int pwmValue = 0;  // the value used to set the meter

void setup() {
  Serial.begin(9600);
}

void loop() {
  // move the meter from lowest to highest values:
  for (pwmValue = 0; pwmValue < 255; pwmValue ++) {
    analogWrite(meterPin, pwmValue); 
    Serial.println(pwmValue);
    delay(10);
  } 
  delay(1000);
  // reset the meter to zero and pause:
  analogWrite(meterPin, 0);
  delay(1000);
}


