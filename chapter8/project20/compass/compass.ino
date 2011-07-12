/*
  Compass
 Context: Arduino
 
 Reads a ST Microelectronics LSM303DLH compass and prints the output.
 Uses a fork of the LSM303DLH library by Ryan Mulligan, available at
 https://github.com/tigoe/LSM303DLH/, and a fork of the Button library
 by Alexander Brevig available at github.com/tigoe/Button
 
 */

// include the necessary libraries:
#include <Wire.h>
#include <LSM303DLH.h>
#include <Button.h>

const int modeButton = 2;         // pushbutton for calibration mode
const int buttonLed = 3;          // LED for the button

// initialize the compass library:
LSM303DLH compass;              

// initialize a button on pin 2:
Button button = Button(modeButton,BUTTON_PULLDOWN); 
boolean calibrating = false;      // keep track of calibration state

void setup() {
  // initialize serial:
  Serial.begin(9600);
  // set up the button LED:
  pinMode(buttonLed,OUTPUT);        
  // start the Wire library and enable the compass:
  Wire.begin();
  compass.enable();
}

void loop() {
  // if the button changes state, change the calibration state
  // and the state of the LED:
  if(button.isPressed() && button.stateChanged()){
    calibrating = !calibrating;
    digitalWrite(buttonLed, calibrating);
  }
  // if you're in calibration mode, calibrate:
  if (calibrating) {
    compass.calibrate();
  } 
  else {    // if in normal mode, read the heading:
    compass.read();
    int heading = compass.heading();
    Serial.println("Heading: " + String(heading) + " degrees");
  }
  delay(100);
}

