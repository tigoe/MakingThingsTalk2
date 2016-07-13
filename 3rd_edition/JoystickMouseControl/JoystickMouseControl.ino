/*
  JoystickMouseControl

  Controls the mouse from a joystick on an MKR1000
  Uses a pushbutton to turn on and off mouse control, and
  a second pushbutton to click the left mouse button

  Modified from standard Arduino example, original by me.

  Hardware:
   2-axis joystick connected to pins A4 and A3
   pushbuttons connected to pin A2 and D5

  The mouse movement is always relative. This sketch reads
  two analog inputs that range from 0 to 1023 (or less on either end)
  and translates them into ranges of -6 to 6.
  The sketch assumes that the joystick resting values are around the
  middle of the range, but that they vary within a threshold.

  WARNING:  When you use the Mouse.move() command, the Arduino takes
  over your mouse!  Make sure you have control before you use the command.
  This sketch includes a pushbutton to toggle the mouse control state, so
  you can turn on and off mouse control.

  created 15 Sept 2011
  updated 12 July 2016
  by Tom Igoe

*/

#include "Mouse.h"

// set pin numbers for switch, joystick axes, and LED:
const int switchPin = 5;      // switch to turn on and off mouse control
const int mouseButton = A2;    // input pin for the mouse pushButton
const int xAxis = A4;         // joystick X axis
const int yAxis = A3;         // joystick Y axis
const int pwr = A5;           // joystick power
const int gnd = A1;           // joystick ground

// parameters for reading the joystick:
int range = 12;               // output range of X or Y movement
int responseDelay = 5;        // response delay of the mouse, in ms
int threshold = range / 4;    // resting threshold
int center = range / 2;       // resting position value

boolean mouseIsActive = false;    // whether or not to control the mouse
int lastSwitchState = LOW;        // previous switch state

void setup() {
  pinMode(switchPin, INPUT_PULLUP);       // the switch pin
  pinMode(mouseButton, INPUT_PULLUP);     // mouse pushbutton
  pinMode(LED_BUILTIN, OUTPUT);           // the LED pin
  pinMode(gnd, OUTPUT);                   // ground pin for joystick
  pinMode(pwr, OUTPUT);                   // power pin for joystick
  digitalWrite(gnd, LOW);                 
  digitalWrite(pwr, HIGH);
  
  // take control of the mouse:
  Mouse.begin();
  Serial.begin(9600);
}

void loop() {
  mouseIsActive = !digitalRead(switchPin);
  // turn on LED to indicate mouse state:
  digitalWrite(LED_BUILTIN, mouseIsActive);


  // read and scale the two axes:
  int xReading = readAxis(xAxis);
  int yReading = readAxis(yAxis);

  // if the mouse control state is active, move the mouse:
  if (mouseIsActive) {
    Mouse.move(xReading, yReading, 0);


    // read the mouse button and click or not click:
    // if the mouse button is pressed:
    if (digitalRead(mouseButton) == LOW) {
      // if the mouse is not pressed, press it:
      if (!Mouse.isPressed(MOUSE_LEFT)) {
        Mouse.press(MOUSE_LEFT);
      }
    }
    // else the mouse button is not pressed:
    else {
      // if the mouse is pressed, release it:
      if (Mouse.isPressed(MOUSE_LEFT)) {
        Mouse.release(MOUSE_LEFT);
      }
    }
  }

  delay(responseDelay);
}

/*
  reads an axis (0 or 1 for x or y) and scales the
  analog input range to a range from 0 to <range>
*/

int readAxis(int thisAxis) {
  // read the analog input:
  int reading = analogRead(thisAxis);

  // map the reading from the analog input range to the output range:
  reading = map(reading, 0, 1023, 0, range);

  // if the output reading is outside from the
  // rest position threshold,  use it:
  int distance = reading - center;

  if (abs(distance) < threshold) {
    distance = 0;
  }

  // return the distance for this axis:
  return distance;
}
