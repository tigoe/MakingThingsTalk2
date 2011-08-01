
/*
 TMP36 Temperature reader/relay control with SD card read
 Context: Arduino
 Reads a TMP36 temperature sensor
 */
#include <EEPROM.h>
#include <SD.h>

const int sdChipSelect = 4;            // SD card chipSelect
const int relayPin = 2;                // pin that the relay is attached to
const long tempCheckInterval = 10000;  // time between checks (in ms)
const int thermostatAddress = 10;      // EEPROM address for thermostat
long now;                              // last temperature check time
// trigger point for the thermostat:
int thermostat = EEPROM.read(thermostatAddress);  


void setup() {
  // initialize serial communication:
  Serial.begin(9600); 
  // set the thermostat to be an output:
  pinMode(relayPin, OUTPUT);

  if (!SD.begin(sdChipSelect)) {
    // if you can't read the SD card, print the error and go on:
    Serial.println(F("initialization failed!"));
  } 
  else {
    Serial.println(F("initialization done."));
    sendFile("index.htm");  
  }
}

void loop() {
  // periodically check the temperature to see if you should
  // turn on the thermostat:
  if (millis() - now > tempCheckInterval) {
    Serial.print("Temperature: ");
    Serial.println(readSensor());
    if (checkThermostat()) {
      Serial.println("Thermostat is on");
    } 
    else {
      Serial.println("Thermostat is off");
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
void sendFile(char thisFile[]) {
  String outputString = "";      // a String to get each line of the file

  // open the file for reading:
  File myFile = SD.open(thisFile);
  if (myFile) {

    // read from the file until there's nothing else in it:
    while (myFile.available()) {
      // add the current char to the output string:
      char thisChar = myFile.read();
      outputString += thisChar; 

      // when you get a newline, send out and clear outputString:
      if (thisChar == '\n') {
        Serial.print(outputString);
        outputString = "";
      } 
    }
    // close the file:
    myFile.close();
  } 
  else {
    // if the file didn't open:
    Serial.print("I couldn't open the file.");
  } 
}



