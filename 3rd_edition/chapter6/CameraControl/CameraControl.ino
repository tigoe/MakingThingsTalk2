/*
  IR Camera control
  Context: Arduino

  This sketch controls a digital camera via an infrared LED.
*/

const int pushButtonPin = 4;      // pushbutton I/O pin
const int IRPin = 7;              // IR LED I/O pin
const int CAM_NIKON = 1;          // DSLR camera types
const int CAM_CANON = 2;
int buttonState = 0;              // current button state
int lastButtonState = 0;          // previous button state

void setup() {
  pinMode(pushButtonPin, INPUT);  // initialize pusbutton
  pinMode(IRPin, OUTPUT);         // initialize IR pin
}

void loop() {
  // read the pushButtonPin input pin:
  buttonState = digitalRead(pushButtonPin);

  if (buttonState != lastButtonState) { // if button state changes,
    if (buttonState == HIGH) {          // and button is pressed
      shutterClick(CAM_CANON);          // send IR shutter signal
    }
  }
  // save the current state for next comparison:
  lastButtonState = buttonState;
}

void shutterClick(int cameraType) {
  if (cameraType == CAM_NIKON) {       // if it's a Nikon
    unsigned long irFrequency = 38000; // IR freq. = 38K
    for (int i = 0; i < 2; i++) {      // send message twice
      IRPulse(2000, irFrequency);      // 2ms on
      delay(27);                       // 27 ms off
      IRPulse(400, irFrequency);       // 0.4ms on
      delayMicroseconds(1500);         // 1.5ms off
      IRPulse(500, irFrequency);       // 0.5ms on
      delayMicroseconds(3500);         // 3.44ms off
      IRPulse(500, irFrequency);       // 0.5ms on
      delay(65);                       // 65ms delay before repeat
    }
  }
  if (cameraType == CAM_CANON) {       // If it's a Canon
    unsigned long irFrequency = 32700; // IR freq. = 32.7K
    for (int i = 0; i < 2; i++) {      // send message twice
      IRPulse(489, irFrequency);       // 16 pulses @ IR freq.
      delayMicroseconds(7330);
      IRPulse(489, irFrequency);       // 16 pulses @ IR freq.
      delay(100);
    }
  }
}
// send an IR pulse at a frequency for a time:
void IRPulse(unsigned long interval,  unsigned long frequency) {
  unsigned long now = micros();     // get current time in micros
  tone(IRPin, frequency);           // pulse IRPin at frequency
  while (micros() - now < interval);// do nothing until interval passes
  noTone(IRPin);                    // turn off pulse
}
