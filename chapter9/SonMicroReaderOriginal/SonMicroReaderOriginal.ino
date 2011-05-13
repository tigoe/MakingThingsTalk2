/*
Arduino RFID SM130 reader example 
 
 This program implements an RFID card reader and on-chip storage system
 RFID tags are saved to the database by sending a "n" character serially to the Arduino
 Tags subsequently presented to the reader are checked to see if they are the database 
 
 The database is saved in EEPROM so that it is available after a reset or power cycle
 The complete database is erased by typing "c". 
 Individual cards are erased by typing "d", then presenting the RFID tag.
 The list of tags in the database can be seen by typing "p"
 
 created May 2008
 by Alex Zivanovic (www.zivanovic.co.uk)
 
 modified March 2009
 by Tom Igoe
 */

#include <Wire.h>
#include <EEPROM.h>

// There are 512 bytes of EEPROM available. The data stored there 
//remains when the Arduino is switched off or reset
// Each tag uses 5 bytes (1 byte status, 4 bytes tag number), 
//so 512 / 5 = 102 cards may be stored

#define MAX_NO_CARDS 102 


// define the LED pins:
#define waitingLED 7
#define successLED 8
#define failureLED 9

int toggleState = 0;    // state of the toggling LED
long toggleTime = 0;    // delay time of the toggling LED
byte tag[4];            // tag serial numbers are 4 bytes long

void setup() {           
  Wire.begin();                      // join i2c bus  
  Serial.begin(9600);                // set up serial port

  Wire.beginTransmission(0x42);      // the RFID reader's address is 42
  Wire.write(0x01);                   // Length
  Wire.write(0x80);                   // reset reader 
  Wire.write(0x81);                   // Checksum
  Wire.endTransmission();            

  // initialize the LEDs:
  pinMode(waitingLED, OUTPUT);
  pinMode(successLED, OUTPUT);
  pinMode(failureLED, OUTPUT);

  // print user instructions serially:
  Serial.println("n - add card to database");
  Serial.println("c - clear entire database");  
  Serial.println("d - delete card from database");
  Serial.println("p - print database"); 

  // delay to allow reader startup time:
  delay(2000);
} 


void loop() {
  if (Serial.available() > 0) {
    // read the latest byte:
    char incomingByte = Serial.read();   
    switch (incomingByte) {
    case 'n':            // if user enters 'n' then store tag number
      seekNewTag();
      break;  
    case 'c':   
      eraseEEPROM();    // if user enters 'c' then erase database
      Serial.println("Database deleted"); 
      break;     
    case 'd':           // if user enters 'd' then delete the last tag
      seekAndDeleteTag();
      break;
    case'p':            // if user enters 'p' then print the database
      printTags();  
      break;      
    }
  } 
  else {
    //if there's no serial data coming in, 
    // the default action is to seek new tags:
    seekNewTag(); 
  }
  // delay before next command to the reader:
  delay(200);
}

// erase the entire EEPROM memory storage:
void eraseEEPROM(){                 
  for(int i = 0; i < 512; i++){
    EEPROM.write(i, 0);   
  }
}
// writes tag number in a location:
void writeTag(int startingAddress, byte byte0, byte byte1, byte byte2, byte byte3){    
  EEPROM.write( startingAddress*5, byte(1));   
  EEPROM.write(startingAddress*5+1, byte0);
  EEPROM.write(startingAddress*5+2, byte1);
  EEPROM.write(startingAddress*5+3, byte2);
  EEPROM.write(startingAddress*5+4, byte3);

}

// delete tag from a specified location
void deleteTag(int startingAddress){                                    
  EEPROM.write( startingAddress*5, byte(0));   
  EEPROM.write(startingAddress*5+1, byte(0));
  EEPROM.write(startingAddress*5+2, byte(0));
  EEPROM.write(startingAddress*5+3, byte(0));
  EEPROM.write(startingAddress*5+4, byte(0));
}
// find the first empty entry in the database:
int findEmptyTag(){                              
  for (int startingAddress = 0; startingAddress< MAX_NO_CARDS; startingAddress++){
    byte value = EEPROM.read(startingAddress*5);
    if (value == byte(0)) {
      return(startingAddress);
    } 
  }  
  return(200);
}

// print the entire database
void printTags(){                                
  for (int thisTag = 0; thisTag< MAX_NO_CARDS; thisTag++){
    printOneTag(thisTag);
  }    
}

void printOneTag(int address) {
  Serial.print(address);
  Serial.print(":");
  for (int offset = 1; offset < 5; offset++) {
    int thisByte = int(EEPROM.read(address*5+offset));
    // if the byte is less than 16, i.e. only one hex character
    // add a leading 0:
    if (thisByte < 0x10) {
      Serial.print("0"); 
    }
    // print the value:
    Serial.print(thisByte,HEX);
  }
  // add a final linefeed and carriage return:
  Serial.println();
}
//lookup tag in the database:
int lookupTag(byte byte0, byte byte1, byte byte2, byte byte3){   
  for (int thisCard = 0; thisCard< MAX_NO_CARDS; thisCard++){
    byte value = EEPROM.read(thisCard*5);   
    if (value != byte(0)){                    //it is a valid tag
      //see if all four bytes are the same as the ones we're looking for
      if(byte0 == EEPROM.read(thisCard*5+1) && byte1 == EEPROM.read(thisCard*5+2) 
        && byte2 == EEPROM.read(thisCard*5+3) && byte3 == EEPROM.read(thisCard*5+4)) {
        return(thisCard); 
      }
    } 
  }
  // if you don't find the tag, return 200;
  return(200);   
}

int getTag(){
  byte count = 0;
  byte valid = 0;
  byte byteFromReader = 0;

  Wire.beginTransmission(0x42);
  Wire.write(0x01);           // Length
  Wire.write(0x82);           // Seek for tags
  Wire.write(0x83);           // Checksum
  Wire.endTransmission();

  delay(100);
  Wire.requestFrom(0x42, 8); // get data (8 bytes) from reader

  count = 0;                 // keeps track of which byte it is in the response from the reader
  valid = 0;                 // used to indicate that there is a tag there   
  while(Wire.available())  { // while data is coming from the reader
    byteFromReader = Wire.read();
    // no RFID found: reader sends character 2:
    if ((count == 0) && (byteFromReader == 2)) { 
      return(0);
    }
    if ((count == 0) && (byteFromReader== 6)) {
      //if reader sends 6, the tag serial number is coming:
      valid = 1;                                   
    }
    count++;

    if ((valid == 1) && (count > 3) && (count < 8)) {
      // strip out the header bytes  :
      tag[count-4] = byteFromReader;            
    }
    // all four bytes received: tag serial number complete:
    if ((valid == 1) && (count == 8)) {         
      return(1);
    }
  }  
}

void seekNewTag() {
  Serial.println("Waiting for card");
  while(getTag() == 0){
    // wait for tag
    if (millis() - toggleTime > 1000) {
      toggle(waitingLED); 
      toggleTime  = millis();
    }
    // unless you get a byte of serial data,
    if (Serial. available()) {
      // break out of the while loop 
      // and out of the seekNewTag() method:
      return;
    }
  }
  blink(successLED, 100, 1);

  // look it up in the database:
  int tagToCheck = lookupTag(tag[0], tag[1], tag[2], tag[3]);      

  if (tagToCheck != 200){
    Serial.println("That tag is already stored"); 
    printOneTag(tagToCheck);    
  }
  else {
    int emptyTagLocation = findEmptyTag();
    if (emptyTagLocation != 200){
      writeTag(emptyTagLocation, tag[0], tag[1], tag[2], tag[3]);   
      Serial.println("That tag is new");  
      printOneTag(emptyTagLocation);
      blink(successLED, 100, 1);
    }
    else {
      Serial.println("Maximum number of cards stored");  
      blink(failureLED, 50, 10);
    }
  }
}

void seekAndDeleteTag() {
  Serial.println("Deleting the next card");
  Serial.println("Waiting for card");
  while(getTag() == 0){
    // do nothing; wait for tag
    // unless you get a byte of serial data,
    if (Serial. available()) {
      // break out of the while loop 
      // and out of the method:
      return;
    }
  }
  int tagToDelete = lookupTag(tag[0], tag[1], tag[2], tag[3]);      
  if (tagToDelete == 200){
    Serial.print("That tag is not stored");      
  }
  else {
    deleteTag(tagToDelete);       
  } 
}

void toggle(int thisLED) {
  toggleState = !toggleState;
  digitalWrite(thisLED, toggleState);
}

void blink(int thisLED, int interval, int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(thisLED, HIGH);
    delay(interval/2);
    digitalWrite(thisLED, LOW);
    delay(interval/2);
  }
}

