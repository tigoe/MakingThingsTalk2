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

const int inputLength = 16;            // length of the file requested
const int relayPin = 2;                // pin that the relay is attached to
const int sdChipSelect = 4;            // SD card chipSelect
const int thermostatAddress = 10;      // address in EEPROM for storing thermostat setting
const long tempCheckInterval = 10000;  // time between checks (in ms)


char inputString[inputLength];  // for input from the browser    
char requestTypeString[7];      // what type of HTTP request: GET or POST
int nextChar = 0;               // inde counter for reqestTypeString

long now;                       // last time that server checked the temperature
int thermostat = EEPROM.read(thermostatAddress);  // trigger point for the thermostat

void setup(){
  // initialize the relay output:
  pinMode(relayPin, OUTPUT);
  // initialize serial communication:
  Serial.begin(9600);
  // give the Ethernet controller time to start:
  delay(1000);
  Serial.println(F("attempting to get address"));
  // Attempt to start via DHCP. If not, do it manually:
  if (!Ethernet.begin(mac)) {
    Ethernet.begin(mac, ip, gateway, subnet);
  }
  // print the IP address:
  Serial.print(Ethernet.localIP()[0]);
  Serial.print(".");
  Serial.print(Ethernet.localIP()[1]);
  Serial.print(".");
  Serial.print(Ethernet.localIP()[2]);
  Serial.print(".");
  Serial.println(Ethernet.localIP()[3]);
  server.begin();

  //see if the SD card is there:
  Serial.print(F("Initializing SD card..."));
  if (!SD.begin(sdChipSelect)) {
    // if you can't read the SD card, don't go on:
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
  String fileName = "";  // filename the client requests
  char inChar = 0;       // incoming character from client
  int requestType = 0;   // what type of request (GET or POST);

  // listen for incoming clients
  Client client = server.available();

  if (client) {
    // make an instance of TextFinder to look for stuff from the client:
    TextFinder  finder(client );  

    while (client.connected()) {      
      if (client.available()) {      
        // look for whatever comes before the /. It should be GET or POST:    
        if(finder.getString("","/", requestTypeString,7)){
          // Do something different for GET or POST:
          if(String(requestTypeString) == "GET " ) {
            requestType = 1;
          }
          else if(String(requestTypeString) == "POST ") {
            requestType = 2;
          }

          // gather what comes after the / into an array, because
          // it's the filename the client wants:
          while (inChar != ' ') {
            inChar = client.read();
            inputString[nextChar] = inChar;
            nextChar++;
          }

          // now you're done with the GET/POST line, process what you got:
          switch (requestType) {
          case 1:    // GET
            // do nothing with GET except send the file, below
            break;
          case 2:    //POST
            // skip the rest of the header, 
            // which ends with newline and carriage return:
            finder.find("\n\r");
            // if the client sends a value for thermostat, take it:
            if (finder.find("thermostat")) {
              int newThermostat = finder.getValue('=');
              // if it's changed, save it:
              if (thermostat != newThermostat) {
                thermostat = newThermostat;
                // save it to EEPROM:
                EEPROM.write(thermostatAddress, thermostat);
              }
            }
            break; 
          }
          // whether it's GET or POST, give them the string they asked for.
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

// send a HTTP header to the client:
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
  // response header ends with an extra linefeed:
  thisClient.println();
}

// send the file that was requested:
void sendFile(Client thisClient, char thisFile[]) {
  String outputString = "";      // a String to get each line of the file

  // open the file for reading:
  File myFile = SD.open(thisFile);
  if (myFile) {
    // send an OK header:
    sendHttpHeader(thisClient, 200);
    // read from the file until there's nothing else in it:
    while (myFile.available()) {
      // add the current char to the output string:
      char thisChar = myFile.read();
      outputString += thisChar; 

      // check for temperature variable and replace
      // (floats can't be converted to Strings, so send it directly):
      if (outputString.endsWith("$temperature")) {
        thisClient.print(readSensor());
        outputString = "&#176;C";
      } 

      // check for thermostat variable and replace:
      if (outputString.endsWith("$thermostat")) {
        outputString.replace("$thermostat", String(thermostat));
      } 

      // check for relay status variable and replace:
      if (outputString.endsWith("$status")) {
        String relayStatus = "off";
        if (checkThermostat()) {
          relayStatus = "on";
        } 
        outputString.replace("$status", relayStatus);
      } 

      // when you get a newline, send out and clear outputString:
      if (thisChar == '\n') {
        thisClient.print(outputString);
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

// clear the input char array:
void clearInput() {
  for (int c = 0; c < inputLength; c++) {
    inputString[c] = 0;
    nextChar = 0;
  } 
}

// read the temperature sensor:
float readSensor() {
  // read the value from the sensor:
  int sensorValue = analogRead(A0);
  // convert the reading to millivolts:
  float voltage = sensorValue *  (5.0/ 1024); 
  // convert the millivolts to temperature  in celsius (100mv per degree):
  float temperature = (voltage - 0.5)* 100;
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

