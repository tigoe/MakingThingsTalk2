
/*
RFID-to-X10 translator
 Language: Arduino
 Reads RFID tags and sends X10 messages in response to the tags.
 */

// include the X10 library files:
#include <x10.h>
#include <icrmacros.h>
#include <SoftwareSerial.h>

const int zcPin = 2;
const int txPin = 3;
const int rxPin = 4;

  
#define tagLength 10    // each tag ID contains 10 bytes
#define startByte 0x02  // for the ID Innovations reader, use 0x02
#define endByte 0x03    // for the ID Innovations reader, use 0x03


String tagID;          // array to hold the tag you read
int tagIndex = 0;               // counter for number of bytes read
int tagComplete = false;        // whether the whole tag's been read
String tagOne = "10000CDFF734";   // put the values for your tags here
String tagTwo = "0F00AD72B565";    
char lastTag = 0;               // value of the last tag read    

SoftwareSerial rfid(7,8);

void setup() {
  // begin serial:
  Serial.begin(9600);
  rfid.begin(9600);
  x10.begin(txPin, rxPin,zcPin);
  // Turn off all lights:
  x10.beginTransmission(A);
  x10.write(ALL_LIGHTS_OFF);
  x10.endTransmission();
  Serial.println("leaving setup");
}
void loop() {
  // read in and parse serial data:
  if (rfid.available()) {
    readByte();
  }

  // if you've got a complete tag, compare your tag
  // to the existing values:

  if (tagComplete == true) {
    if (tagOne.equals(tagID)) {

      if (lastTag != 1) {
        // if the last tag wasn't this one, 
        // send commands:
        Serial.println("Turning on unit 1");
        x10.beginTransmission(A);
        x10.write(UNIT_1);
        x10.write(ON);
        x10.write(UNIT_2);
        x10.write(OFF);
        x10.endTransmission();


        // note that this was the last tag read:
        lastTag = 1;
      }
    }
    if (tagTwo.equals(tagID)) {
      if (lastTag != 2) {
        // if the last tag wasn't this one, 
        // send commands:
         Serial.println("Turning on unit 2");
        x10.beginTransmission(A);
        x10.write(UNIT_1);
        x10.write(OFF);
        x10.write(UNIT_2);
        x10.write(ON);
        x10.endTransmission();

        // note that this was the last tag read:
        lastTag = 2;
      }
    }
  }
}


/*
  This method reads the bytes, and puts the 
 appropriate ones in the tagID
 
 */
void readByte() {
  char thisChar = rfid.read();
  Serial.write(thisChar);
  switch (thisChar) {
  case startByte:     // start character
    // reset the tag index counter
   tagID = "";
    break;
  case endByte:    // end character 
    tagComplete = true;  // you have the whole tag
    break;
    case '\n':
    case '\r':
    break;
  default:    // any other character
    tagComplete = false;  // there are still more bytes to read
    // add the byte to the tagID
      tagID += thisChar;
    break;
  }
}


