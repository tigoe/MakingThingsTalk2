#include <SoftwareSerial.h>


// using pins 7 and 8 (7 is the Arduino's RX, 8 is TX)
SoftwareSerial rfid(7,8);

byte tag[7];            // tag serial numbers are 4 to 7 bytes long

boolean gotTag = false;  // if you have a good tag read

void setup() {           
  rfid.begin(19200);     // set up software serial port
  Serial.begin(9600);                // set up serial port


  resetReader();  // reset the reader
  // delay to allow reader startup time:
  delay(2000);
  seekTag();      // initial seek for tags
} 


void loop() {
  // if the user types r for read:
  if (Serial.read() == 'r') {
    seekTag();
  }
  // of you have a good tag, print it:
  if (getData()) {
    printTag();
  }
}

void seekTag() {
  Serial.println("Seeking...");
  rfid.write(0xFF);
  rfid.write(0x00);
  rfid.write(0x01);                   // Length
  rfid.write(0x82);                   // reset reader 
  rfid.write(0x83);                   // Checksum  
}

void resetReader() {
  Serial.println("Resetting...");
  rfid.write(0xFF);
  rfid.write(0x00);
  rfid.write(0x01);                   // Length
  rfid.write(0x80);                   // reset reader 
  rfid.write(0x81);                   // Checksum
}

void printTag() {
  Serial.print("Good tag: ");
  for (int thisByte = 0; thisByte < 4; thisByte++) {
    Serial.print(tag[thisByte], HEX);
    Serial.print(" "); 
  }
  Serial.println();
  gotTag = false;
}


boolean getData() {
  boolean result = false;
  int inByte = 0;
  if (!rfid.available()) {
    return false; 
  }

  while (inByte != 0xFF) {
    inByte = rfid.read();
  }

  while (rfid.available() < 2);    // wait for two bytes

  int reservedByte = rfid.read();  // get reserved byte
  int packetLength = rfid.read();  // get length

  while(rfid.available() < packetLength);  // wait for the rest
  byte command = rfid.read();    // the command is byte 3


  if (packetLength == 2) {
    // two bytes means no tag yet
  }

  // if you're doing seekTag or selectTag:
  if (command == 0x82 || command == 0x83) {
    // clear the tag array for the new tag:
    clearLastTag();
    // 6 or 9 bytes is a good tag:
    if (packetLength == 6 || packetLength == 9) {
      // get the type of tag:
      byte tagType = rfid.read();
      // read all but the last byte into the array:
      byte byteCounter = 0;
      while (byteCounter < packetLength-2) {
        tag[byteCounter] = rfid.read();
        byteCounter++;
      }
      // you've got a good tag:
      result = true;
    }
  }
  // clear any bytes you didn't read:
  rfid.flush();
  return result;
} 

void clearLastTag() {
  // clear the tag array:
  for (int thisByte = 0; thisByte < 7; thisByte++) {
    tag[thisByte] = 0x00;
  } 
}























