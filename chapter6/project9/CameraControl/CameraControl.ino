/*
  IR Camera control
 Context: Arduino
 
 This sketch controls a digital camera via an infrared LED. 
 */

// include the library for camera control:
#include <multiCameraIrControl.h>

const int pushButtonPin = 4;
// set up in 3 to control the IR LED.
// change this depending on the brand of your camera:
Nikon camera(3);


// Variables will change:
int buttonState = 0;         // current state of the button
int lastButtonState = 0;     // previous state of the button

void setup(){
  // initialize the pushButtonPin as input:
  pinMode(pushButtonPin, INPUT);
}

void loop(){
  // read the pushButtonPin input pin:
  buttonState = digitalRead(pushButtonPin);

  // compare the buttonState to its previous state
  // if it's changed, and it's high now, then the person
  // just puched the button:
  if (buttonState != lastButtonState && buttonState == HIGH) {
    // send the signal to open the shutter:
    camera.shutterNow();
  }
  // save the current state as the last state, 
  //for next time through the loop
  lastButtonState = buttonState;
}



