/*
  Balance Board client
 Language:  Arduino
 
 This program enables an Arduino to control one paddle 
 in a networked Pong game. 
 */


#include <SPI.h>
#include <Ethernet.h>

byte mac[] = { 0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress ip(192,168,1,20);

// Enter the IP address of the computer on which 
// you'll run the pong server:
IPAddress server(192,168,1,100); 

const int connectButton = 2;  // the pushbutton for connecting/disconnecting
const int connectionLED = 3;  // this LED indicates whether you're connected
const int leftLED = 4;        // this LED indicates that you're moving left
const int rightLED = 5;       // this LED indicates that you're moving right
const int left = 880;         // threshold for the joystick to go left   
const int right = 891;        // threshold for the joystick to go right
const int sendInterval = 20;  // minimum time between messages to the server
const int debounceInterval = 15;  // used to smooth out pushbutton readings

EthernetClient client;               // instance of the Client class for connecting
int lastButtonState = 0;     // previous state of the pushbutton
long lastTimeSent = 0;       // timestamp of the last server message

void setup()
{
  // initialize serial and Ethernet ports:
  Ethernet.begin(mac, ip);
  Serial.begin(9600);  
  // initialize digital inputs and outputs:
  pinMode(connectButton, INPUT);
  pinMode(connectionLED, OUTPUT);
  pinMode(leftLED, OUTPUT);
  pinMode(rightLED, OUTPUT);

  delay(1000);      // give the Ethernet shield time to set up
  Serial.println("Starting");
}

void loop()
{
  // note the current time in milliseconds:
  long currentTime = millis();
  // check to see if the pushbutton's pressed:
  boolean buttonPushed = buttonRead(connectButton);

  // if the button's just pressed:
  if (buttonPushed) {
    // if the client's connected, disconnect:
    if (client.connected()) {
      Serial.println("disconnecting");
      client.print("x");
      client.stop();
    } // if the client's disconnected, try to connect:
    else {
      Serial.println("connecting");
      client.connect(server, 8080);
    }
  }

  // if the client's connected, and the send interval has elapased:
  if (client.connected() && (currentTime - lastTimeSent > sendInterval)) {   
    // read the joystick and send messages as appropriate:
    int sensorValue = analogRead(A0);
    if (sensorValue < left) {    // moving left
      client.print("l");
      digitalWrite(leftLED, HIGH);
    }

    if (sensorValue > right) {    // moving right
      client.print("r");
      digitalWrite(rightLED, HIGH);
    }
    // if you're in the middle, turn off the LEDs:
    if (left < sensorValue && sensorValue < right) {
      digitalWrite(rightLED, LOW);
      digitalWrite(leftLED, LOW); 
    }
    //save this moment as last time you sent a message:
    lastTimeSent = currentTime; 
  }

  // set the connection LED based on the connection state:
  digitalWrite(connectionLED, client.connected());
}
/*
 // if there's incoming data from the client, print it serially:
 if (client.available()) {
 char c = client.read();
 Serial.write(c);
 }
 
 */



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
















