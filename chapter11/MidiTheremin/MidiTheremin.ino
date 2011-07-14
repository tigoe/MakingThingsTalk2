#include <icrmacros.h>
#include <SoftwareSerial.h>

/*
  Sharp GP2xx IR ranger reader
 Context: Arduino
 
 Reads the value from a Sharp GP2Y0A21 IR ranger and sends 
 it out serially.
 */

SoftwareSerial midi(2,3);

const int threshold = 180;

const byte resetMIDI = 4; //Tied to VS1053 Reset line
boolean noteOn = false;
int currentNote = 0;

void setup() {
  // initialize serial communications at 9600 bps:
  Serial.begin(9600); 
  midi.begin(31250);
  pinMode(A0, OUTPUT);
  pinMode(A2, OUTPUT);
  digitalWrite(A0,HIGH);
  digitalWrite(A2, LOW);

  //Reset the VS1053
  pinMode(resetMIDI, OUTPUT);
  digitalWrite(resetMIDI, LOW);
  delay(20);
  digitalWrite(resetMIDI, HIGH);
  delay(20);


}

void loop() {
  int sensorValue = analogRead(A1); // read the sensor value
Serial.println(sensorValue);
//Serial.print("  ");
  if (sensorValue > threshold) {
    
    if (!noteOn) {
      currentNote = map( sensorValue, 0, 1023, 50, 100);
      sendMidi(0x90, currentNote, 0x7F);
      noteOn = true;
    } 
    else {
      int pitchHigh = sensorValue / 127;
      int pitchLow = sensorValue % 127;
      sendMidi(0xE0, pitchLow, pitchHigh); 
    }
  } 
  else {
    if (noteOn) {
      Serial.println("note off");
      sendMidi(0x80, currentNote, 0x00);
      noteOn = false;
    }
  }
}

void sendMidi(int cmd, int data1, int data2) {
  midi.write(cmd);
  midi.write(data1);
  midi.write(data2);
}



