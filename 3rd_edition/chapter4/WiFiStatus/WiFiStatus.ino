/*
  WiFi Status check
  Context: Arduino, with WINC1500 module
  This sketch is not identical with the ESP8266WiFi library.
  Check that library's online examples for changes.
  Some changes are noted in the comments below
*/

#include <SPI.h>
//#include <WiFi101.h>        // use this for MKR1000 boards
//#include <ESP8266WiFi.h>  // use this instead of WiFi101 for ESP8266 modules
#include <WiFiNINA.h>       // use this for MKR1010 and Nano 33 IoT boards
#include "arduino_secrets.h"

void setup() {
  Serial.begin(9600);
  Serial.println("Starting");
  // while you're not connected to a WiFi AP,
  while ( WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to Network named: ");
    Serial.println(SECRET_SSID);           // print the network name (SSID)
    WiFi.begin(SECRET_SSID, SECRET_PASS);  // try to connect
    delay(5000);                    // wait 2 seconds before next attempt
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
  // note: BSSID won't work on the ESP8266, so comment this block out for that processor
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

  /*
     NOTE: ESP stores MAC address in the reverse order that WIFi101 does.
     For WiFi101, loop from mac[5] to mac[0]. For ESP, loop from
     mac[0] to mac[5]

  */
  for (int i = 5; i > 0; i--) { // loop from 5 to 1  -- for WiFi101
    //    for (int i = 0; i < 5; i++) { // loop from 1 to 5 -- for ESP8266

    if (mac[i] < 0x10) {        // if the byte is less than 16 (0x0A hex)
      Serial.print("0");        // print a 0 to the string
    }
    Serial.print(mac[i], HEX);  // print byte of MAC address
    Serial.print(":");          // add a colon
  }
  Serial.println(mac[0], HEX);  // println final byte of address  -- for WiFi101
  //Serial.println(mac[5], HEX);  // println final byte of address  -- for ESP8266

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
