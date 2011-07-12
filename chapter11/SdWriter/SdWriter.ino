/*
 SD card writer
 Context: Arduino
 */

#include <SD.h>

// On the Arduino Ethernet Shield, CS for the SD card is pin 4. 
// Note that even if it's not  used as the CS pin, the SPI hardware 
// CS pin (10 on most Arduino boards, 53 on the Mega) must be 
// left as an output or the SD library functions will not work.
const int chipSelect = 4;

const int sdErrorLed = 2;       // lights when there's an error with the SD card
const int sdWriteLed = 6;       // lights when writing to the SD card
const int reserveLength = 500;  // a String to hold incoming serial data

File dataFile;                  // the file to write to on the SD card
String inputString;             // a String to accept incoming serial data

void setup() {
  Serial.begin(9600);          
  Serial.print("Initializing SD card...");
  // make sure that the default SPI chip select pin 
  // is set to output:
  pinMode(10, OUTPUT);

  // reserve a lot of space for the input String:
  inputString.reserve(reserveLength);

  // initialize the SD card indicator LEDs:
  pinMode(sdErrorLed, OUTPUT);
  pinMode(sdWriteLed, OUTPUT);

  // see if the card is present and can be initialized:
  if (!SD.begin(chipSelect)) {
    // if the card's not working, let the user know:
    digitalWrite(sdErrorLed, HIGH);
    Serial.println("Card failed, or not present");
  } 
  else {
    // if the card's working, initialize the data file:
    Serial.println("card initialized.");
    // open the file for writing:
    dataFile = SD.open("myFile.txt", FILE_WRITE);
  }
}

void loop() {
  // while there's incoming serial data, save it to a String: 
  while (Serial.available() ) {
    char inChar = Serial.read();
    inputString += inChar;
  }

  // if there's anything in the string, save it to the card:
  if (inputString.length() > 0) {
    if (dataFile) {
      // turn on the write LED to indicate writing is happening:
      digitalWrite(sdWriteLed, HIGH);
      dataFile.print(inputString);
      // make sure the card saves the data:
      dataFile.flush();
      // you're done writing now:
      digitalWrite(sdWriteLed, LOW);
    }    // if the file isn't open, let the user know:
    else {    // if you couldn't access the card, let the user know:
      digitalWrite(sdErrorLed, HIGH);
      Serial.println("error opening datalog.txt");
      // Echo the input string back, since you can't save it:
      Serial.print(inputString);
    }
    // clear the input string for next time:
    inputString = "";
  }
}
