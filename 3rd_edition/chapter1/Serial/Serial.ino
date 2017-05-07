/*
    Simple Serial  
    Context: Arduino
    Listens for an incoming serial byte, adds one to the byte
    and sends the result back out serially.
    Also blinks the built-in LED every half second.
 */

int inByte = 0;              // variable to hold incoming serial data
unsigned long blinkTimer = 0;// keeps track of how long since the LED 
                             // was last turned off
unsigned int blinkInterval = 1000; // a full second from on to off to on again

void setup() {
  pinMode(LED_BUILTIN, OUTPUT); // set built in LED to be an output
  Serial.begin(9600);           // configure the serial port for 9600 bps 
}

void loop() {
  // if there are any incoming serial bytes available to read:
  if (Serial.available() > 0) {
        inByte = Serial.read();  // then read the first available byte,
        Serial.write(inByte+1);  // add one to it and send the result out
  }
  
  // Meanwhile, keep blinking the LED.
  // after a half a second, turn the LED on:
  if (millis() - blinkTimer >= blinkInterval/2) {
    digitalWrite(LED_BUILTIN, HIGH);      // turn the LED on 
  }
  // after a half a second, turn the LED off and reset the timer:
  if (millis() - blinkTimer >= blinkInterval) {
    digitalWrite(LED_BUILTIN, LOW);  // turn the LED off
    blinkTimer = millis();           // reset the timer
  }
}
