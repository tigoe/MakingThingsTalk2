/*
  Serial RGB LED controller test
 Context: Arduino
 
 created 19 July 2010
 by Tom Igoe
 */

// constants to hold the output pin numbers:
const int greenPin = 9;
const int bluePin = 10;
const int redPin = 11;

void setup() {
  // initialize the LED pins as outputs:
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT); 
}

void loop() {
  //Turn the current pin on:
  for (int currentPin = 9; currentPin < 12; currentPin++) {
    digitalWrite(currentPin, HIGH);
    delay(1000);

    // Turn the current pin off:
    digitalWrite(currentPin, LOW);
    delay(1000);
  }
}

