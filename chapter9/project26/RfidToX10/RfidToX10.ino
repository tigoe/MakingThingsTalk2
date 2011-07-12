
/*
RFID-to-X10 translator
 Context: Arduino
 Reads RFID tags and sends X10 messages in response to the tags.
 */

// include the X10  and softwareSerial library files:
#include <x10.h>
#include <SoftwareSerial.h>

const int x10ZeroCrossing = 2;  // x10 zero crossing pin
const int x10Tx = 3;            // x10 transmit pin
const int x10Rx = 4;            // x10 receive pin (not used)
const int rfidRx = 7;           // rfid receive pin
const int rfidTx = 8;           // rfid transmit pin (not used)
int numTags = 2;                // how many tags in your list

String currentTag;              // String to hold the tag you're reading
// lists of tags, unit names, and unit states:
String tag[] = {
  "10000CDFF7","0F00AD72B5"}; 
int unit[] = {
  UNIT_1, UNIT_2};   
int unitState[] = {
  OFF, OFF};
  
SoftwareSerial rfid(rfidRx,rfidTx);    

void setup() {
  // begin serial:
  Serial.begin(9600);
  rfid.begin(9600);
  // begin x10:
  x10.begin(x10Tx, x10Rx,x10ZeroCrossing);
  // Turn off all lights:
  x10.beginTransmission(A);
  x10.write(ALL_LIGHTS_OFF);
  x10.endTransmission();
}

void loop() {
  // read in and parse serial data:
  if (rfid.available()) {
    readByte();
  }
}

/*
  This method reads the bytes, and puts the 
 appropriate ones in the currentTag
 
 */

void readByte() {
  char thisChar = rfid.read();

  // depending on the byte's value,
  // take different actions:
  switch(thisChar) {
    // if the byte = 2, you're at the beginning
    // of a new tag:
  case 0x02:    
    currentTag = "";
    break;
    // if the byte = 3, you're at the end of a tag:
  case 0x03:
    checkTags();
    break;
    // other bytes, if the current tag is less than
    // ten bytes, you're still reading it:
  default:
    if (currentTag.length() < 10) {
      currentTag += thisChar;
    }
  }
}

/*
  This checks the current tag against the list of tags,
 then changes the state of the corresponding unit
 */
void checkTags() {
  // iterate over the list of tags:
  for (int thisTag = 0; thisTag < numTags; thisTag++) {
    // if the current tag matches the tag you're on:

    if (currentTag.equals(tag[thisTag])) {
      // unit number starts at 1, but list position starts at 0:
      Serial.print("unit " + String(thisTag +1));
      // start transmission to unit:
      x10.beginTransmission(A);
      x10.write(unit[thisTag]);
      // change the status of the corresponding unit:
      if (unitState[thisTag] == ON) {
        unitState[thisTag] = OFF; 
        Serial.println(" turning OFF");
      } 
      else {
        unitState[thisTag] = ON;
        Serial.println(" turning ON");
      }
      // send the new status:
      x10.write(unitState[thisTag]);
      // end transmission to unit:
      x10.endTransmission();
    }
  } 
}
