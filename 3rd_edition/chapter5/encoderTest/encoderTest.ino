/*
  Encoder test
  context: Arduino
*/
#define ENCODER_DO_NOT_USE_INTERRUPTS
#include <Encoder.h>

Encoder myEncoder(0, 1);

void setup() {
  Serial.begin(9600);
  pinMode(0, INPUT_PULLUP);
  pinMode(1, INPUT_PULLUP);
  pinMode(2, INPUT);
}
void loop() {
  long position = myEncoder.read();

  Serial.print("Encoder: ");
  Serial.print(position);

  int buttonState = digitalRead(2);
  Serial.print("  Button: ");
  Serial.println(buttonState);
}


