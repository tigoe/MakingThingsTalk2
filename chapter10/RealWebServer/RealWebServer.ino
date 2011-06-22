/*
  web server with HTML from an SD card
 This sketch takes HTTP requests from the Ethernet shield,
 opens an HTML file from an SD card, replaces the <body> tag with 
 <body bgcolor= followed by the values of three analog sensors in hex,
 and serves them out.
 
 This example uses the String library, which is part of the Arduino core from
 version 0019.  
 
 Circuit:
 * Analog sensor attached to analog in 0
 * Ethernet shield attached to pins 10, 11, 12, 13
 * SD card SS attached to pins 4
 
 created 23 Dec 2010
 modified 22 June 2011
 by Tom Igoe
 
 This code is in the public domain.
 
 */
#include <SPI.h>
#include <Ethernet.h>
#include <TextFinder.h>
#include <SD.h>
#include <EEPROM.h>

byte mac[] = {  
  0x00, 0xAA, 0xBB, 0xCC, 0xDE, 0x01 };
IPAddress gateway(192,168,1,1);
IPAddress subnet(255,255,0,0);
IPAddress ip(192,168,1,20);



// Initialize the Ethernet server library
// with the IP address and port you want to use 
// (port 80 is default for HTTP):
Server server(80);

const int inputLength = 16;
char inputString[inputLength];  // for input from the browser    
int nextChar = 0;
char buffer[8];

const int relayPin = 2;         // pin that the relay is attached to
const int sdChipSelect = 4;     // SD card chipSelect
const int thermostatAddress = 10;  // address in EEPROM for storing thermostat setting

int thermostat = EEPROM.read(thermostatAddress);            // trigger point for the thermostat

long now;                       // last time that server checked the temperature

const long tempCheckInterval = 10 * 1000;  // time between checks (in ms)


void setup(){
  pinMode(relayPin, OUTPUT);
  Serial.begin(9600);
  delay(1000);
  Serial.println(F("attempting to get address"));
  // start the Ethernet connection and the server:
  if (!Ethernet.begin(mac)) {
    Ethernet.begin(mac, ip, gateway, subnet);
  }
  Serial.print(Ethernet.localIP()[0]);
  Serial.print(".");
  Serial.print(Ethernet.localIP()[1]);
  Serial.print(".");
  Serial.print(Ethernet.localIP()[2]);
  Serial.print(".");
  Serial.println(Ethernet.localIP()[3]);
  server.begin();


  Serial.print(F("Initializing SD card..."));

  if (!SD.begin(4)) {
    Serial.println(F("initialization failed!"));
    return;
  }
  Serial.println(F("initialization done."));
  // clear the inputString array:
  clearInput();
  // constrain the thermostat to an acceptable range:
  thermostat = constrain(thermostat, 20, 40);  
  // check the temperature and turn on the thermostat if needed:
  checkThermostat();
}

void loop() {
  // listen for incoming clients
  Client client = server.available();
  String fileName = "";
  char inChar = 0; 
  int requestType = 0;

  if (client) {
    TextFinder  finder(client );  

    while (client.connected()) {      
      if (client.available()) {      
        // look for whatever comes before the /. It should be GET or POST:    
        if(finder.getString("","/", buffer,8)){
          // Do something different for GET or POST:
          if(String(buffer) == "GET " ) {
            requestType = 1;
          }
          else if(String(buffer) == "POST ") {
            requestType = 2;
          }

          // gather what comes after the / into an array, because
          // it's the filename the client wants:
          inChar = client.read();
          while (inChar != ' ') {
            inputString[nextChar] = inChar;
            nextChar++;
            Serial.write(inChar);
            inChar = client.read();
          }

          switch (requestType) {
          case 1:    // GET
            // for the moment, we'll do nothing with GET
            // except respond with the file, see below.
            break;

          case 2:  //POST
            // skip the rest of the header, 
            // which ends with newline and carriage return:
            finder.find("\n\r");
            // if the client sends a value for thermostat, take it:
            if (finder.find("thermostat")) {
              int newThermostat = finder.getValue('=');
              if (thermostat != newThermostat) {
                thermostat = newThermostat;
                // save it to EEPROM:
                EEPROM.write(thermostatAddress, thermostat);
              }
            }
            break; 
          }
          // whether it's GET or POST, give them the string they asked for:
          // if there's nothing after the /, then the client wants the index:
          if (nextChar == 0) {
            sendFile(client, "index.htm");
          }             
          // otherwise send whatever file they asked for:
          else  {
            sendFile(client, inputString);
          }
        }

        // give the client time to receive the data:
        delay(1);
        // close the connection:
        Serial.println(F("Closing the connection"));
        client.stop();
        // clear the inputString array for the next request:
        clearInput();
      }
    }
  }
  // periodically check the temperature to see if you should
  // turn on the thermostat:
  if (millis() - now > tempCheckInterval) {
    checkThermostat();
    now = millis();
  }
}

void sendHttpHeader(Client thisClient, int errorCode) {
  thisClient.print(F("HTTP/1.1 "));
  switch(errorCode) {
  case 200:      // OK
    thisClient.println(F("200 OK"));
    thisClient.println(F("Content-Type: text/html"));
    break;
  case 404:    // file not found
    thisClient.println(F("404 Not Found"));
    break;
  }
  thisClient.println();
}

void sendFile(Client thisClient, char thisFile[]) {
  Serial.println(thisFile);
  // open the file for reading:
  File myFile = SD.open(thisFile);
  String outputString = "";

  if (myFile) {
    sendHttpHeader(thisClient, 200);
    // read from the file until there's nothing else in it:
    while (myFile.available()) {
      char thisChar = myFile.read();
      outputString += thisChar; 
      // check for temp variable:
      if (outputString.endsWith("$temperature")) {
        thisClient.print(readSensor());
        outputString = "&#176;C";
      } 

      // check for thermostat variable:
      if (outputString.endsWith("$thermostat")) {
        outputString.replace("$thermostat", String(thermostat));
      } 

      // check for thermostat variable:
      if (outputString.endsWith("$status")) {
        String status = "off";
        if (checkThermostat()) {
          status = "On";
        } 
        outputString.replace("$status", status);
      } 

      // onthe neline, print out and clear outputString:
      if (thisChar == '\n') {
        thisClient.println(outputString);
        outputString = "";
      } 
    }
    // close the file:
    myFile.close();
  } 
  else {
    // if the file didn't open, send a 404 error:
    sendHttpHeader(thisClient, 404);
  } 
}


void clearInput() {
  for (int c = 0; c < inputLength; c++) {
    inputString[c] = 0;
    nextChar = 0;
  } 
}

float readSensor() {
  // read the value from the sensor:
  int sensorValue = analogRead(A0);
  // convert the reading to millivolts:
  float voltage = sensorValue *  (5.0/ 1024); 
  // convert the millivolts to temperature celsius:
  float temperature = (voltage - 0.5)* 100;
  // print the temperature:
  return temperature; 
}

boolean checkThermostat() {
  boolean relayState;  
  if(thermostat > readSensor()) {
    relayState = LOW; 
  }
  if(thermostat <= readSensor()) {
    relayState = HIGH;
  }
  digitalWrite(relayPin, relayState); 
  return relayState; 
}






