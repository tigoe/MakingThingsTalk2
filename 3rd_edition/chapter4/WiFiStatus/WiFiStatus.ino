/*
  WiFi Status check
  Context: Arduino, with WINC1500 module
  This sketch is not identical with the ESP8266WiFi library. 
  Check that library's online examples for changes
*/

#include <SPI.h>
#include <WiFi101.h>
//#include <ESP8266WiFi.h>    // use this instead of WiFi101 for ESP8266 modules
#include "config.h"

void setup() {
  Serial.begin(9600);
  Serial.println("Starting");
  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(ssid);           // print the network name (SSID)
    WiFi.begin(ssid, pass);         // try to connect
    delay(2000);                    // wait 2 seconds before next attempt
  }
}

void loop() {
  printWiFiStatus();
  delay(10000);
}

void printWiFiStatus() {
  // print the SSID of the WiFi AP to which you're attached:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print the gateway address of the WiFi AP to which you're attached:
  IPAddress ip = WiFi.gatewayIP();
  Serial.print("Gateway IP Address: ");
  Serial.println(ip);

  // print the subnet mask of the WiFi AP to which you're attached:
  IPAddress subnet = WiFi.subnetMask();
  Serial.print("Netmask: ");
  Serial.println(subnet);

  // print the MAC address of the WiFi AP to which you're attached:
  byte apMac[6];
  WiFi.BSSID(apMac);
  Serial.print("BSSID (Base station's MAC address): ");
  for (int i = 0; i < 5; i++) { // loop from 0 to 4
    if (apMac[i] < 0x10) {      // if the byte is less than 16 (0x0A hex)
      Serial.print("0");        // print a 0 to the string
    }
    Serial.print(apMac[i], HEX);// print byte of MAC address
    Serial.print(":");          // add a colon
  }
  Serial.println(apMac[5], HEX);// println final byte of address

  // print your MAC address:
  byte mac[6];
  WiFi.macAddress(mac);
  Serial.print("Device MAC address: ");
  for (int i = 5; i > 0; i--) { // loop from 5 to 1
    if (mac[i] < 0x10) {        // if the byte is less than 16 (0x0A hex)
      Serial.print("0");        // print a 0 to the string
    }
    Serial.print(mac[i], HEX);  // print byte of MAC address
    Serial.print(":");          // add a colon
  }
  Serial.println(mac[0], HEX);  // println final byte of address

  // print your  IP address:
  IPAddress gateway = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(gateway);

  // print the received signal strength from the WiFi AP:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  Serial.println();
}


