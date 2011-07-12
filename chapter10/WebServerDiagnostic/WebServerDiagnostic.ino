
/*
 GET/POST Web server with SD card read
 Context: Arduino
 Reads a TMP36 temperature sensor
 */
#include <SD.h>
#include <EEPROM.h>
#include <SPI.h>
#include <Ethernet.h>
#include <TextFinder.h>

// configuration for the Ethernet connection:
byte mac[] = {  
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,255,0);
IPAddress ip(192,168,1,20);

// Initialize the Ethernet server library:
Server server(80);

const int fileStringLength = 16;       // length of the file requested
const int typeLength = 5;              // length of GET or POST
const int sdChipSelect = 4;            // SD card chipSelect
const int relayPin = 2;                // pin that the relay is attached to
const long tempCheckInterval = 10000;  // time between checks (in ms)
const int thermostatAddress = 10;      // EEPROM address for thermostat


char fileString[fileStringLength];     // for input from the browser  
char requestTypeString[typeLength];    // what type of HTTP request: GET or POST

long now;                              // last temperature check time
int thermostat = EEPROM.read(thermostatAddress);  // trigger point for the thermostat


void setup() {
  // initialize serial communication:
  Serial.begin(9600);
  // set the thermostat to be an output:
  pinMode(relayPin, OUTPUT);

  //see if the SD card is there:
  Serial.print(F("Initializing SD card..."));
  if (!SD.begin(sdChipSelect)) {
    // if you can't read the SD card, don't go on:
    Serial.println(F("initialization failed!"));
  } 
  else {
    Serial.println(F("initialization done."));
  }

  // give the Ethernet controller time to start:
  delay(1000);
  Serial.println(F("attempting to get address"));
  // Attempt to start via DHCP. If not, do it manually:
  if (!Ethernet.begin(mac)) {
    Ethernet.begin(mac, ip, gateway, subnet);
  }
  // print IP address and start the server:
  Serial.println(Ethernet.localIP());
  server.begin();
}

void loop() {
  String fileName = "";  // filename the client requests
  char inChar = 0;       // incoming character from client
  int requestType = 0;   // what type of request (GET or POST);
  int requestedFileLength = 0;  // length of the filename they asked for

  // listen for incoming clients:
  Client client = server.available();  

  if (client) {     
   
    // make an instance of TextFinder to look for stuff from the client:
    TextFinder finder(client );  
    while (client.connected()) {    
      if (client.available()) {
        char thisChar = client.read();
        Serial.write(thisChar);
      }

      if (Serial.available() > 0) {
        if (Serial.read() == 'a') {
          sendFile(client, "voice.xml"); 
          // give the client time to receive the data:
          delay(1);
          // close the connection:
          Serial.println(F("Closing the connection"));
          client.stop();
        }
      }
    }
  }

  // periodically check the temperature to see if you should
  // turn on the thermostat:
  if (millis() - now > tempCheckInterval) {
    // Serial.print("Temperature: ");
    //Serial.println(readSensor());
    if (checkThermostat()) {
      //  Serial.println("Thermostat is on");
    } 
    else {
      //  Serial.println("Thermostat is off");
    }
    now = millis();
  }
}

// read the temperature sensor:
float readSensor() {
  // read the value from the sensor:
  int sensorValue = analogRead(A0);
  // convert the reading to volts:
  float voltage = (sensorValue *  5.0) / 1024.0; 
  // convert the voltage to temperature  in celsius
  // (100mv per degree - 500mV offset):
  float temperature = (voltage - 0.5) * 100;
  // return the temperature:
  return temperature; 
}

// Check the temperature and control the relay accordingly:
boolean checkThermostat() {
  // assume the relay should be off:
  boolean relayState = LOW;  
  // if the temperature's greater than the thermostat point, 
  // the relay should be on:
  if(readSensor() > thermostat) {
    relayState = HIGH;
  }
  // set the relay on or off:
  digitalWrite(relayPin, relayState); 
  return relayState; 
}

// send the file that was requested:
void sendFile(Client thisClient, char thisFile[]) {
  String outputString = "";      // a String to get each line of the file
  Serial.println(thisFile);
  // open the file for reading:
  File myFile = SD.open(thisFile);
  if (myFile) {
    Serial.print("Content-Length:");
    Serial.println(myFile.size());
    // send an OK header:
    //sendHttpHeader(thisClient, 200);
    // read from the file until there's nothing else in it:
    while (myFile.available()) {
      thisClient.write(myFile.read());
//      // check for temperature variable and replace
//      // (floats can’t be converted to Strings, so send it directly):
//      if (outputString.endsWith("$temperature")) {
//        thisClient.print(readSensor());
//        outputString = "&#176;C";
//      } 
//
//      // check for thermostat variable and replace:
//      if (outputString.endsWith("$thermostat")) {
//        outputString.replace("$thermostat", String(thermostat));
//      } 
//
//      // check for relay status variable and replace:
//      if (outputString.endsWith("$status")) {
//        String relayStatus = "off";
//        if (checkThermostat()) {
//          relayStatus = "on";
//        } 
//        outputString.replace("$status", relayStatus);
//      } 
//
//
//      // add the current char to the output string:
//      char thisChar = myFile.read();
//      outputString += thisChar; 
//
//      // when you get a newline, send out and clear outputString:
//      if (thisChar == '\n') {
//        thisClient.print(outputString);
//        Serial.print(outputString);
//        outputString = "";
//      } 
    }
    // close the file:
    myFile.close();
  } 
  else {
    // if the file didn't open:
  //  sendHttpHeader(thisClient, 404);
  } 
}



// send a HTTP header to the client:
void sendHttpHeader(Client thisClient, int errorCode) {
  thisClient.print(F("HTTP/1.1 "));
  switch(errorCode) {
  case 200:      // OK
    thisClient.println(F("200 OK"));
    thisClient.println(F("Server: Arduino"));
    thisClient.println(F("Content-Type: text/xml"));
    thisClient.println(F("Content-Length: 600"));
    break;
  case 404:    // file not found
    thisClient.println(F("404 Not Found"));
    break;
  }
  // response header ends with an extra linefeed:
  thisClient.println();
}



