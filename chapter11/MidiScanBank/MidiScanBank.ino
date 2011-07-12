/*
  MIDI general instrument demo
 Context: Arduino
 
 Plays all the instruments in a General MIDI instrument bank
 */
#include <SoftwareSerial.h>

SoftwareSerial midi(2,3);

const byte resetMIDI = 4; // Midi synth chip reset line

void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600); 
  // initialize MIDI serial on the software serial pins:
  midi.begin(31250);

  //Reset the MIDI synth:
  pinMode(resetMIDI, OUTPUT);
  digitalWrite(resetMIDI, LOW);
  delay(20);
  digitalWrite(resetMIDI, HIGH);
  delay(20);
  // send a MIDI control change to change to the GM sound bank:
  sendMidi(0xB0, 0, 0);
}

void loop() {
  //Cycle through all the instruments in the bank:
  for(int instrument = 0 ; instrument < 127 ; instrument++) {
    Serial.print(" Instrument: ");
    Serial.println(instrument + 1);
    // Program select. Has only one status byte:
    sendMidi(0xC0, instrument, 0); 
    // change channels within the instrument:
    for (int thisChannel = 0; thisChannel < 16; thisChannel++) {
      Serial.print("Channel: ") ;
      Serial.println(thisChannel + 1);
      for (int thisNote = 21; thisNote < 109; thisNote++) {
        // note on
        noteOn(thisChannel, thisNote, 127);
        delay(30);

        // note off
        noteOff(thisChannel, thisNote, 0);
        delay(30);
      }
    }
  }
}

//Send a MIDI note-on message.  Like pressing a piano key
//channel ranges from 0-15
void noteOn(byte channel, byte note, byte velocity) {
  sendMidi( (0x90 | channel), note, velocity);
}

//Send a MIDI note-off message.  Like releasing a piano key
void noteOff(byte channel, byte note, byte velocity) {
  sendMidi( (0x80 | channel), note, velocity);
}
void sendMidi(int cmd, int data1, int data2) {
  midi.write(cmd);
  midi.write(data1);
  midi.write(data2);
}






