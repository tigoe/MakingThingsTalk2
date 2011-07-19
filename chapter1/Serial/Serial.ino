/*
    Simple Serial  
    Context: Arduino
    Listens for an incoming serial byte, adds one to the byte
    and sends the result back out serially.
    Also blinks an LED on pin 13 every half second.
 */

int LEDPin = 13;             // you can use any digital I/O pin you want
int inByte = 0;              // variable to hold incoming serial data
long blinkTimer = 0;         // keeps track of how long since the LED 
                             // was last turned off
int blinkInterval = 1000;    // a full second from on to off to on again

void setup() {
  pinMode(LEDPin, OUTPUT);    // set pin 13 to be an output
  Serial.begin(9600);         // configure the serial port for 9600 bps 
                              // data rate.
}

void loop() {
  // if there are any incoming serial bytes available to read:
  if (Serial.available() > 0) {
    // then read the first available byte:
    inByte = Serial.read();
    // and add one to it, then send the result out:
    Serial.write(inByte+1);
  }
  
  // Meanwhile, keep blinking the LED.
  // after a half of a second, turn the LED on:
  if (millis() - blinkTimer >= blinkInterval / 2) {
    digitalWrite(LEDPin, HIGH);      // turn the LED on pin 13 on 
  }
  // after a half a second, turn the LED off and reset the timer:
  if (millis() - blinkTimer >= blinkInterval) {
    digitalWrite(LEDPin, LOW);       // turn the LED off
    blinkTimer = millis();           // reset the timer
  }
}
