/*
 GPS Datalogger
 Context: Arduino
 */

#include <SD.h>
//#include <SoftwareSerial.h>

// set up a software serial port for the GPS receiver
// using pins 7 and 8 (7 is the Arduino's RX, 8 is TX)
//SoftwareSerial gpsPort(7, 8);

// On the Arduino Ethernet Shield, CS for the SD card is pin 4. 
// Note that even if it's not  used as the CS pin, the SPI hardware 
// CS pin (10 on most Arduino boards, 53 on the Mega) must be 
// left as an output or the SD library functions will not work.
const int chipSelect = 8;

const int sdErrorLed = 2;     // lights when there's an error with the SD card
const int sdWriteLed = 6;     // lights when writing to the SD card

File dataFile;                // the file to write to on the SD card
String gpsData = "";          // String to gather data for writing to SD card
int lastReadLength = 0;       // length of the last batch of data
int lastLength = 0;
int reserveLength = 768;     // memory reserved for the String holding the data

long lastIdleTime = 0;    // last time a GPS senstence arrived
long delayTime = 250;         // how long to wait before starting an SD write

void setup() {
  Serial.begin(4800);          // hardware serial is only being used for debugging   
 // gpsPort.begin(9600);         // the GPS receiver is attached to the soft serial

  Serial.print("Initializing SD card...");
  // make sure that the default SPI chip select pin 
  // is set to output:
  pinMode(10, OUTPUT);

  // initialize the SD card indicator LEDs:
  pinMode(sdErrorLed, OUTPUT);
  pinMode(sdWriteLed, OUTPUT);

  // reserve space for the incoming data string:
  gpsData.reserve(reserveLength);

  // see if the card is present and can be initialized:
  if (!SD.begin(chipSelect)) {
    // if the card's not working, let the user know:
    digitalWrite(sdErrorLed, HIGH);
    Serial.println("Card failed, or not present");
  } 
  else {
    // if the card's working, initialize the data file:
    Serial.println("card initialized.");
    // if the file already exists, delete the previous version:
    
    // open the file for writing:
    dataFile = SD.open("gpslog.txt", FILE_WRITE);
   
  }
  delay(1000);
}

void loop() {
  // while there's incoming GPS data, save it to a String: 
  while (Serial.available() ) {
    char inChar = Serial.read();
    gpsData += inChar;
  }
  if (gpsData.length() != lastLength) {
    lastIdleTime = millis();
  }
  lastLength = gpsData.length();

  if (millis() - lastIdleTime > delayTime) {
    if (gpsData.length() > reserveLength/2) {
      if (dataFile) {
        // indicate that the card is being accessed:
        digitalWrite(sdWriteLed, HIGH);
        // write the current data to the card:
        dataFile.print(gpsData);
        // make sure the card saves the data:
        dataFile.flush();
        digitalWrite(sdWriteLed, LOW);
       }    // if the file isn't open, let the user know:
      else {
        Serial.print(gpsData);
        digitalWrite(sdErrorLed, HIGH);
        Serial.println("error opening datalog.txt");
      }
      gpsData = ""; 
    }
  }

}





























