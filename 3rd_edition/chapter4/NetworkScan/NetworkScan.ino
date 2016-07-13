/*
  network scan
  context: Arduino, with WINC1500 module
*/
#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules

void setup() {
  Serial.begin(9600);  //Initialize serial communications
}

void loop() {
  printMacAddress();  // Print WiFi MAC address
  listNetworks();     // scan for existing networks
  delay(10000);       // wait 10 seconds until next scan
}

void printMacAddress() {
  Serial.print("MAC address: ");
  byte mac[6];                  // array to hold the MAC address
  WiFi.macAddress(mac);         // get MAC address
  for (int i = 5; i > 0; i--) { // loop from 5 to 1
    if (mac[i] < 9) {           // if the byte is less than 1 hex digit
      Serial.print("0");        // add a 0
    }
    Serial.print(mac[i], HEX);  // print byte of MAC address
    Serial.print(":");          // print colon
  }
  Serial.println(mac[0], HEX);  // println final byte of address
}

void listNetworks() {
  Serial.print("Scanning for available networks:");
  int numSsid = WiFi.scanNetworks();
  if (numSsid == -1)  {
    Serial.println("Couldn't get a wifi connection");
    return;     // return to the main loop
  }
  // print the number of available networks:
  Serial.println(numSsid);
  // print the network number and name for each network found:
  for (int thisNet = 0; thisNet < numSsid; thisNet++) {
    String message = WiFi.SSID(thisNet);
    message += "\tSignal Strength: ";
    message += WiFi.RSSI(thisNet);
    message += " dBm \tEncryption:";
    message += WiFi.encryptionType(thisNet);
    Serial.println(message);
  }
  Serial.println();
}

