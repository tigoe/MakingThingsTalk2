/*
 GPS Datalogger
 Language: Arduino
 */

#include <SD.h>
#include <SoftwareSerial.h>

SoftwareSerial gpsPort(2, 3);

// On the Ethernet Shield, CS is pin 4. Note that even if it's not
// used as the CS pin, the hardware CS pin (10 on most Arduino boards,
// 53 on the Mega) must be left as an output or the SD library
// functions will not work.
const int chipSelect = 4;

const int sdErrorLed = 5;   // lights when there's an error with the card
const int sdWriteLed = 6;   // lights when writing to the SD card
boolean cardPresent = false;

File   dataFile;            // the file to write to on the SD card
String gpsData = "";        // String to gather data for writing to SD card
//int sentenceCount = 0;      // number of NMEA sentences that have come in
int lastReadLength = 0;
int reserveLength = 1023;

long lastCardWrite = 0;
long delayTime = 250;

void setup()
{
  Serial.begin(57600);
  gpsPort.begin(9600);
  Serial.print("Initializing SD card...");
  // make sure that the default chip select pin is set to
  // output, even if you don't use it:
  pinMode(10, OUTPUT);

  // initialize the SD card indicator LEDs:
  pinMode(sdErrorLed, OUTPUT);
  pinMode(sdWriteLed, OUTPUT);

  // reserve space for the incoming data string:
  gpsData.reserve(reserveLength);

  // see if the card is present and can be initialized:
  if (!SD.begin(chipSelect)) {
    digitalWrite(sdErrorLed, HIGH);
    Serial.println("Card failed, or not present");
    cardPresent = false;
  } 
  else {
    cardPresent = true;
    Serial.println("card initialized.");
    // if the file already exists, delete the previous version:
    if  (SD.exists("datalog.txt")) {
      digitalWrite(sdWriteLed, HIGH);
      SD.remove("datalog.txt"); 
      digitalWrite(sdWriteLed, LOW);
    }
    // open the file for writing:
    dataFile = SD.open("datalog.txt", FILE_WRITE);
  }
}

void loop() {
  // while there's incoming GPS data, save it to a String: 
  while (gpsPort.available() ) {
    char inChar = (char)gpsPort.read();
    gpsData += inChar;
    lastReadLength++;

    // when you get a newline, that's the end of a NMEA sentence.
    // count the sentences.  The D2523T module sends six sentences:
    if (inChar == '\n') {
      //sentenceCount++;
    } 
  }
  if (millis() - lastCardWrite > delayTime) {

    // once you have the sixth sentence, write the String
    // to the SD card:
    //if (sentenceCount >= 6) {
    if (gpsData.length() + lastReadLength > reserveLength) {
      if (cardPresent && dataFile) {
        digitalWrite(sdWriteLed, HIGH);
        dataFile.print(gpsData);
        // make sure the card saves the data:
        dataFile.flush();
        digitalWrite(sdWriteLed, LOW);
      }// if the file isn't open, let the user know:
      else {
        digitalWrite(sdErrorLed, HIGH);
        Serial.println("error opening datalog.txt");
      } 
      // print the length of the data you wrote:
      Serial.println(gpsData);
      // clear the sentence count and the data string:
      //sentenceCount = 0;
      gpsData = "";
      lastReadLength = 0;
    }  
    lastCardWrite = millis();   
  }

}
























