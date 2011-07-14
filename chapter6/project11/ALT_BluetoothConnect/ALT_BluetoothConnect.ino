/*
  Bluetooth Analog Duplex sender
 Language: Wiring/Arduino
 
 This sketch controls an Bluetooth radio via the serial port, 
 sends the value of an analog sensor out, and listens for input 
 from the radio, using it to set the value of a PWM output. 
 */


#include <TextFinder.h>

const int sensorPin = A0;          // analog input sensor
const int analogLed = 3;           // LED that changes brightness with incoming value
const int threshold = 20;          // threshold for sensor's change
const int debounceInterval = 15;   // used to smooth out pushbutton readings
const int connectButton = 2;       // the pushbutton for connecting
int lastButtonState = 0;           // previous state of the pushbutton
int lastSensorReading = 0;         // previous state of the sensor       
long lastReadingTime = 0;          // previous time you read the sensor

// address of the remote BT radio. Replace with the address 
// of your remote radio
String remoteAddress = "000666049D7B";  
String messageString = "";        // messages coming in serial port

boolean connected = false;      // whether you're connected or not
boolean commandMode = false;    // whether you're in command or data mode

//TextFinder finder(Serial);      // for searching the serial input

void setup() {
  // configure serial communications:
  Serial.begin(115200);      

  // configure output pins:
  pinMode (analogLed, OUTPUT);

  // blink the TX LED indicating that 
  // the main program's about to start:
  blink(analogLed, 3);
}

void loop() {
  // read incoming serial and parse it:
  handleSerial();

  // check to see if the pushbutton's pressed:
  boolean buttonPushed = buttonRead(connectButton);

  // if the button's just pressed:
  if (buttonPushed) {
    // if the client's connected, disconnect:
    if (connected) {
      BTDisconnect();
    } // if the client's disconnected, try to connect:
    else {
      BTConnect();
    }
  }

  // if connected, take sensor readings:
  if (connected) {
    // note the current time in milliseconds:
    long currentTime = millis();
    // if enough time has passed since the last reading:
    if (currentTime - lastReadingTime > debounceInterval) {
      // read the analog sensor, divide by 4 to get a 0-255 range:
      int sensorValue = analogRead(A0)/4;
      // if there's a significant difference between the 
      // current sensor reading and the last, send it out:
      if (abs(sensorValue - lastSensorReading) > threshold) { 
        Serial.println(sensorValue, DEC);
      } 
      // update the last reading time
      // and last sensor reading:
      lastReadingTime = currentTime; 
      lastSensorReading = sensorValue;
    } 
  }
}

// blink the LED:
void blink(int thisPin, int howManyTimes) {
  //     Blink the LED:
  for (int blinks=0; blinks< howManyTimes; blinks++) {
    digitalWrite(thisPin, HIGH);
    delay(200);
    digitalWrite(thisPin, LOW);
    delay(200);  
  }
}

void BTConnect() {
  // if in data mode, send $$$
  if (!commandMode) {
    Serial.print("$$$");   
    // wait for a response:
    if (Serial.find("CMD")) {
      commandMode = true;
    }
  }
  // once you're in command mode, send the connect command:
  if (commandMode) {
    Serial.print("C," + remoteAddress + "\r");
    // wait for a response:
    Serial.find("CONNECT");
    // if the message is "CONNECT failed":
    if (Serial.find("failed")) {
      connected = false; 
    } 
    else {
      connected = true;
      // radio automatically drops into data mode
      // when it connects:
      commandMode = false;
    }
  }
}

void BTDisconnect() {
  // if in data mode, send $$$
  if (!commandMode) {
    Serial.print("$$$");   
    // wait for a response:
    if (Serial.find("CMD")) {
      commandMode = true;
    }
  }
  // once you're in command mode, 
  // send the disconnect command:
  if (commandMode) {
    // attempt to connect
    Serial.print("K,\r");
    // wait for a successful disconnect message:
    if (Serial.find("BTDISCONNECT")) {
      connected = false; 
      // radio automatically drops into data mode
      // when it disconnects:
      commandMode = false;
    }
  }
}

void handleSerial() {
  // look for message string
  // if it's BTCONNECT, connected = true;
  // if it's BTDISCONNECT, connected = false;
  // if it's CONNECT failed, connected = false;
  // if it's a number, set the LED
  char inByte = Serial.read();

  // add any ASCII alphanumeric characters
  // to the message string:
  if (isAscii(inByte)) {
    messageString = messageString + inByte;
  }

  // handle CONNECT and DISCONNECT messages:
  if (messageString == "BTDISCONNECT") {
    connected = false;
  }
  if (messageString == "BTCONNECT") {
    connected = true;
  }

  if (connected) {
    // convert the string to a number:
    int brightness = messageString.toInt();
    // set the analog output LED:
    if (brightness > 0) {
      analogWrite(analogLed, brightness);
    }
  }

  // if you get an ASCII carriage return:
  if (inByte == '\r') {
    // clear the input string for the 
    // next value:
    messageString = ""; 
  }
}


// this method reads the button to see if it's just changed
// from low to high, and debounces the button in case of
// electrical noise:

boolean buttonRead(int thisButton) {
  boolean result = false;          
  // temporary state of the button:
  int currentState = digitalRead(thisButton);
  // final state of the button: 
  int buttonState = lastButtonState; 
  // get the current time to time the debounce interval:  
  long lastDebounceTime = millis();  

  while ((millis() - lastDebounceTime) < debounceInterval) {
    // read the state of the switch into a local variable:
    currentState = digitalRead(thisButton);

    // If the pushbutton changed due to noise:
    if (currentState != buttonState) {
      // reset the debouncing timer
      lastDebounceTime = millis();
    } 

    // whatever the reading is at, it's been there for longer
    // than the debounce delay, so take it as the actual current state:
    buttonState = currentState;
  }
  // if the button's changed and it's high:
  if(buttonState != lastButtonState && buttonState == HIGH) {
    result = true;
  }

  // save the current state for next time:
  lastButtonState = buttonState; 
  return result;
}

