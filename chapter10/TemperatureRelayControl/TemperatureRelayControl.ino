/*
 TMP36 Temperature reader/relay control
 Context: Arduino
 Reads a TMP36 temperature sensor
 */

#include <EEPROM.h>

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
  // constrain the thermostat to an acceptable range:
  thermostat = constrain(thermostat, 20, 40);  
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



