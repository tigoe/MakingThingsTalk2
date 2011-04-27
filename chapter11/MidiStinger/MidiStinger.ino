/*
  Stinger player
  Language: Arduino
*/

#include <SoftwareSerial.h>

// set up a software serial port to send MIDI:
SoftwareSerial midi(2, 3);  

int midiResetPin = 4;     // Musical instrument shield's reset pin

const int threshold = 40; // sensor threshold
int lastReading = 0;      // last sensor reading

void setup() {
  // initialize hardware serial and MIDI serial:
  Serial.begin(9600);
  midi.begin(31250);

  // reset the musical instrument shield:
  resetMidi(midiResetPin);

  // set the channel volume to max:
  sendMidi(0xB0, 0x07, 127);
  // select the drum bank:
  sendMidi(0xB0, 0x00, 0x78);
  // choose the standard drum kit:
  sendMidi(0xC0, 30, 0); 
}

void loop() {
// read the sensor:
  int sensorReading = analogRead(A0);
  Serial.println(sensorReading);

// if the sensor's higher than the threshold and 
// was lower than the threshold last time,
// then play the stinger:
  if (sensorReading <= threshold 
    && lastReading > threshold ) { 
    playStinger();
  }
  // save the current reading for next time:
  lastReading = sensorReading;

}

void playStinger() {
  int note[] = {43, 41, 49};
  int rest[] = {70, 180, 750};

// loop over the three notes:
  for (int thisNote = 0; thisNote < 3; thisNote++) {
    // Turn on note:
    sendMidi(0x90, note[thisNote], 60);
    delay(rest[thisNote]);
    //Turn off the note:
    sendMidi(0x80, note[thisNote], 60);
    // a little pause after the second note:
    if (thisNote == 1) {
      delay(50); 
    }
  }
}

void resetMidi(int thisPin) {
  //Reset the VS1053
  pinMode(thisPin, OUTPUT);
  digitalWrite(thisPin, LOW);
  delay(100);
  digitalWrite(thisPin, HIGH);
  delay(100);
}
void sendMidi(byte cmd, byte data1, byte data2) {
  // send a midi message:
  midi.write(cmd);
  midi.write(data1);
  midi.write(data2);
}





